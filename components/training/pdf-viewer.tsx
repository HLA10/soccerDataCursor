"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface PdfViewerProps {
  filePath: string
  fileName?: string
  onDelete?: () => void
  canDelete?: boolean
}

export function PdfViewer({ filePath, fileName, onDelete, canDelete = false }: PdfViewerProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = filePath
    link.download = fileName || "session-plan.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Session Plan PDF</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {canDelete && onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={filePath}
            className="w-full h-full"
            title="Session Plan PDF"
            style={{ border: "none" }}
          />
        </div>
        {fileName && (
          <p className="text-sm text-muted-foreground mt-2">
            File: {fileName}
          </p>
        )}
      </CardContent>
    </Card>
  )
}









