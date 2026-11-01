import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold text-primary">404</div>
      <div className="text-2xl font-semibold">Page not found</div>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
