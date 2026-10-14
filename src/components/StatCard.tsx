import React from 'react'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  trend?: string
  trendPositive?: boolean
  subtext?: string
  icon: ReactNode
  iconBgColor?: string
  iconColor?: string
  className?: string
  isUnavailable?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendPositive = true,
  subtext,
  icon,
  iconBgColor = 'bg-teal-50',
  iconColor = 'text-teal-600',
  className = '',
  isUnavailable = false,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex items-start gap-4 transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate mb-1">{title}</p>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {isUnavailable ? '—' : value}
          </span>
          {trend && !isUnavailable && (
            <span
              className={`text-xs font-semibold flex items-center gap-0.5 ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-slate-400 truncate">
            {isUnavailable ? 'Connect data source' : subtext}
          </p>
        )}
      </div>
    </div>
  )
}
