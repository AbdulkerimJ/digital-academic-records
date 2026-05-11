import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  QrCode, Trash2, Plus, ExternalLink, ShieldCheck, 
  Copy, CheckCircle2, Download, Shield, Activity,
  Lock, Hash, Cpu, Fingerprint, AlertTriangle, 
  Clock, ArrowUpRight, Globe
} from 'lucide-react'
import { getMyQrTokens, generateQrCode, deleteQrToken } from '../../api/student.api'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal'

export default function QRCodesPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['my-qrs'], queryFn: getMyQrTokens })
  
   const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  
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
      toast.success('New access token generated.')
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const confirmDelete = (id) => {
    setDeletingId(id)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setRevoking(true)
    try {
      await deleteQrToken(deletingId)
      toast.success('Access token revoked.')
      refetch()
      setDeleteConfirmOpen(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRevoking(false)
      setDeletingId(null)
    }
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('URL copied')
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-[0.3em]">Loading Tokens...</p>
      </div>
    )
  }

  const tokens = data?.data?.tokens || []

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* 1. Module Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Lock size={22} className="text-primary-foreground" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none capitalize">Initialize Security Token</h2>
                <span className="text-[8px] font-bold text-primary capitalize tracking-[0.4em] mt-1">Manage Verification Keys</span>
             </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-muted/30 rounded text-[9px] font-black capitalize tracking-widest">
            <Activity size={12} className="text-primary" /> {tokens.filter(t => new Date(t.expiresAt) > new Date()).length} Active Tokens
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-[0.85] text-foreground">
              Access <br/>
              <span className="text-muted-foreground">tokens</span>
            </h1>
            <p className="text-[11px] font-mono text-muted-foreground capitalize tracking-widest leading-relaxed border-l-2 border-primary pl-6">
              Generate QR codes to let employers verify your records. 
            </p>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full md:w-auto h-16 px-10 bg-primary text-primary-foreground font-black text-[10px] capitalize tracking-[0.3em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group rounded-none"
          >
            {generating ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Plus size={18} /> 
                Generate New Token
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Tokens Inventory */}
      <div className="space-y-6">
        {tokens.length === 0 ? (
          <div className="bg-muted/10 border border-border border-dashed rounded p-20 text-center flex flex-col items-center">
            <QrCode size={48} className="text-muted-foreground/20 mb-6" />
            <h3 className="text-xl font-black capitalize tracking-tight">No active tokens</h3>
            <p className="text-xs font-mono text-muted-foreground mt-2 capitalize tracking-widest">Generate a token to share your records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tokens.map((token) => {
              const isExpired = new Date(token.expiresAt) < new Date()
              const localUrl = `${window.location.origin}/verify/${token.token}`
              
              return (
                <div key={token.id} className="bg-card border border-border rounded-none overflow-hidden flex flex-col md:flex-row group">
                  
                  {/* QR Visual */}
                  <div className="shrink-0 bg-muted/30 p-8 flex flex-col items-center justify-center gap-6 border-b md:border-b-0 md:border-r border-border">
                    {qrImages[token.id] ? (
                      <div className="p-3 bg-white rounded border border-border shadow-sm">
                        <img src={qrImages[token.id]} alt="QR" className="w-32 h-32 object-contain" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-background border border-border border-dashed animate-pulse rounded" />
                    )}
                    <button
                      onClick={() => downloadImage(qrImages[token.id], `qr_${token.token.substring(0,8)}.png`)}
                      className="w-full h-10 border border-border text-[9px] font-black capitalize tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-2 rounded-none"
                    >
                      <Download size={12} /> Download PNG
                    </button>
                  </div>

                  {/* Token Metadata */}
                  <div className="flex-1 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 border text-[9px] font-black capitalize tracking-widest rounded ${
                          isExpired ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {isExpired ? 'EXPIRED' : 'ACTIVE'}
                        </div>
                        <div className="px-3 py-1 bg-muted/50 border border-border text-[10px] font-mono text-muted-foreground capitalize tracking-widest rounded">
                          Token: {token.token.substring(0, 12).toUpperCase()}...
                        </div>
                      </div>
                       <button
                        onClick={() => confirmDelete(token.id)}
                        disabled={deletingId === token.id && deleteConfirmOpen}
                        className="h-10 w-10 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 flex items-center justify-center transition-all rounded-none"
                        title="Revoke Token"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Created On</p>
                        <p className="text-sm font-black capitalize font-mono">{format(new Date(token.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-primary capitalize tracking-widest">Expires On</p>
                        <p className={`text-sm font-black capitalize font-mono ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
                          {format(new Date(token.expiresAt), 'yyyy-MM-dd HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <button 
                        onClick={() => copyUrl(localUrl)}
                        className="h-10 px-6 border border-border bg-muted/20 text-[9px] font-black capitalize tracking-widest hover:bg-muted transition-all flex items-center gap-2 rounded-none"
                      >
                        <Copy size={14} /> Copy Link
                      </button>
                      <a 
                        href={localUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-10 px-4 border border-border text-muted-foreground hover:text-primary transition-all flex items-center justify-center rounded-none"
                        title="Open Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="bg-muted/30 border border-border rounded p-10 space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Shield size={16} className="text-primary" />
          <h4 className="text-[9px] font-black capitalize tracking-[0.4em]">Security Note</h4>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono font-medium leading-relaxed max-w-4xl capitalize tracking-widest">
          Sharing your QR code gives someone temporary access to view your verified academic records. 
          You can revoke this access at any time.
        </p>
      </div>

      {/* NEW TOKEN PREVIEW (MODAL) */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="New Access Token" size="md">
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-white p-4 rounded border border-border shadow-sm group relative">
              <img 
                src={previewData?.qrCode} 
                alt="QR" 
                className="w-48 h-48 md:w-56 md:h-56 object-contain"
              />
              <button
                onClick={() => downloadImage(previewData?.qrCode, `qr_${previewData?.rawToken.substring(0,8)}.png`)}
                className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-primary-foreground font-black text-[10px] capitalize tracking-widest gap-2"
              >
                <Download size={24} />
                Download Image
              </button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-2xl font-black capitalize tracking-tight">Token Ready</h4>
              <p className="text-[10px] font-mono text-muted-foreground capitalize tracking-widest max-w-xs">
                You can now share this QR code for verification.
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground capitalize tracking-[0.2em] ml-1">Direct Link</label>
                <div className="flex items-center gap-2 p-1 bg-muted/50 border border-border rounded">
                  <input 
                    type="text" 
                    readOnly 
                    value={previewData?.verificationUrl}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-primary px-3 truncate"
                  />
                  <button 
                    onClick={() => copyUrl(previewData?.verificationUrl)}
                    className="h-10 px-4 bg-background border border-border text-[9px] font-black capitalize tracking-widest hover:bg-muted transition-all"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
             </div>

             <div className="p-6 bg-primary/5 border border-primary/20 rounded">
                <div className="flex items-start gap-3 text-primary">
                  <Shield size={18} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black capitalize tracking-widest">Expiration</p>
                    <p className="text-xs font-medium capitalize tracking-tight">
                      This token expires on <strong className="text-primary">{previewData?.expiresAt && format(new Date(previewData.expiresAt), 'MMMM dd, yyyy')}</strong>.
                    </p>
                  </div>
                </div>
             </div>
          </div>

          <div className="flex justify-center pt-4">
             <button 
                onClick={() => setPreviewOpen(false)}
                className="h-12 px-12 border border-border text-[10px] font-black capitalize tracking-widest hover:bg-muted transition-all"
             >
                Close
             </button>
          </div>
        </div>
       </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={revoking}
      />
    </div>
  )
}
