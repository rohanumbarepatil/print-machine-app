/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Stepper } from "@/components/layout/Stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Plus, Minus, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { usePrintStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { PricingRule } from "@/types"


const OptionGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">{title}</h3>
    {children}
  </div>
)

const SegmentControl = ({ 
  options, 
  value, 
  onChange 
}: { 
  options: {label: string, value: any}[], 
  value: any, 
  onChange: (val: any) => void 
}) => (
  <div className="flex p-1 bg-gray-100 rounded-lg">
    {options.map(opt => (
      <button
        key={String(opt.value)}
        onClick={() => onChange(opt.value)}
        className={cn(
          "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
          value === opt.value 
            ? "bg-surface shadow-sm text-ink" 
            : "text-muted hover:text-ink"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export default function ConfigurePage() {

  const router = useRouter()
  const { session, document, setOrder, setPricing, order } = usePrintStore()
  
  const [rules, setRules] = useState<PricingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [copies, setCopies] = useState(1)
  const [colorMode, setColorMode] = useState("black_white")
  const [duplex, setDuplex] = useState(false)
  const [orientation, setOrientation] = useState("portrait")
  const [paperSize, setPaperSize] = useState("A4")

  // Form State

  const loadRules = useCallback(async () => {
    try {
      const activeRules = await apiClient.getPricingRules()
      setRules(activeRules)
    } catch (err: any) {
      setError("Could not load printing options. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !document) {
      router.push("/")
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRules()
  }, [session, document, router, loadRules])

  // Calculate local estimated price instantly based on rules
  let currentPrice = "---"
  if (rules.length > 0 && document && document.page_count) {
    const matchingRule = rules.find(r => 
      r.color_mode === colorMode &&
      r.paper_size === paperSize &&
      r.duplex === duplex
    )
    if (matchingRule) {
      const pp = parseFloat(matchingRule.price_per_page)
      const pages = document.page_count
      const total = pp * pages * copies
      currentPrice = total.toFixed(2)
    }
  }

  const handleCreateOrder = async () => {
    if (!session || !document) return
    
    setIsCreatingOrder(true)
    setError(null)
    
    try {
      // Create order
      const newOrder = await apiClient.createOrder({
        session_id: session.id,
        document_id: document.id,
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        orientation,
        duplex,
        paper_type: "plain", // default
        scaling: "fit", // default
        collation: false, // default
        photo_collage: false // default
      })
      
      setOrder(newOrder)

      // Get exact price from backend
      const pricingResponse = await apiClient.calculatePrice(newOrder.id)
      setPricing(pricingResponse)
      
      router.push("/payment")
    } catch (err: any) {
      setError(err.message || "Failed to create order. Please try again.")
      setIsCreatingOrder(false)
    }
  }

  if (!session || !document) return null



  return (
    <div className="flex-1 flex flex-col bg-background">
      <Stepper currentStep={2} />
      
      <div className="flex-1 container mx-auto px-4 py-6 max-w-5xl flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Document & Config */}
        <div className="flex-1 flex flex-col space-y-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-ink">Configure Printing</h1>
          </div>

          {error && (
            <div className="flex items-start space-x-3 rounded-lg bg-error/10 p-4 text-error">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="font-medium text-sm">{error}</div>
            </div>
          )}

          {/* Document Preview Summary */}
          <Card className="bg-surface border-border">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <FileText className="h-6 w-6 text-primary-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink truncate">{document.original_name}</h3>
                <p className="text-sm text-muted">
                  {document.page_count ? `${document.page_count} pages` : 'Analyzing pages...'} • {(document.file_size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <div className="space-y-8 bg-surface p-6 rounded-xl border border-border">
            
            <OptionGroup title="Copies">
              <div className="flex items-center w-40 border border-border rounded-lg overflow-hidden h-12">
                <button 
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-ink transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-semibold text-ink border-x border-border">
                  {copies}
                </div>
                <button 
                  onClick={() => setCopies(copies + 1)}
                  className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-ink transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </OptionGroup>

            <OptionGroup title="Color">
              <SegmentControl 
                options={[
                  { label: "B&W", value: "black_white" },
                  { label: "Color", value: "color" }
                ]}
                value={colorMode}
                onChange={setColorMode}
              />
            </OptionGroup>

            <OptionGroup title="Duplex">
              <SegmentControl 
                options={[
                  { label: "Single-sided", value: false },
                  { label: "Double-sided", value: true }
                ]}
                value={duplex}
                onChange={setDuplex}
              />
            </OptionGroup>

            <OptionGroup title="Orientation">
              <SegmentControl 
                options={[
                  { label: "Portrait", value: "portrait" },
                  { label: "Landscape", value: "landscape" }
                ]}
                value={orientation}
                onChange={setOrientation}
              />
            </OptionGroup>

          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full lg:w-96 flex flex-col">
          <div className="sticky top-20">
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="bg-navy p-6 text-white">
                <h2 className="font-semibold text-lg mb-1">Print Summary</h2>
                <p className="text-blue-200 text-sm opacity-90">Estimated total based on your selection</p>
              </div>
              
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  <li className="flex justify-between py-4 px-6 text-sm">
                    <span className="text-muted">Document</span>
                    <span className="font-medium text-ink truncate max-w-[150px]">{document.original_name}</span>
                  </li>
                  <li className="flex justify-between py-4 px-6 text-sm">
                    <span className="text-muted">Pages</span>
                    <span className="font-medium text-ink">{document.page_count || "?"}</span>
                  </li>
                  <li className="flex justify-between py-4 px-6 text-sm">
                    <span className="text-muted">Copies</span>
                    <span className="font-medium text-ink">{copies}</span>
                  </li>
                  <li className="flex justify-between py-4 px-6 text-sm">
                    <span className="text-muted">Print Type</span>
                    <span className="font-medium text-ink">
                      {colorMode === 'black_white' ? 'Black & White' : 'Color'}, {duplex ? 'Double-sided' : 'Single-sided'}
                    </span>
                  </li>
                </ul>

                <div className="bg-gray-50 p-6 flex items-end justify-between border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-muted mb-1">Total Amount</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-ink">₹{currentPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 bg-gray-50">
                  <Button 
                    className="w-full h-12 text-base font-semibold shadow-sm"
                    onClick={handleCreateOrder}
                    isLoading={isCreatingOrder || isLoading}
                    disabled={!document.page_count && currentPrice === "---"}
                  >
                    Continue to Payment
                  </Button>
                  {!document.page_count && (
                     <p className="text-xs text-warning mt-2 text-center">Processing document to calculate price...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  )
}
