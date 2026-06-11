'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AdminDarkCtx {
  dark: boolean
  toggle: () => void
}

const Ctx = createContext<AdminDarkCtx>({ dark: false, toggle: () => {} })

export function AdminDarkProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(localStorage.getItem('admin_dark_mode') === 'true')
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('admin_dark_mode', String(next))
  }

  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>
}

export const useAdminDark = () => useContext(Ctx)
