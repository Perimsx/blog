"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type TocContextType = {
  isTocOpen: boolean
  setIsTocOpen: (open: boolean) => void
}

const TocContext = createContext<TocContextType | undefined>(undefined)

export function TocProvider({ children }: { children: ReactNode }) {
  const [isTocOpen, setIsTocOpen] = useState(false)
  
  useEffect(() => {
    // 桌面端和移动端一样，现在统一默认收起不展示面板
  }, [])

  return (
    <TocContext.Provider value={{ isTocOpen, setIsTocOpen }}>
      {children}
    </TocContext.Provider>
  )
}

export function useToc() {
  const context = useContext(TocContext)
  if (context === undefined) {
    throw new Error('useToc must be used within a TocProvider')
  }
  return context
}
