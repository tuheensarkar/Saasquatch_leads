"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle, CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface LeadUploadProps {
  onUpload: (file: File) => void
  isProcessing: boolean
}

export function LeadUpload({ onUpload, isProcessing }: LeadUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
          setError("Please upload a CSV file")
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          setError("File size must be less than 10MB")
          return
        }
        setError(null)
        onUpload(file)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  if (isProcessing) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Processing Your Leads
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Our AI is validating emails, phones, and calculating intelligent lead scores...
          </p>
          <div className="space-y-3">
            <Progress value={75} className="w-full h-3" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>✓ Data validation</span>
              <span>⚡ AI scoring</span>
              <span>🎯 Prioritization</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive || dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragActive ? "bg-blue-500 scale-110" : "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
              >
                <Upload className="w-8 h-8 text-white" />
              </div>

              {isDragActive ? (
                <div>
                  <p className="text-blue-600 font-semibold text-lg">Drop your CSV file here!</p>
                  <p className="text-blue-500 text-sm">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg mb-2">
                    Drag & drop your CSV file here
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">or click to browse your files</p>
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Requirements and Sample */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800 dark:text-green-200">Requirements</h4>
            </div>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Company Name (required)</li>
              <li>• Email (required)</li>
              <li>• Phone (optional)</li>
              <li>• Industry (optional)</li>
              <li>• Revenue (optional)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Download className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Sample Data</h4>
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 dark:text-blue-400 text-sm"
              onClick={() => {
                const sampleData = `Company Name,Email,Phone,Industry,Revenue
Acme Corp,info@acme.com,+12025550123,Technology,1000000
Beta Inc,sales@beta.com,+12025550124,Finance,500000
Gamma Solutions,contact@gamma.com,+12025550125,Retail,200000
Delta Enterprises,hello@delta.io,+12025550126,Healthcare,750000
Epsilon Co,team@epsilon.co,+12025550127,Technology,2000000`

                const blob = new Blob([sampleData], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "sample_leads.csv"
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Download sample CSV template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
