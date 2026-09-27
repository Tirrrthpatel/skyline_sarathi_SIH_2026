import React from "react"
import { cn } from "@/lib/utils"

export const CardSpotlight = ({
  children,
  className,
  // Accepted for backwards compatibility but unused since hover effects are removed
  radius: _radius,
  color: _color,
  dotColors: _dotColors,
  ...props
}: {
  children: React.ReactNode
  radius?: number
  color?: string
  dotColors?: number[][]
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-none border-2 border-black dark:border-white bg-white dark:bg-[#0A0A0A] text-black dark:text-white transition-none shadow-none",
        className
      )}
      {...props}
    >
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  )
}
