// src/app/[locale]/admin/property-managers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PropertyManagerRequest {
  id: string;
  user_id: string;
  manager_name: string;
  commercial_registration: string;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  is_verified: boolean;
  subscription_type: string;
  created_at: string;
  user_email?: string;
}

export default function AdminPropertyManagersPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [requests, setRequests] = useState<PropertyManagerRequest[]>([]);
  const [verified, setVerified] = useState<PropertyManagerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PropertyManagerRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('property_manager_profiles')
      .select(`
        *,
        user:user_id (email)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map((item: any) => ({
        ...item,
        user_email: item.user?.email,
      }));

      setRequests(formatted.filter((r: any) => !r.is_verified));
      setVerified(formatted.filter((r: any) => r.is_verified));
    }
    setLoading(false);
  };

  const handleVerify = async (id: string, accept: boolean) => {
    if (accept) {
      await supabase
        .from('property_manager_profiles')
        .update({ is_verified: true })
        .eq('id', id);
    } else {
      await supabase
        .from('property_manager_profiles')
        .delete()
        .eq('id', id);
    }
    fetchRequests();
    setSelected(null);
  };

  const handleUpgradeToPremium = async (id: string) => {
    await supabase
      .from('property_manager_profiles')
      .update({ 
        subscription_type: 'premium',
        hide_dredott_branding: true 
      })
      .eq('id', id);
    fetchRequests();
  };

  const t = {
    ar: {
      title: 'مديري العقارات',
      pending: 'قيد المراجعة',
      verified: 'موثقين',
      noPending: 'لا توجد طلبات جديدة',
      noVerified: 'لا يوجد مديري عقارات موثقين',
      details: 'تفاصيل الطلب',
      approve: 'قبول',
      reject: 'رفض',
      upgradePremium: 'ترقية إلى Premium',
      companyName: 'اسم الشركة',
      commercialReg: 'السجل التجاري',
      taxId: 'الرقم الضريبي',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      website: 'الموقع',
      address: 'العنوان',
      date: 'تاريخ التسجيل',
      close: 'إغلاق',
      premium: 'Premium',
      normal: 'Normal',
    },
    en: {
      title: 'Property Managers',
      pending: 'Pending Review',
      verified: 'Verified',
      noPending: 'No pending requests',
      noVerified: 'No verified property managers',
      details: 'Application Details',
      approve: 'Approve',
      reject: 'Reject',
      upgradePremium: 'Upgrade to Premium',
      companyName: 'Company Name',
      commercialReg: 'Commercial Registration',
      taxId: 'Tax ID',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      address: 'Address',
      date: 'Registration Date',
      close: 'Close',
      premium: 'Premium',
      normal: 'Normal',
    },
  };

  const content = locale === 'ar' ? t.ar : t.en;
  const currentList = activeTab === 'pending' ? requests : verified;

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">{content.title}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'pending'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-500 hover:text-navy'
          }`}
        >
          {content.pending} ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'verified'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-500 hover:text-navy'
          }`}
        >
          {content.verified} ({verified.length})
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          {activeTab === 'pending' ? content.noPending : content.noVerified}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy">{req.manager_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {content.commercialReg}: {req.commercial_registration}
                  </p>
                  {req.user_email && (
                    <p className="text-sm text-gray-500">Email: {req.user_email}</p>
                  )}
                  {req.phone && <p className="text-sm text-gray-500">Tel: {req.phone}</p>}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.subscription_type === 'premium' 
                        ? 'bg-gold/20 text-gold' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.subscription_type === 'premium' ? content.premium : content.normal}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {content.date}: {new Date(req.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelected(req)}
                    className="p-2 text-gray-400 hover:text-navy transition"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVerify(req.id, true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        <CheckCircleIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleVerify(req.id, false)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  {activeTab === 'verified' && req.subscription_type !== 'premium' && (
                    <button
                      onClick={() => handleUpgradeToPremium(req.id)}
                      className="px-3 py-1 bg-gold text-navy text-sm rounded-lg hover:bg-gold/90"
                    >
                      {content.upgradePremium}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for details */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-navy mb-4">{content.details}</h2>
            <div className="space-y-3">
              <p><strong>{content.companyName}:</strong> {selected.manager_name}</p>
              <p><strong>{content.commercialReg}:</strong> {selected.commercial_registration}</p>
              {selected.tax_id && <p><strong>{content.taxId}:</strong> {selected.tax_id}</p>}
              {selected.phone && <p><strong>{content.phone}:</strong> {selected.phone}</p>}
              {selected.email && <p><strong>{content.email}:</strong> {selected.email}</p>}
              {selected.website && <p><strong>{content.website}:</strong> <a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{selected.website}</a></p>}
              {selected.address && <p><strong>{content.address}:</strong> {selected.address}</p>}
              {selected.user_email && <p><strong>User Email:</strong> {selected.user_email}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              {!selected.is_verified && (
                <>
                  <button
                    onClick={() => handleVerify(selected.id, true)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    {content.approve}
                  </button>
                  <button
                    onClick={() => handleVerify(selected.id, false)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    {content.reject}
                  </button>
                </>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {content.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}