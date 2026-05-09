import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { QrCode, Trash2, Plus, ExternalLink, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react'
import { getMyQrTokens, generateQrCode, deleteQrToken } from '../../api/student.api'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function QRCodesPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['my-qrs'], queryFn: getMyQrTokens })
  
  const [generating, setGenerating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  
  const [previewData, setPreviewData] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generateQrCode()
      setPreviewData(res.data)
      setPreviewOpen(true)
      toast.success('New QR code generated successfully.')
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteQrToken(id)
      toast.success('QR token revoked successfully.')
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Verification URL copied to clipboard')
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" className="text-primary" /></div>
  }

  const tokens = data?.data?.tokens || []

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card border border-border p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
            <QrCode size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Access Tokens</h1>
            <p className="text-muted-foreground font-medium mt-2 max-w-lg">Generate secure, time-limited QR codes to allow employers or institutions to verify your academic records.</p>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 shrink-0"
        >
          {generating ? <Spinner size="sm" /> : <Plus size={18} />} Generate New Token
        </button>
      </div>

      <div className="space-y-6">
        {tokens.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <QrCode size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No active tokens</h3>
            <p className="text-muted-foreground mt-2 max-w-md">You haven't generated any QR access tokens yet. Generate one to share your verified records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tokens.map((token) => {
              const isExpired = new Date(token.expiresAt) < new Date()
              return (
                <div key={token.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <QrCode size={120} />
                  </div>
                  
                  <div className="relative z-10 flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isExpired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                          {token.token.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Generated: <span className="font-bold">{format(new Date(token.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        Expires: <span className="font-bold text-foreground">{format(new Date(token.expiresAt), 'MMM dd, yyyy HH:mm')}</span>
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(token.id)}
                      disabled={deletingId === token.id}
                      className="p-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                      title="Revoke Token"
                    >
                      {deletingId === token.id ? <Spinner size="sm" /> : <Trash2 size={18} />}
                    </button>
                  </div>

                  <div className="relative z-10 mt-auto pt-5 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ShieldCheck size={14} className="text-muted-foreground" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground leading-tight">
                        Anyone with this link or QR code can view your full verified academic profile until expiry.
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Your New Access Token" size="md">
        {previewData && (
          <div className="flex flex-col items-center text-center pb-4">
            <div className="bg-white p-4 rounded-3xl border border-border shadow-sm mb-8 inline-block">
              <img 
                src={previewData.qrCode} 
                alt="Verification QR Code" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-xl"
              />
            </div>
            
            <h4 className="text-xl font-bold text-foreground mb-2">Scan to Verify</h4>
            <p className="text-sm font-medium text-muted-foreground mb-8 max-w-xs mx-auto">
              Share this QR code with employers to grant them secure access to your verified academic records.
            </p>

            <div className="w-full text-left space-y-2 mb-8">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider ml-1">Or share link</label>
              <div className="flex items-center gap-2 p-2 bg-secondary border border-border rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={previewData.verificationUrl}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-muted-foreground px-2"
                />
                <button 
                  onClick={() => copyUrl(previewData.verificationUrl)}
                  className="p-2 bg-background hover:bg-card border border-border rounded-lg shadow-sm transition-colors text-foreground shrink-0"
                >
                  {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
                </button>
                <a 
                  href={previewData.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-colors shrink-0"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="w-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3 text-left">
              <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Security Note</p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">This token will expire on <strong>{format(new Date(previewData.expiresAt), 'MMM dd, yyyy')}</strong>. You can revoke it anytime from the dashboard.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
