"use client"

import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group font-sans"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium rounded-lg",
          success:
            "group-[.toaster]:border-emerald-500/20 group-[.toaster]:text-foreground",
          error:
            "group-[.toaster]:border-destructive/20 group-[.toaster]:text-foreground",
          warning:
            "group-[.toaster]:border-amber-500/20 group-[.toaster]:text-foreground",
          info:
            "group-[.toaster]:border-blue-500/20 group-[.toaster]:text-foreground",
        },
      }}
      richColors
      closeButton
      {...props}
    />
  )
}

export { toast }

