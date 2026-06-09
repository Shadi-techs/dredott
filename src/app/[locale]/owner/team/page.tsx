'use client'
// src/app/[locale]/owner/team/page.tsx
// Team Management - Invite members, assign roles, manage permissions

import { use, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Users, Plus, Mail, Clock, Check, X, Trash2 } from 'lucide-react'

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { usePerms } from '@/components/owner/PermissionsProvider'
import { RestrictedScreen } from '@/components/owner/Restricted'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { Badge } from '@/components/owner/Badge'
import { getStrings } from '@/lib/owner/strings'
import { DENSITY } from '@/lib/owner/theme'
import { toast } from '@/components/owner/Toast'

interface TeamMember {
  id: string
  member_id: string
  role: string
  status: string
  created_at: string
  last_active_at: string | null
  member: {
    first_name: string
    last_name: string
    email: string
    avatar_url: string | null
  }
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  expires_at: string
}

export default function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { t, d } = useOwnerTheme()
  const tx = getStrings(locale as any)
  const router = useRouter()
  const { perms } = usePerms()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('co_host')
  const [inviting, setInviting] = useState(false)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    // Load team members
    const { data: membersData } = await supabase
      .from('team_members')
      .select(`
        *,
        member:profiles!team_members_member_id_fkey (
          first_name, last_name, email, avatar_url
        )
      `)
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })

    if (membersData) setMembers(membersData as unknown as TeamMember[])

    // Load pending invitations
    const { data: invitesData } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('owner_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (invitesData) setInvitations(invitesData)

    setLoading(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail || inviting) return
    setInviting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Generate token
      const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15)

      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          owner_id: session.user.id,
          email: inviteEmail,
          role: inviteRole,
          token,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: session.user.id,
        })

      if (error) throw error

      // TODO: Send email via API route
      // await fetch('/api/owner/team/invite', { 
      //   method: 'POST', 
      //   body: JSON.stringify({ email: inviteEmail, token }) 
      // })

      toast.success('Invite sent!')
      setShowInviteModal(false)
      setInviteEmail('')
      void loadData()
    } catch (err: any) {
      console.error('Invite error:', err)
      toast.error(err?.message || 'Failed to send invite', 'Invite error')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member?')) return

    const { error } = await supabase.from('team_members').delete().eq('id', memberId)
    if (error) { toast.error(error.message, 'Remove failed'); return }
    toast.success('Member removed')
    void loadData()
  }

  const handleRevokeInvite = async (inviteId: string) => {
    await supabase
      .from('team_invitations')
      .update({ status: 'expired' })
      .eq('id', inviteId)

    void loadData()
  }

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      owner: tx.owner,
      co_host: tx.coHost,
      operations: tx.operations,
      accountant: tx.accountant,
      custom: tx.custom,
    }
    return map[role] || role
  }

  if (!perms.manage_team) {
    return <RestrictedScreen title={tx.teamManagement} requiredPerm="manage_team" />
  }

  if (loading) {
    return (
      <div style={{ padding: d.pad, display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{
          width: 32, height: 32, border: `3px solid ${t.border}`,
          borderTopColor: t.accent, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: d.pad }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: d.gap,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500,
            color: t.text, margin: 0, marginBottom: 4,
          }}>{tx.teamManagement}</h1>
          <p style={{
            fontSize: 13.5, color: t.textMuted, margin: 0,
          }}>
            {members.length} {tx.active} • {invitations.length} {tx.pending}
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <Plus size={16} />
          {tx.inviteMember}
        </Button>
      </div>

      {/* Active Members */}
      {members.length > 0 && (
        <Card style={{ marginBottom: d.gap }}>
          <div style={{
            fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 14,
          }}>{tx.teamMembers}</div>

          {members.map(member => (
            <div key={member.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderTop: `1px solid ${t.border}`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: t.accentSoft, color: t.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)',
                textTransform: 'uppercase', flexShrink: 0,
              }}>
                {member.member.first_name?.[0]}{member.member.last_name?.[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 500, color: t.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {member.member.first_name} {member.member.last_name}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  {member.member.email}
                </div>
              </div>

              <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>
                {getRoleLabel(member.role)}
              </Badge>

              {member.last_active_at && (
                <div style={{
                  fontSize: 11, color: t.textFaint, fontFamily: 'var(--mono)',
                }}>
                  <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {new Date(member.last_active_at).toLocaleDateString()}
                </div>
              )}

              <button
                onClick={() => handleRemove(member.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.danger, padding: 6, display: 'flex',
                }}
                title={tx.remove}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <div style={{
            fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 14,
          }}>{tx.pending} {tx.inviteMember}</div>

          {invitations.map(invite => (
            <div key={invite.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderTop: `1px solid ${t.border}`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: t.borderSoft, color: t.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Mail size={16} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 500, color: t.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {invite.email}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  {tx.pending} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                </div>
              </div>

              <Badge tone="neutral">{getRoleLabel(invite.role)}</Badge>

              <button
                onClick={() => handleRevokeInvite(invite.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.textFaint, padding: 6, display: 'flex',
                }}
                title="Revoke"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* Empty State */}
      {members.length === 0 && invitations.length === 0 && (
        <Card style={{
          minHeight: 320, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: t.accentSoft, color: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Users size={28} />
          </div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500,
            color: t.text, marginBottom: 6,
          }}>{tx.noTeamMembers}</div>
          <div style={{ fontSize: 13, color: t.textMuted, maxWidth: 340, marginBottom: 18 }}>
            Invite co-hosts, operations managers, or accountants to help manage your properties.
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus size={16} />
            {tx.inviteMember}
          </Button>
        </Card>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setShowInviteModal(false)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 101,
            background: t.surface, borderRadius: 12,
            border: `1px solid ${t.border}`, padding: 24,
            width: '90%', maxWidth: 440,
          }}>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500,
              color: t.text, margin: 0, marginBottom: 16,
            }}>{tx.inviteTeamMember}</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 500,
                color: t.textMuted, marginBottom: 6,
              }}>{tx.enterEmail}</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: `1px solid ${t.border}`, background: t.bg,
                  fontSize: 14, color: t.text, fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 500,
                color: t.textMuted, marginBottom: 6,
              }}>{tx.selectRole}</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: `1px solid ${t.border}`, background: t.bg,
                  fontSize: 14, color: t.text, fontFamily: 'inherit',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="co_host">{tx.coHost}</option>
                <option value="operations">{tx.operations}</option>
                <option value="accountant">{tx.accountant}</option>
                <option value="custom">{tx.custom}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button tone="ghost" onClick={() => setShowInviteModal(false)}>
                {tx.cancel}
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
                {inviting ? '...' : tx.sendInvite}
              </Button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
