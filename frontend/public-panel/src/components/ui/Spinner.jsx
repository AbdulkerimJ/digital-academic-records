export default function Spinner({ size = 'md', className = '' }) {
  const dim = size === 'lg' ? 'w-8 h-8 border-[3px]' : size === 'sm' ? 'w-4 h-4 border-2' : 'w-5 h-5 border-2'
  return (
    <span
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${dim} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
