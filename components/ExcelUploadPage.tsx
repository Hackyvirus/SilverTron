'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export default function ExcelUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null) // Step 2
  const [resultSummary, setResultSummary] = useState<null | {
    total: number
    successful: number
    skipped: number
  }>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: true,
      })

      setPreviewData(jsonData.slice(0, 20)) // preview first 20 rows
    } catch (error) {
      toast.error('Failed to parse Excel file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)

      const res = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // ✅ Show detailed summary
      toast.success(
        `✅ Upload successful: ${result.summary.successful} inserted, ${result.summary.skipped} skipped.`
      )

      setResultSummary(result.summary)
      // Optional: you can show this info somewhere in UI too if needed
      console.table(result.summary)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reset UI state
      setPreviewData(null)
      setFile(null)
    } catch (error) {
      toast.error(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }


  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Upload Account Sheet</h2>
        <p className="text-sm text-muted-foreground">
          Upload the Excel sheet containing account financials. Preview and confirm before syncing to PostgreSQL.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <Label className='mb-4' htmlFor="excel">Excel File (.xlsx)</Label>
            <Input id="excel" type="file" accept=".xlsx" onChange={handleFileChange} ref={fileInputRef} />
          </div>

          {previewData && previewData.length > 0 && (
            <div className="overflow-auto max-h-[400px] border rounded">
              <table className="min-w-full text-sm text-left table-auto">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="px-2 py-1 border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="even:bg-gray-50">
                      {Object.keys(previewData[0]).map((key) => (
                        <td key={key} className="px-2 py-1 border whitespace-nowrap">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {resultSummary && (
            <div className="mt-4 text-sm text-gray-700 border border-gray-200 rounded p-4 bg-gray-50">
              <p><strong>Upload Summary:</strong></p>
              <ul className="list-disc list-inside">
                <li>Total Rows: {resultSummary.total}</li>
                <li>Successfully Inserted: {resultSummary.successful}</li>
                <li>Skipped: {resultSummary.skipped}</li>
              </ul>
            </div>
          )}

          {previewData && (
            <div className="pt-4">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload & Sync to DB'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
