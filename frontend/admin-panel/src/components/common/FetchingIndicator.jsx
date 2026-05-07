import React from "react"

/**
 * A subtle progress bar indicator shown at the top of a container 
 * whenever a background fetch is occurring.
 */
export default function FetchingIndicator({ isFetching }) {
  if (!isFetching) return null

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/20 overflow-hidden z-20">
      <div className="h-full bg-primary animate-progress-loading w-1/3" />
    </div>
  )
}
