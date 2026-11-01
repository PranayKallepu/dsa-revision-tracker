"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2, Command, Sparkles } from "lucide-react"
import { Badge, Button, Card, Input, Label } from "@/components/ui"
import { Brand } from "@/components/layout/brand"

export interface AuthScreenProps {
  close?: () => void
  initialMode?: "login" | "register"
}

export function AuthScreen({ close, initialMode = "login" }: AuthScreenProps) {
  const [register, setRegister] = useState(initialMode === "register")
  const router = useRouter()

  const handleSubmit = () => {
    if (close) {
      close()
    } else {
      router.push("/dashboard")
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
          <div className="mt-7 space-y-4">
            {register && (
              <div>
                <Label>Full name</Label>
                <Input placeholder="Alex Kumar" />
              </div>
            )}
            <div>
              <Label>Email address</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label>Password</Label>
                {!register && (
                  <button className="mb-2 text-xs font-semibold text-primary">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input type="password" placeholder="••••••••" />
            </div>
            {register && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                At least 8 characters with one number
              </div>
            )}
            <Button className="w-full" size="lg" onClick={handleSubmit}>
              {register ? "Create account" : "Sign in"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            OR
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button className="w-full" variant="outline" onClick={handleSubmit}>
            <Command className="size-4" />
            Continue with Google
          </Button>
          <div className="mt-7 text-center text-sm text-muted-foreground">
            {register ? "Already have an account?" : "New to DSA Mastery?"}
            {close ? (
              <button
                className="ml-1 font-semibold text-primary"
                onClick={() => setRegister(!register)}
              >
                {register ? "Sign in" : "Create an account"}
              </button>
            ) : (
              <Link
                className="ml-1 font-semibold text-primary"
                href={register ? "/login" : "/register"}
                onClick={() => setRegister(!register)}
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
