import React from 'react'
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        let Icon = Info
        let bg = 'bg-slate-900 text-white'

        if (toast.type === 'success') {
          Icon = CheckCircle
          bg = 'bg-emerald-800 text-white'
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle
          bg = 'bg-amber-800 text-white'
        } else if (toast.type === 'error') {
          Icon = XCircle
          bg = 'bg-rose-800 text-white'
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 ${bg}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
