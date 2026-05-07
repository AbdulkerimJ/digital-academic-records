import { useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Download
} from "lucide-react"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { listInstitutions } from "../../api/institutions.api"

export default function BulkUploadModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  uploadFunction, 
  queryKeyToInvalidate,
  templateUrl
}) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    } else {
      toast.error("Please select a valid CSV file.")
    }
  }

  const reset = () => {
    setFile(null)
    setIsUploading(false)
    setProgress(null)
    setResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleClose = () => {
    if (isUploading) return
    reset()
    onClose()
  }

  const startUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResults(null)
    
    try {
      // The uploadFunction must be one that uses fetch and returns a stream response
      const response = await uploadFunction(file)

      if (!response.body) {
        // Fallback for non-streaming response (e.g. standard axios post)
        setResults(response.data || response)
        setIsUploading(false)
        queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] })
        toast.success("Bulk upload complete!")
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""))
              
              if (data.error) {
                setResults({ error: data.error })
                setIsUploading(false)
                break
              }

              if (data.complete) {
                setResults(data.results)
                setIsUploading(false)
                queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate] })
                toast.success("Bulk upload complete!")
                break
              }

              setProgress(data)
            } catch (e) {
              console.error("Error parsing SSE chunk:", e)
            }
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload file")
      setIsUploading(false)
    }
  }

  const downloadResultsPDF = () => {
    if (!results || results.error) return

    try {
      const doc = new jsPDF()
      const timestamp = new Date().toLocaleString()

      // Header & Brand
      doc.setFontSize(22)
      doc.setTextColor(30, 41, 59) // slate-800
      doc.text("Bulk Upload Audit Report", 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(`Generated on: ${timestamp}`, 14, 30)
      doc.text(`Total Records: ${results.total}`, 14, 35)
      doc.text(`Success Rate: ${results.successRate}`, 14, 40)
      doc.text(`Operation: ${title}`, 14, 45)

      // Summary Table Data
      const tableData = []
      let rowNum = 1
      
      // Add failed records first (as they are more important for correction)
      results.failed?.forEach(item => {
        tableData.push([rowNum++, item.id, "FAILED", item.reason])
      })

      // Add successful records
      results.successful?.forEach(item => {
        tableData.push([rowNum++, item.id, "SUCCESS", "Processed successfully"])
      })

      // Use the direct autoTable call which is more reliable
      autoTable(doc, {
        startY: 55,
        head: [['#', 'Record Identifier', 'Status', 'Details']],
        body: tableData,
        headStyles: { 
          fillColor: [79, 70, 229], // primary/600
          fontSize: 10,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            if (data.cell.raw === 'FAILED') {
              data.cell.styles.textColor = [220, 38, 38] // red-600
              data.cell.styles.fontStyle = 'bold'
            } else {
              data.cell.styles.textColor = [5, 150, 105] // emerald-600
            }
          }
        }
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Digital Academic Records System - Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }

      doc.save(`upload_audit_report_${new Date().getTime()}.pdf`)
    } catch (err) {
      console.error("PDF Generation Error:", err)
      toast.error("Failed to generate PDF report.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 pb-4 border-b border-primary/10 relative shrink-0">
          <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg ring-1 ring-primary/5 mb-3">
            <UploadCloud size={24} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-center">{title}</DialogTitle>
            <DialogDescription className="text-center text-xs font-medium mt-1">
              {description}
            </DialogDescription>
            {templateUrl && !isUploading && !results && (
              <div className="flex justify-center mt-3">
                <a href={templateUrl} download className="flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary/10">
                  <Download size={14} /> Download CSV Template
                </a>
              </div>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {!isUploading && !results && (
            <>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  group relative border-2 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer text-center
                  ${file ? "border-primary/40 bg-primary/5" : "border-muted/60 hover:border-primary/30 hover:bg-muted/10"}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".csv"
                />
                
                <div className="space-y-4">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${file ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-black text-sm tracking-tight">
                      {file ? file.name : "Select CSV File"}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse"}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={startUpload} 
                className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                disabled={!file}
              >
                Start Bulk Upload
              </Button>
            </>
          )}

          {isUploading && progress && !results && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                <h3 className="font-black text-lg tracking-tight text-foreground">Processing Upload...</h3>
                <p className="text-xs font-bold text-muted-foreground">
                  Record {progress.current} of {progress.total}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                  <span className="text-primary">Progress</span>
                  <span className="text-primary">{progress.percent}</span>
                </div>
                <Progress value={parseInt(progress.percent)} className="h-2 rounded-full bg-primary/10" indicatorClassName="bg-primary" />
              </div>
              
              {progress.lastResult && (
                <div className="bg-muted/30 p-4 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="text-xs font-bold font-mono">{progress.lastResult.id}</span>
                  </div>
                  {progress.lastResult.success ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none px-2 rounded-lg text-[10px] uppercase font-black tracking-widest"><CheckCircle2 size={12} className="mr-1 inline" /> OK</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-none px-2 rounded-lg text-[10px] uppercase font-black tracking-widest"><AlertCircle size={12} className="mr-1 inline" /> Error</Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              {results.error ? (
                <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 text-center space-y-3">
                  <div className="mx-auto w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
                    <AlertCircle size={20} />
                  </div>
                  <h3 className="font-black text-destructive text-base">Upload Failed</h3>
                  <p className="text-xs font-medium text-destructive/80">{results.error}</p>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden">
                    <Sparkles className="absolute top-3 right-3 text-emerald-500/20" size={32} />
                    
                    <div>
                      <h3 className="font-black text-emerald-600 text-lg tracking-tight">Upload Complete!</h3>
                      <p className="text-[10px] font-bold text-emerald-600/70 mt-0.5 uppercase tracking-widest">
                        Successfully processed {results.successful?.length || 0} of {results.total || 0} records
                      </p>
                    </div>
                  </div>

                   {results.failed?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                          <AlertCircle size={14} /> {results.failed.length} Errors Encountered
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={downloadResultsPDF}
                          className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 p-0 px-2"
                        >
                          <Download size={12} className="mr-1" /> Export PDF Report
                        </Button>
                      </div>
                      <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                        {results.failed.map((fail, idx) => (
                          <div key={idx} className="bg-destructive/5 rounded-xl p-3 flex flex-col gap-1 border border-destructive/10">
                            <span className="font-mono text-xs font-black text-destructive">{fail.id}</span>
                            <span className="text-[10px] font-medium text-destructive/70">{fail.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!results.error && results.failed?.length === 0 && (
                    <div className="flex flex-col items-center gap-2">
                       <Button 
                          variant="outline" 
                          onClick={downloadResultsPDF}
                          className="h-10 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl"
                        >
                          <Download size={14} className="mr-2" /> Download Completion PDF
                        </Button>
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={handleClose} 
                className="w-full h-14 rounded-2xl font-black text-base border-2 border-muted hover:bg-muted/50"
                variant="outline"
              >
                Close Window
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
