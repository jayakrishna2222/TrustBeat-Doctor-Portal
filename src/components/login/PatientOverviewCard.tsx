import React from 'react'
import { AlertTriangle, User } from 'lucide-react'
import patientAvatar from '../../assets/patient_avatar.png'

interface PatientOverviewCardProps {
  isPreviewMode?: boolean
}

export const PatientOverviewCard: React.FC<PatientOverviewCardProps> = ({ isPreviewMode = false }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 w-full transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-3">
        <h3 className="text-xs font-bold text-[#0f2537] tracking-tight">Patient Overview</h3>
        {isPreviewMode ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>High Risk</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-500">
            <span>No Active Record</span>
          </div>
        )}
      </div>

      {/* Body: Avatar + Details + Risk Score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isPreviewMode ? (
            <img
              src={patientAvatar}
              alt="Ramesh Kumar"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-[#0f2537]">
              {isPreviewMode ? 'Ramesh Kumar' : 'Unassigned Patient'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {isPreviewMode ? 'Age 58  |  Male' : 'Age —  |  Gender —'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {isPreviewMode ? 'Patient ID: TBP00124' : 'Patient ID: —'}
            </p>
          </div>
        </div>

        {/* Risk Score */}
        <div className="text-right pl-3 border-l border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Risk Score
          </span>
          <span
            className={`text-lg font-black tracking-tight ${
              isPreviewMode ? 'text-[#0f2537]' : 'text-slate-400'
            }`}
          >
            {isPreviewMode ? '87%' : '—'}
          </span>
          {isPreviewMode ? (
            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 ml-auto">
              <div className="h-full bg-rose-500 rounded-full w-[87%]" />
            </div>
          ) : (
            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 ml-auto" />
          )}
        </div>
      </div>
    </div>
  )
}
