/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Stepper } from "@/components/layout/Stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { usePrintStore } from "@/lib/store"

export default function PaymentPage() {
  const router = useRouter()
  const { session, order, document, pricing, setPayment } = usePrintStore()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "verifying" | "success" | "failed">("pending")

  useEffect(() => {
    if (!session || !order || !document || !pricing) {
      router.push("/")
    }
  }, [session, order, document, pricing, router])

  const handlePayment = async () => {
    if (!order) return

    setIsProcessing(true)
    setError(null)
    setPaymentStatus("pending")

    try {
      // 1. Create payment in backend
      const paymentResponse = await apiClient.createPayment(order.id)
      
      if (!paymentResponse.provider_order_id) {
        throw new Error("Razorpay order ID not found in response")
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: Math.round(parseFloat(paymentResponse.amount) * 100),
        currency: paymentResponse.currency || "INR",
        name: "Print Machine",
        description: `Order ${order.order_number}`,
        order_id: paymentResponse.provider_order_id,
        handler: async function (response: any) {
          try {
            setPaymentStatus("verifying")
            // 3. Verify payment in backend
            const verifiedPayment = await apiClient.verifyPayment(
              paymentResponse.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )
            setPayment(verifiedPayment)
            setPaymentStatus("success")
            router.push("/success")
          } catch (err: any) {
            setPaymentStatus("failed")
            setError(err.message || "Payment verification failed. If money was deducted, it will be refunded.")
          }
        },
        prefill: {
          name: "Print Station User"
        },
        theme: {
          color: "#2563EB"
        }
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded")
      }

      const rzp = new window.Razorpay(options)
      
      rzp.on("payment.failed", function (response: any) {
        setPaymentStatus("failed")
        setError(response.error.description || "Payment failed.")
      })
      
      rzp.open()
      
    } catch (err: any) {
      setPaymentStatus("failed")
      setError(err.message || "Failed to initiate payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!order || !document || !pricing) return null

  return (
    <div className="flex-1 flex flex-col bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Stepper currentStep={3} />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-md flex flex-col items-center justify-center">
        
        {paymentStatus === "verifying" ? (
          <Card className="w-full border-border bg-surface shadow-sm text-center py-12">
            <CardContent className="space-y-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary-blue border-t-transparent animate-spin"></div>
              <h2 className="text-xl font-bold text-ink">Verifying Payment...</h2>
              <p className="text-muted text-sm">Please do not close this window or press back.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full space-y-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-ink mb-2">Secure Checkout</h1>
              <p className="text-muted">Review your order details and pay to print.</p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 rounded-lg bg-error/10 p-4 text-error">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="font-medium text-sm">{error}</div>
              </div>
            )}

            <Card className="w-full border-border shadow-sm overflow-hidden">
              <div className="bg-navy p-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Order Total</p>
                  <p className="text-3xl font-bold">₹{pricing.total_amount}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted">Document</span>
                    <span className="font-medium text-ink text-right max-w-[200px] truncate">{document.original_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Order Number</span>
                    <span className="font-medium text-ink">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Pages / Copies</span>
                    <span className="font-medium text-ink">{pricing.page_count} / {pricing.copies}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Print Options</span>
                    <span className="font-medium text-ink">
                      {order.color_mode === 'black_white' ? 'B&W' : 'Color'}, {order.paper_size.toUpperCase()}, {order.duplex ? 'Double-sided' : 'Single-sided'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 pt-4 border-t border-border">
                  <Button 
                    className="w-full h-14 text-lg shadow-sm"
                    onClick={handlePayment}
                    isLoading={isProcessing}
                    disabled={isProcessing}
                  >
                    Pay ₹{pricing.total_amount}
                  </Button>
                  <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
