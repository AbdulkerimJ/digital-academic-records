import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'

const variants = {
  success: { icon: CheckCircle2, cls: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' },
  warning: { icon: TriangleAlert, cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' },
  error:   { icon: AlertCircle,   cls: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' },
  info:    { icon: Info,          cls: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' },
}

export default function Alert({ type = 'info', children, className = '' }) {
  const { icon: Icon, cls } = variants[type] || variants.info
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium ${cls} ${className}`} role="alert">
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}
