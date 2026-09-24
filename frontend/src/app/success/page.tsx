 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stepper } from "@/components/layout/Stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, FileText, Check, Printer } from "lucide-react"
import { usePrintStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function SuccessPage() {
  const router = useRouter()
  const { session, order, document, payment, reset } = usePrintStore()

  useEffect(() => {
    if (!session || !order || !document || !payment) {
      router.push("/")
    }
  }, [session, order, document, payment, router])

  if (!order || !document || !payment) return null

  const handleDone = () => {
    reset()
    router.push("/")
  }

  // Future-proof for webhooks by defining timeline states
  const timelineSteps = [
    { label: "Payment confirmed", status: "completed" },
    { label: "Added to print queue", status: "completed" },
    { label: "Printing", status: "current" },
    { label: "Completed", status: "upcoming" },
  ]

  return (
    <div className="flex-1 flex flex-col bg-background">
      <Stepper currentStep={4} />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl flex flex-col items-center justify-start mt-8">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Print Request Received</h1>
            <p className="text-muted text-lg">Your payment was successful and printing has started.</p>
          </div>
        </div>

        <Card className="w-full border-border bg-surface shadow-sm mb-8">
          <CardContent className="p-0">
            <div className="p-6 border-b border-border bg-gray-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Order Number</p>
                <p className="text-lg font-bold text-ink">{order.order_number}</p>
              </div>
              <div className="bg-white p-2 rounded border border-border">
                <Printer className="h-6 w-6 text-primary-blue" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Status Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">Print Status</h3>
                <div className="space-y-4">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div 
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2",
                            step.status === "completed" ? "bg-success border-success" : 
                            step.status === "current" ? "border-primary-blue bg-white" : 
                            "border-border bg-gray-50"
                          )}
                        >
                          {step.status === "completed" && <Check className="h-3.5 w-3.5 text-white" />}
                          {step.status === "current" && <div className="h-2 w-2 rounded-full bg-primary-blue animate-pulse" />}
                        </div>
                        {idx !== timelineSteps.length - 1 && (
                          <div className={cn(
                            "h-full w-[2px] min-h-[24px] mt-1",
                            step.status === "completed" ? "bg-success" : "bg-border"
                          )} />
                        )}
                      </div>
                      <div className="pt-0.5 pb-2">
                        <p className={cn(
                          "text-sm font-medium",
                          step.status === "completed" ? "text-ink" :
                          step.status === "current" ? "text-primary-blue font-bold" :
                          "text-muted"
                        )}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex justify-between items-start text-sm mb-3">
                  <span className="text-muted">Document</span>
                  <span className="font-medium text-ink max-w-[200px] truncate">{document.original_name}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted">Copies</span>
                  <span className="font-medium text-ink">{order.copies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total Paid</span>
                  <span className="font-medium text-ink text-base">₹{payment.amount}</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <p className="text-muted text-sm text-center mb-6">
          Please collect your document from the printer when complete.
        </p>
        
        <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px]" onClick={handleDone}>
          Print another document
        </Button>

      </div>
    </div>
  )
}
