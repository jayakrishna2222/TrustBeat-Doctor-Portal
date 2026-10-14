import React from 'react'
import type { RiskLevel } from '../types'

interface RiskBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md'
  className?: string
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const getStyles = () => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      case 'Moderate':
        return 'bg-amber-50 text-amber-600 border border-amber-200'
      case 'High':
        return 'bg-rose-50 text-rose-600 border border-rose-200'
      case 'Very High':
        return 'bg-rose-600 text-white font-medium shadow-sm'
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200'
    }
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-md tracking-tight ${padding} ${getStyles()} ${className}`}
    >
      {level}
    </span>
  )
}
