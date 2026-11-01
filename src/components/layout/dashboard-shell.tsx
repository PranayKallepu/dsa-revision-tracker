"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ProblemsProvider } from "@/hooks/use-problems"

export interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [menu, setMenu] = useState(false)

  return (
    <ProblemsProvider>
      <div className="min-h-screen">
        <Sidebar open={menu} close={() => setMenu(false)} />
        <div className="lg:pl-72">
          <Header openMenu={() => setMenu(true)} />
          <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProblemsProvider>
  )
}
