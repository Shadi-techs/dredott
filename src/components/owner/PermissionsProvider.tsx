'use client'
// src/components/owner/PermissionsProvider.tsx
//
// Resolves and exposes the current user's permission set for the owner
// account they're viewing. Provides a `viewAs` override so the actual
// owner can preview the portal as one of their team roles without
// touching the DB.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  Perms, RoleId, loadPermissions, permsForRole, PERM_KEYS,
} from '@/lib/owner/permissions'

interface Ctx {
  ownerId: string | null
  isOwner: boolean        // true if auth.uid() === ownerId AND not previewing
  perms: Perms
  // "View as" preview — only available when isOwner is truly true
  viewAs: RoleId
  setViewAs: (r: RoleId) => void
  loading: boolean
}

const PermsCtx = createContext<Ctx | null>(null)

const ALL_TRUE  = PERM_KEYS.reduce((a, k) => ({ ...a, [k]: true  }), {} as Perms)
const ALL_FALSE = PERM_KEYS.reduce((a, k) => ({ ...a, [k]: false }), {} as Perms)

interface ProviderProps {
  children: ReactNode
  /** auth.uid() of the current user */
  userId: string
  /** The owner account being viewed. For an owner: their own ID.
   *  For a team member: their parent_owner_id from profiles. */
  ownerId: string
}

export function PermissionsProvider({ children, userId, ownerId }: ProviderProps) {
  const [perms, setPerms]       = useState<Perms>(ALL_FALSE)
  const [loading, setLoading]   = useState(true)
  const [viewAs, setViewAsState] = useState<RoleId>('owner')

  const trueOwner = userId === ownerId

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadPermissions(ownerId).then((p) => {
      if (!cancelled) {
        setPerms(p)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [ownerId])

  // When the actual owner toggles "View as", recompute effective perms
  // from the role catalog instead of the DB.
  const effective = trueOwner && viewAs !== 'owner' ? permsForRole(viewAs) : perms

  const value: Ctx = {
    ownerId,
    isOwner: trueOwner && viewAs === 'owner',
    perms: effective,
    viewAs: trueOwner ? viewAs : 'owner',
    setViewAs: trueOwner ? setViewAsState : () => {},
    loading,
  }

  return <PermsCtx.Provider value={value}>{children}</PermsCtx.Provider>
}

export function usePerms(): Ctx {
  const v = useContext(PermsCtx)
  if (!v) throw new Error('usePerms must be used inside <PermissionsProvider>')
  return v
}

// Convenience hook
export function useCan(permKey: keyof Perms): boolean {
  const { perms } = usePerms()
  return perms[permKey]
}
