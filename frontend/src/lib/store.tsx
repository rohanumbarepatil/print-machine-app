"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Document, PrintOrder, PrintSession, PricingCalculation, Payment } from "@/types"

interface PrintState {
  session: PrintSession | null
  document: Document | null
  order: PrintOrder | null
  pricing: PricingCalculation | null
  payment: Payment | null
  setSession: (session: PrintSession | null) => void
  setDocument: (document: Document | null) => void
  setOrder: (order: PrintOrder | null) => void
  setPricing: (pricing: PricingCalculation | null) => void
  setPayment: (payment: Payment | null) => void
  reset: () => void
}

const PrintContext = createContext<PrintState | undefined>(undefined)

export function PrintProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PrintSession | null>(null)
  const [document, setDocument] = useState<Document | null>(null)
  const [order, setOrder] = useState<PrintOrder | null>(null)
  const [pricing, setPricing] = useState<PricingCalculation | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)

  const reset = useCallback(() => {
  setSession(null)
  setDocument(null)
  setOrder(null)
  setPricing(null)
  setPayment(null)
}, [])

  return (
    <PrintContext.Provider
      value={{
        session,
        document,
        order,
        pricing,
        payment,
        setSession,
        setDocument,
        setOrder,
        setPricing,
        setPayment,
        reset,
      }}
    >
      {children}
    </PrintContext.Provider>
  )
}

export function usePrintStore() {
  const context = useContext(PrintContext)
  if (context === undefined) {
    throw new Error("usePrintStore must be used within a PrintProvider")
  }
  return context
}
