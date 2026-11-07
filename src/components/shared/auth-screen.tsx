"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Command,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Badge, Button, Card, Input, Label } from "@/components/ui"
import { Brand } from "@/components/layout/brand"

export interface AuthScreenProps {
  close?: () => void
  initialMode?: "login" | "register"
}

interface ApiErrorDetail {
  field?: string
  message: string
  code?: string
}

/**
 * Extracts a specific, user-friendly error message from the standard API response.
 * Prefers detailed field-level validation messages (e.g. from Zod) over generic high-level messages.
 */
function extractErrorMessage(data: unknown, fallbackMessage: string): string {
  if (!data || typeof data !== "object") return fallbackMessage

  const errorObj = (
    data as {
      error?: {
        message?: string
        details?: (ApiErrorDetail | string)[] | string
      }
    }
  ).error

  if (!errorObj) return fallbackMessage

  // 1. If detailed field errors exist (e.g. Zod validation issues), display their specific message(s)
  if (Array.isArray(errorObj.details) && errorObj.details.length > 0) {
    const detailMessages = errorObj.details
      .map((d) => (typeof d === "string" ? d : d.message))
      .filter(Boolean)

    if (detailMessages.length > 0) {
      return detailMessages.join(". ")
    }
  }

  // 2. If details is a direct string
  if (typeof errorObj.details === "string" && errorObj.details.trim()) {
    return errorObj.details
  }

  // 3. Fallback to top-level error message
  if (errorObj.message && typeof errorObj.message === "string") {
    return errorObj.message
  }

  return fallbackMessage
}

export function AuthScreen({ close, initialMode = "login" }: AuthScreenProps) {
  const [register, setRegister] = useState(initialMode === "register")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleModeSwitch = (newModeIsRegister: boolean) => {
    setRegister(newModeIsRegister)
    setErrorMessage("")
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage("")

    // Basic client-side validation
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.")
      return
    }

    if (!password) {
      setErrorMessage("Please enter your password.")
      return
    }

    if (register) {
      const trimmedName = name.trim()
      if (!trimmedName) {
        setErrorMessage("Please enter your full name.")
        return
      }

      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.")
        return
      }

      if (!/[a-zA-Z]/.test(password)) {
        setErrorMessage("Password must contain at least one letter.")
        return
      }

      if (!/[0-9]/.test(password)) {
        setErrorMessage("Password must contain at least one number.")
        return
      }
    }

    setIsLoading(true)

    try {
      if (register) {
        // Register API call
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: trimmedEmail,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          const message = extractErrorMessage(data, "Registration failed. Please try again.")
          setErrorMessage(message)
          setIsLoading(false)
          return
        }

        // Auto-login upon successful registration
        const loginRes = await signIn("credentials", {
          email: trimmedEmail,
          password,
          redirect: false,
        })

        if (loginRes?.error) {
          // Registered but auto-login failed; switch to login view
          setRegister(false)
          setErrorMessage("Account created successfully! Please sign in with your password.")
          setIsLoading(false)
          return
        }

        if (close) {
          close()
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        // Credentials Login
        const result = await signIn("credentials", {
          email: trimmedEmail,
          password,
          redirect: false,
        })

        if (result?.error) {
          setErrorMessage("Invalid email or password. Please review your credentials.")
          setIsLoading(false)
          return
        }

        if (close) {
          close()
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrorMessage("")
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch {
      setErrorMessage("Failed to initiate Google sign in. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <Link href="/dashboard" className="inline-block transition-opacity hover:opacity-90">
            <Brand />
          </Link>
        </div>
        <div className="relative my-auto max-w-xl">
          <Badge className="mb-6 bg-white/10 text-white">
            <Sparkles className="mr-1 size-3" />
            Spaced repetition for developers
          </Badge>
          <div className="text-5xl font-bold leading-tight tracking-tight">
            Stop solving once.
            <br />
            <span className="text-indigo-300">Start remembering.</span>
          </div>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            A deliberate practice system that turns solved problems into lasting
            problem-solving patterns.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["148", "Problems tracked"],
              ["84%", "Revision rate"],
              ["12", "Day streak"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-2xl font-bold">{v}</div>
                <div className="mt-1 text-xs text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-sm text-slate-400">
          Built for focused, consistent practice.
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-0 p-7 shadow-xl shadow-slate-900/10 sm:p-9">
          <div className="mb-8 lg:hidden">
            <Link href="/dashboard" className="inline-block">
              <Brand />
            </Link>
          </div>
          <div className="text-2xl font-bold">
            {register ? "Create your account" : "Welcome back"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {register
              ? "Start building durable DSA skills today."
              : "Continue your path to problem-solving mastery."}
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {register && (
              <div>
                <Label htmlFor="auth-name">Full name</Label>
                <Input
                  id="auth-name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <Label htmlFor="auth-email">Email address</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="Enter your emai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="auth-password">Password</Label>
                {!register && (
                  <button
                    type="button"
                    tabIndex={-1}
                    className="mb-2 text-xs font-semibold text-primary hover:underline"
                    onClick={() => setErrorMessage("Password reset is not yet configured.")}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete={register ? "new-password" : "current-password"}
              />
            </div>
            {register && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                <CheckCircle2
                  className={`size-4 shrink-0 ${
                    password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
                      ? "text-success"
                      : "text-muted-foreground/40"
                  }`}
                />
                At least 8 characters with letters and numbers
              </div>
            )}
            <Button className="w-full" size="lg" type="submit" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {register ? "Creating account…" : "Signing in…"}
                </>
              ) : (
                <>
                  {register ? "Create account" : "Sign in"}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            OR
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            className="w-full"
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting to Google…
              </>
            ) : (
              <>
                <Command className="size-4" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="mt-7 text-center text-sm text-muted-foreground">
            {register ? "Already have an account?" : "New to DSA Mastery?"}
            {close ? (
              <button
                type="button"
                className="ml-1 font-semibold text-primary hover:underline"
                onClick={() => handleModeSwitch(!register)}
              >
                {register ? "Sign in" : "Create an account"}
              </button>
            ) : (
              <Link
                className="ml-1 font-semibold text-primary hover:underline"
                href={register ? "/login" : "/register"}
                onClick={() => handleModeSwitch(!register)}
              >
                {register ? "Sign in" : "Create an account"}
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
