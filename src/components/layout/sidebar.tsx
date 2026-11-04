"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Flame, LogOut, MoreHorizontal, X } from "lucide-react"
import { Brand } from "./brand"
import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Progress,
} from "@/components/ui"
import { NAV_GROUPS } from "@/constants/navigation"
import { cn } from "@/lib/utils"
import type { Screen } from "@/types/navigation"

export interface SidebarProps {
  screen?: Screen
  setScreen?: (s: Screen) => void
  open: boolean
  close: () => void
}

export function Sidebar({ open, close }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || "Alex Kumar"
  const userEmail = session?.user?.email || "alex@example.com"
  const initials =
    userName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={close}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card p-5 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" onClick={close} className="transition-opacity hover:opacity-90">
            <Brand />
          </Link>
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            onClick={close}
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="my-6 flex-1 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                      {item.id === "revision" && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
                          5
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <Card className="mb-4 border-primary/15 bg-gradient-to-br from-indigo-50 to-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4 text-orange-500" />
            12 day streak
          </div>
          <Progress value={72} />
          <div className="mt-2 text-xs text-muted-foreground">
            3 more days to your record
          </div>
        </Card>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={userName}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{userName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </div>
              </div>
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </>
  )
}
