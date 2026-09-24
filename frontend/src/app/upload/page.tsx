/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Stepper } from "@/components/layout/Stepper"
import { Button } from "@/components/ui/button"
import { FileUp, File as FileIcon, X, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { usePrintStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function UploadPage() {
  const router = useRouter()
  const { session, setDocument } = usePrintStore()
  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) {
      router.push("/")
    }
  }, [session, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF documents are supported.")
      return
    }
    
    if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
      setError("File is too large. Maximum size is 20MB.")
      return
    }
    
    setFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !session) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      const doc = await apiClient.uploadDocument(file, session.id)
      setDocument(doc)
      router.push("/configure")
    } catch (err: any) {
      setError(err.message || "Failed to upload document. Please try again.")
      setIsUploading(false)
    }
  }

  if (!session) return null

  return (
    <div className="flex-1 flex flex-col">
      <Stepper currentStep={1} />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Upload your document</h1>
          <p className="text-muted">PDF documents up to 20MB are recommended for best quality.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg bg-error/10 p-4 text-error">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="font-medium text-sm">{error}</div>
          </div>
        )}

        {!file ? (
          <div
            className={cn(
              "flex-1 min-h-[300px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isDragging ? "border-primary-blue bg-blue-50" : "border-border bg-surface hover:bg-gray-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,application/pdf" 
              onChange={handleFileChange}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <FileUp className="h-8 w-8 text-primary-blue" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Drag & drop or choose a file</h3>
            <p className="text-sm text-muted mb-6">Supported format: PDF</p>
            <Button variant="outline" onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}>
              Choose file
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="rounded-xl border border-border bg-surface p-6 mb-auto">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <FileIcon className="h-6 w-6 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink line-clamp-1 break-all">{file.name}</h3>
                    <p className="text-sm text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="rounded-full p-2 text-muted hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleUpload}
                isLoading={isUploading}
              >
                Upload & Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
