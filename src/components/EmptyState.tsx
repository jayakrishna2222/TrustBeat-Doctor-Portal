import React from 'react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  compact?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 ${
        compact ? 'min-h-[140px]' : 'min-h-[220px]'
      } ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-700 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mb-3">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
