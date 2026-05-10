import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, X, RefreshCw } from 'lucide-react'

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(true)
  const [facingMode, setFacingMode] = useState('environment') // 'user' or 'environment'

  useEffect(() => {
    let stream = null
    let animationId = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
          videoRef.current.play()
          requestAnimationFrame(tick)
        }
      } catch (err) {
        console.error("Camera error:", err)
        setError("Could not access camera. Please ensure you have given permission.")
      }
    }

    const tick = () => {
      if (!active) return
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current
        if (!canvas) return
        const video = videoRef.current
        
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        })

        if (code && code.data) {
          setActive(false)
          onScan(code.data)
          return
        }
      }
      animationId = requestAnimationFrame(tick)
    }

    startCamera()

    return () => {
      setActive(false)
      if (animationId) cancelAnimationFrame(animationId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onScan, facingMode, active])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-secondary/50 backdrop-blur-md">
            <X size={48} className="text-destructive mb-4" />
            <p className="text-sm font-bold text-foreground">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 border-[30px] border-black/40">
                <div className="w-full h-full border-2 border-primary/50 rounded-xl relative">
                    {/* Animated scanning line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                    
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleCamera}
          className="p-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors shadow-sm border border-border"
          title="Switch Camera"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-destructive text-destructive-foreground font-bold rounded-xl shadow-lg shadow-destructive/20 transition-all"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs font-medium text-muted-foreground animate-pulse">
        Position the QR code within the frame to scan
      </p>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
      `}</style>
    </div>
  )
}
