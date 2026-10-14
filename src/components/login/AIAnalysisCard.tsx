import React from 'react'
import { Sparkles } from 'lucide-react'
import cardiacGradcam from '../../assets/cardiac_gradcam.png'

interface AIAnalysisCardProps {
  isPreviewMode?: boolean
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ isPreviewMode = false }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col justify-between h-full min-h-[190px]">
      <div className="w-full text-left">
        <h4 className="text-xs font-bold text-[#0f2537]">AI Analysis</h4>
      </div>

      {/* Main visualization area */}
      <div className="flex items-center justify-center gap-2 my-1">
        {isPreviewMode ? (
          <>
            {/* Cardiac MRI / Grad-CAM visual */}
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#001155] border border-blue-900/30 flex items-center justify-center shadow-inner">
              <img
                src={cardiacGradcam}
                alt="Cardiac Grad-CAM Heatmap"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Vertical Color Scale Legend (High to Low) */}
            <div className="flex flex-col items-center justify-between h-24 text-[9px] font-bold text-slate-500 py-0.5">
              <span>High</span>
              <div className="w-1.5 h-16 rounded-full bg-gradient-to-b from-red-500 via-yellow-400 via-green-400 to-blue-600" />
              <span>Low</span>
            </div>
          </>
        ) : (
          <div className="w-full h-24 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-2">
            <Sparkles className="w-5 h-5 text-slate-300 mb-1" />
            <span className="text-[10px] font-medium text-slate-400">
              No Heatmap Active
            </span>
          </div>
        )}
      </div>

      <div className="w-full text-center">
        <span className="text-[10px] text-slate-400 font-medium">
          {isPreviewMode ? 'Grad-CAM Attention' : 'Connect Model Source'}
        </span>
      </div>
    </div>
  )
}
