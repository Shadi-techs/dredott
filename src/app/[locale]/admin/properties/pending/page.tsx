// src/app/[locale]/admin/properties/pending/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { calculatePropertyScore } from '@/lib/review-scoring';

interface PropertyWithOwner {
  id: string;
  name: string;
  city: string;
  price_per_night: number;
  photos: string[];
  status: string;
  created_at: string;
  owner: { email: string; full_name: string };
}

export default function AdminPendingPropertiesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('review_status', 'pending_review')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const ownerIds = (data || []).map((p: any) => p.owner_id).filter(Boolean)
    let profileMap: Record<string, { email: string; full_name: string }> = {}

    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', ownerIds)
      ;(profiles || []).forEach((pr: any) => {
        profileMap[pr.id] = {
          email: pr.email || '',
          full_name: [pr.first_name, pr.last_name].filter(Boolean).join(' ') || 'Unknown',
        }
      })
    }

    const formatted = (data || []).map((p: any) => ({
      ...p,
      name: p.name || p.title || '(no name)',
      owner: profileMap[p.owner_id] || { email: '—', full_name: 'Unknown' },
    }));
    setProperties(formatted);
    setLoading(false);
  };

  const handleApprove = async (propertyId: string) => {
    await fetch('/api/admin/moderation/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: 'property', entity_id: propertyId }),
    });
    fetchPendingProperties();
  };

  const handleReject = async (propertyId: string, feedback: string) => {
    await supabase
      .from('properties')
      .update({ review_status: 'rejected', status: 'rejected', review_feedback: feedback })
      .eq('id', propertyId);
    fetchPendingProperties();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">
        {locale === 'ar' ? 'الوحدات قيد المراجعة' : 'Pending Properties'}
      </h1>
      {properties.length === 0 ? (
        <p className="text-gray-500">لا توجد وحدات قيد المراجعة</p>
      ) : (
        <div className="grid gap-6">
          {properties.map((prop) => {
            const scoreResult = calculatePropertyScore(
              {
                name: prop.name,
                description: 'dummy', // we need full property object; simplified for demo
                city: prop.city,
                price_per_night: prop.price_per_night,
                photos: prop.photos,
                amenities: [] // ideally fetch from actual data
              },
              locale as 'ar' | 'en'
            );
            return (
              <div key={prop.id} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{prop.name}</h3>
                    <p className="text-sm text-gray-500">{prop.city} · {prop.price_per_night} EGP/night</p>
                    <p className="text-xs text-gray-400 mt-1">Owner: {prop.owner.full_name} ({prop.owner.email})</p>
                    <div className="mt-2">
                      <span className={`text-sm font-medium ${scoreResult.isPass ? 'text-green-600' : 'text-yellow-600'}`}>
                        Score: {scoreResult.score}% {scoreResult.isPass ? '(Pass)' : '(Fail)'}
                      </span>
                      {!scoreResult.isPass && (
                        <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                          {scoreResult.missing.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(prop.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const feedback = prompt('Reason for rejection:');
                        if (feedback) handleReject(prop.id, feedback);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}