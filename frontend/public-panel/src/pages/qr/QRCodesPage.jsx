import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { QrCode, Trash2, Plus, ExternalLink, ShieldCheck, Copy, CheckCircle2, Download } from 'lucide-react'
import { getMyQrTokens, generateQrCode, deleteQrToken } from '../../api/student.api'
import QRCode from 'qrcode'
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
  const [qrImages, setQrImages] = useState({})

  // Generate QR images locally for the token list
  useEffect(() => {
    const tokens = data?.data?.tokens || []
    tokens.forEach(async (t) => {
      if (!qrImages[t.id]) {
        try {
          const url = `${window.location.origin}/verify/${t.token}`
          const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 300 })
          setQrImages(prev => ({ ...prev, [t.id]: dataUrl }))
        } catch (e) {
          console.error('QR Gen error', e)
        }
      }
    })
  }, [data?.data?.tokens, qrImages])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generateQrCode()
      // Extract token to build frontend-specific URL
      const rawToken = res.data.verificationUrl.split('/').pop()
      const localUrl = `${window.location.origin}/verify/${rawToken}`
      const localQr = await QRCode.toDataURL(localUrl, { margin: 2, width: 300 })
      
      setPreviewData({
        ...res.data,
        verificationUrl: localUrl,
        qrCode: localQr,
        rawToken
      })
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

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename || 'academic_record_qr.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {tokens.map((token) => {
              const isExpired = new Date(token.expiresAt) < new Date()
              const localUrl = `${window.location.origin}/verify/${token.token}`
              
              return (
                <div key={token.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group">
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    {qrImages[token.id] ? (
                      <div className="p-2 bg-white rounded-xl border border-border shadow-sm">
                        <img src={qrImages[token.id]} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary rounded-xl animate-pulse" />
                    )}
                    <button
                      onClick={() => downloadImage(qrImages[token.id], `dar_qr_${token.token.substring(0,6)}_${format(new Date(), 'yyyyMMdd_HHmm')}.png`)}
                      className="w-full py-2 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold rounded-lg transition-colors border border-border"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isExpired ? (
                            <Badge variant="danger">Expired</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                            {token.token.substring(0, 8)}...
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(token.id)}
                          disabled={deletingId === token.id}
                          className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                          title="Revoke Token"
                        >
                          {deletingId === token.id ? <Spinner size="sm" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                      
                      <div className="space-y-1 mb-4">
                        <p className="text-sm font-medium text-foreground">
                          Generated: <span className="font-bold">{format(new Date(token.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          Expires: <span className="font-bold text-foreground">{format(new Date(token.expiresAt), 'MMM dd, yyyy HH:mm')}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                        <button 
                          onClick={() => copyUrl(localUrl)}
                          className="flex-1 py-2 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                        >
                          <Copy size={14} /> Copy Link
                        </button>
                        <a 
                          href={localUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="py-2 px-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border"
                          title="Open Link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
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
          <div className="flex flex-col items-center text-center pb-2">
            <div className="bg-white p-3 rounded-2xl border border-border shadow-sm mb-4 inline-block relative group">
              <img 
                src={previewData.qrCode} 
                alt="Verification QR Code" 
                className="w-40 h-40 md:w-48 md:h-48 object-contain rounded-xl"
              />
              <button
                onClick={() => downloadImage(previewData.qrCode, `dar_qr_${previewData.rawToken.substring(0,6)}_${format(new Date(), 'yyyyMMdd_HHmm')}.png`)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl text-white font-bold gap-2"
              >
                <Download size={20} /> Download PNG
              </button>
            </div>
            
            <h4 className="text-lg font-bold text-foreground mb-1">Scan to Verify</h4>
            <p className="text-xs font-medium text-muted-foreground mb-4 max-w-xs mx-auto">
              Share this QR code with employers to grant them secure access to your verified academic records.
            </p>

            <div className="w-full text-left space-y-1 mb-4">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider ml-1">Or share link</label>
              <div className="flex items-center gap-2 p-1.5 bg-secondary border border-border rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={previewData.verificationUrl}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-muted-foreground px-2 truncate"
                />
                <button 
                  onClick={() => copyUrl(previewData.verificationUrl)}
                  className="p-2 bg-background hover:bg-card border border-border rounded-lg shadow-sm transition-colors text-foreground shrink-0"
                  title="Copy URL"
                >
                  {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                </button>
                <a 
                  href={previewData.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-colors shrink-0"
                  title="Open Link"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="w-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-xl flex items-start gap-2.5 text-left">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Security Note</p>
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">This token will expire on <strong>{format(new Date(previewData.expiresAt), 'MMM dd, yyyy')}</strong>. You can revoke it anytime from the dashboard.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
