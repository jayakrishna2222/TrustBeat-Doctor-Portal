import React from 'react'
import { Users, FileText, BarChart3, ShieldCheck } from 'lucide-react'

interface FeatureItem {
  icon: React.ReactNode
  bg: string
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: <Users className="w-5 h-5 text-teal-700" />,
    bg: 'bg-emerald-100/70',
    title: 'Patient Management',
    description: 'View and manage patient profiles and health history',
  },
  {
    icon: <FileText className="w-5 h-5 text-rose-600" />,
    bg: 'bg-rose-100/70',
    title: 'AI-Powered Reports',
    description: 'Detailed risk analysis with explainable AI insights',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-sky-600" />,
    bg: 'bg-sky-100/70',
    title: 'Medical Visualizations',
    description: 'View Grad-CAM heatmaps and risk factors',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
    bg: 'bg-purple-100/70',
    title: 'Secure & Compliant',
    description: 'HIPAA-compliant and end-to-end encrypted data',
  },
]

export const FeatureList: React.FC = () => {
  return (
    <div className="flex flex-col gap-3.5">
      {features.map((feature) => (
        <div key={feature.title} className="flex items-start gap-3.5 group">
          <div
            className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105`}
          >
            {feature.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0f2537] leading-tight">
              {feature.title}
            </h4>
            <p className="text-xs text-slate-500 leading-snug mt-0.5 max-w-[240px]">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
