import React from 'react'
import { HeartPulse, Droplet, UserCheck, Dna, Info } from 'lucide-react'

interface KeyFactorsCardProps {
  isPreviewMode?: boolean
}

export const KeyFactorsCard: React.FC<KeyFactorsCardProps> = ({ isPreviewMode = false }) => {
  const factors = [
    {
      title: 'High Blood Pressure',
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-500" />,
      bg: 'bg-rose-50',
    },
    {
      title: 'High Cholesterol',
      icon: <Droplet className="w-3.5 h-3.5 text-amber-500" />,
      bg: 'bg-amber-50',
    },
    {
      title: 'Age Factor',
      icon: <UserCheck className="w-3.5 h-3.5 text-orange-500" />,
      bg: 'bg-orange-50',
    },
    {
      title: 'Family History',
      icon: <Dna className="w-3.5 h-3.5 text-red-500" />,
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col justify-between h-full min-h-[190px]">
      <div className="w-full text-left">
        <h4 className="text-xs font-bold text-[#0f2537]">Key Factors</h4>
      </div>

      <div className="flex flex-col gap-2 my-1">
        {isPreviewMode ? (
          factors.map((f) => (
            <div key={f.title} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-md ${f.bg} flex items-center justify-center shrink-0`}
              >
                {f.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-none">
                {f.title}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Info className="w-4 h-4 text-slate-300 mb-1" />
            <span className="text-[10px] text-slate-400 font-medium">
              No Risk Factors Recorded
            </span>
          </div>
        )}
      </div>

      <div className="w-full text-center">
        <span className="text-[10px] text-slate-400 font-medium">
          {isPreviewMode ? '4 Clinical Correlates' : 'Awaiting Diagnostic Input'}
        </span>
      </div>
    </div>
  )
}
