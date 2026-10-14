import React from 'react'
import { AlertTriangle, Activity } from 'lucide-react'

interface RiskPredictionCardProps {
  isPreviewMode?: boolean
}

export const RiskPredictionCard: React.FC<RiskPredictionCardProps> = ({ isPreviewMode = false }) => {
  // SVG circular gauge geometry
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const percentage = isPreviewMode ? 87 : 0
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col items-center justify-between h-full min-h-[190px]">
      <div className="w-full text-left">
        <h4 className="text-xs font-bold text-[#0f2537]">Risk Prediction</h4>
      </div>

      {/* Circular Gauge */}
      <div className="relative w-24 h-24 my-2 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
          {/* Background Track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="7"
            fill="transparent"
          />
          {/* Progress Stroke */}
          {isPreviewMode ? (
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="url(#riskGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          ) : (
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-slate-200 stroke-dash-2"
              strokeWidth="4"
              strokeDasharray="4 4"
              fill="transparent"
            />
          )}

          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isPreviewMode ? (
            <span className="text-xl font-black text-[#0f2537] tracking-tight">87%</span>
          ) : (
            <Activity className="w-6 h-6 text-slate-300" />
          )}
        </div>
      </div>

      {/* Bottom Status Badge */}
      {isPreviewMode ? (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          <span>High Risk</span>
        </div>
      ) : (
        <span className="text-[10px] font-medium text-slate-400">No Assessment Data</span>
      )}
    </div>
  )
}
