import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface StepperProps {
  currentStep: number
}

const steps = [
  { id: 1, name: "Upload" },
  { id: 2, name: "Configure" },
  { id: 3, name: "Pay" },
  { id: 4, name: "Print" },
]

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full py-4 border-b border-border bg-surface">
      <div className="container mx-auto px-4">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 w-full" : "")}>
                <div className="flex items-center">
                  <div
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full border-2",
                      currentStep > step.id
                        ? "border-primary-blue bg-primary-blue"
                        : currentStep === step.id
                        ? "border-primary-blue bg-surface"
                        : "border-border bg-surface"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          currentStep === step.id ? "text-primary-blue" : "text-muted"
                        )}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  {stepIdx !== steps.length - 1 ? (
                    <div className="absolute top-4 left-0 -ml-px mt-0.5 w-full h-[2px] bg-border z-[-1]" aria-hidden="true">
                      <div 
                        className={cn("h-full bg-primary-blue transition-all")} 
                        style={{ width: currentStep > step.id ? "100%" : "0%" }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="absolute -left-2 top-10 w-max text-center">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      currentStep >= step.id ? "text-ink" : "text-muted"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
