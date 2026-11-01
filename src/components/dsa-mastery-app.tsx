"use client"

import { useState } from "react"
import { Header, Sidebar } from "@/components/layout"
import { AuthScreen } from "@/components/shared"
import { DashboardView } from "@/features/dashboard"
import { ProblemDetails, ProblemForm, ProblemsView } from "@/features/problems"
import { RevisionWorkspace } from "@/features/revisions"
import { MasteryTest } from "@/features/mastery"
import { AnalyticsView } from "@/features/analytics"
import { ActivityHistory } from "@/features/activity"
import { ArchiveView } from "@/features/archive"
import { useProblems } from "@/hooks"
import type { Screen } from "@/types"

export function DsaMasteryApp() {
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [menu, setMenu] = useState(false)
  const [auth, setAuth] = useState(false)
  const { items, addProblem, restoreProblem } = useProblems()

  if (auth) {
    return <AuthScreen close={() => setAuth(false)} />
  }

  const renderContent = () => {
    switch (screen) {
      case "dashboard":
        return <DashboardView setScreen={setScreen} />
      case "problems":
        return <ProblemsView items={items} setScreen={setScreen} />
      case "add":
        return <ProblemForm setScreen={setScreen} addProblem={addProblem} />
      case "details":
        return <ProblemDetails setScreen={setScreen} />
      case "revision":
        return <RevisionWorkspace setScreen={setScreen} />
      case "mastery":
        return <MasteryTest setScreen={setScreen} />
      case "analytics":
        return <AnalyticsView />
      case "activity":
        return <ActivityHistory />
      case "archived":
        return <ArchiveView items={items} restore={restoreProblem} />
      default:
        return <DashboardView setScreen={setScreen} />
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        screen={screen}
        setScreen={setScreen}
        open={menu}
        close={() => setMenu(false)}
      />
      <div className="lg:pl-72">
        <Header
          screen={screen}
          openMenu={() => setMenu(true)}
          setAuth={setAuth}
        />
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
