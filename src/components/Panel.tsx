import React from 'react'
import type { ReactNode } from 'react'

interface PanelProps {
  title?: ReactNode
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 gap-3">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  )
}
