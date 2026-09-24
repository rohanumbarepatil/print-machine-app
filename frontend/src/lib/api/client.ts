/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Document, Payment, PricingCalculation, PrintOrder, PrintSession, PricingRule } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    ...options.headers,
  }

  if (!(options.body instanceof FormData)) {
    // @ts-ignore
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { detail: response.statusText }
    }
    
    // Attempt to extract detail
    const detail = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : Array.isArray(errorData.detail) && errorData.detail.length > 0
        ? errorData.detail[0].msg
        : "An unexpected error occurred"

    throw new ApiError(response.status, detail, errorData)
  }

  return response.json()
}

export const apiClient = {
  // Session
  createSession: (printer_id: string) => 
    fetchApi<PrintSession>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ printer_id })
    }),
    
  // Document
  uploadDocument: (file: File, sessionId: string) => {
    const formData = new FormData()
    formData.append("file", file)
    return fetchApi<Document>(`/api/documents/upload?session_id=${sessionId}`, {
      method: "POST",
      body: formData
    })
  },
  
  // Pricing Rules
  getPricingRules: () => 
    fetchApi<PricingRule[]>("/api/pricing-rules", {
      method: "GET"
    }),

  // Order
  createOrder: (data: any) =>
    fetchApi<PrintOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    
  calculatePrice: (orderId: string) =>
    fetchApi<PricingCalculation>(`/api/pricing-rules/calculate/${orderId}`, {
      method: "POST"
    }),
    
  // Payment
  createPayment: (orderId: string) =>
    fetchApi<Payment>("/api/payments", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId })
    }),
    
  verifyPayment: (paymentId: string, providerPaymentId: string, signature: string) =>
    fetchApi<Payment>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify({
        payment_id: paymentId,
        provider_payment_id: providerPaymentId,
        razorpay_signature: signature
      })
    })
}
