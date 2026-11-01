import { Bell, LogOut, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui"
import { SCREEN_TITLES } from "@/constants/navigation"
import type { Screen } from "@/types/navigation"

export interface HeaderProps {
  screen: Screen
  openMenu: () => void
  setAuth: (v: boolean) => void
}

export function Header({ screen, openMenu, setAuth }: HeaderProps) {
  const [title, subtitle] = SCREEN_TITLES[screen]
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Button
          className="lg:hidden"
          variant="outline"
          size="icon"
          onClick={openMenu}
        >
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </div>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {subtitle}
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Search className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-white" />
        </Button>
        <Button
          className="hidden sm:flex"
          variant="ghost"
          onClick={() => setAuth(true)}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </header>
  )
}
