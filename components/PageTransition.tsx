"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start exit animation
    setIsAnimating(true)

    const timer = setTimeout(() => {
      // Update content after fade out
      setDisplayChildren(children)
      setIsAnimating(false)
    }, 150) // Half of the total transition time

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div
      className={`page-transition ${isAnimating ? 'page-transition-exit' : 'page-transition-enter'}`}
    >
      {displayChildren}
    </div>
  )
}
