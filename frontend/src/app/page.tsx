/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { usePrintStore } from "@/lib/store"

export default function Home() {
  const router = useRouter()
  // React 19 in Next 15 may need a Suspense wrapper for useSearchParams, but we'll use a safer approach or assume Next 14/15 compat.
  // Actually, to avoid build errors, it's safer to not use useSearchParams at root level if not wrapped in Suspense,
  // But Next 13+ handles it in client components if it's dynamic. Let's just use it and see.
  // If we just want a simple UI:
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSession, reset } = usePrintStore()

  useEffect(() => {
    reset()
  }, [reset])

  const startSession = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Create session using a dummy printer_id representing the station
      const printerId = "34d2321d-04fd-4d57-9719-994f47633d0b"
const session = await apiClient.createSession(printerId)
      setSession(session)
      router.push("/upload")
    } catch (err: any) {
      setError(err.message || "Failed to start session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Printer className="h-8 w-8 text-primary-blue" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-ink">Ready to print?</CardTitle>
            <CardDescription className="text-base text-muted">
              Start your secure print session at this station.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-error/10 p-3 text-sm text-error font-medium">
              {error}
            </div>
          )}
          <Button 
            className="w-full" 
            size="lg" 
            onClick={startSession}
            isLoading={isLoading}
          >
            Start Session
          </Button>
          <p className="text-center text-xs text-muted pt-2">
            By continuing, you agree to our terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
