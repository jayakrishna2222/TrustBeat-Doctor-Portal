import React from 'react'
import { Users, FileCheck, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import ambientBg from '../assets/ambient_bg.png'
import trustbeatLogo from '../assets/trustbeat_logo_primary.png'
import doctorImg from '../assets/doctor_illustration.png'
import { FeatureList } from '../components/login/FeatureList'
import { PatientOverviewCard } from '../components/login/PatientOverviewCard'
import { RiskPredictionCard } from '../components/login/RiskPredictionCard'
import { AIAnalysisCard } from '../components/login/AIAnalysisCard'
import { KeyFactorsCard } from '../components/login/KeyFactorsCard'
import { LoginForm } from '../components/login/LoginForm'
import { useApp } from '../context/AppContext'

import { useSearchParams } from 'react-router-dom'

export const Login: React.FC = () => {
  const { isPreviewMode, togglePreviewMode } = useApp()
  const [searchParams] = useSearchParams()

  // If ?preview=true is passed and preview mode is not yet on, toggle it on mount
  React.useEffect(() => {
    if (searchParams.get('preview') === 'true' && !isPreviewMode) {
      togglePreviewMode()
    }
  }, [searchParams, isPreviewMode, togglePreviewMode])

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-[#eaf4f7] font-sans antialiased text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Decorative Hospital / Ambient Background Artwork (Clean, no text/UI embedded) */}
      <div
        className="absolute inset-0 bg-cover bg-left-top bg-no-repeat opacity-50 pointer-events-none"
        style={{ backgroundImage: `url(${ambientBg})` }}
      />

      {/* Subtle cyan ambient bottom glow / wave */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-teal-500/10 via-cyan-400/5 to-transparent pointer-events-none" />

      {/* Top Bar for Mode Switching & Safety Indicator */}
      <div className="relative z-30 w-full px-4 sm:px-8 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isPreviewMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            {isPreviewMode
              ? 'DESIGN PREVIEW ACTIVE (Sample Reference Data)'
              : 'OPERATIONAL MODE (Zero Fake Data Active)'}
          </span>
        </div>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={togglePreviewMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
            isPreviewMode
              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              : 'bg-white/90 border-teal-200 text-teal-800 hover:bg-teal-50'
          }`}
          title="Toggle between Reference Preview (sample values from screenshot) and Zero Fake Data operational state"
        >
          {isPreviewMode ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-teal-600" />}
          <span>{isPreviewMode ? 'Exit Reference Preview' : 'Preview Reference Data'}</span>
        </button>
      </div>

      {/* Main Container: Two-column Desktop Layout */}
      <main className="relative z-20 w-full max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          
          {/* ============================================================== */}
          {/* LEFT PROMOTIONAL & CLINICAL SECTION (~65% width on desktop)  */}
          {/* ============================================================== */}
          <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-6">
            
            {/* Upper Content: Brand, Headline & Visual Composition */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-6 items-start">
              
              {/* Left Column: Brand Logo, Headline & Feature List */}
              <div className="md:col-span-6 xl:col-span-5 flex flex-col space-y-4">
                {/* Crisp TrustBeat Primary Logo (Always 100% visible, never clipped) */}
                <div className="pt-1">
                  <img
                    src={trustbeatLogo}
                    alt="TrustBeat — Your Heart Health, Our Intelligent Care"
                    className="h-12 sm:h-14 lg:h-14 object-contain select-none"
                  />
                </div>

                {/* Headline matching Reference Typography */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-extrabold text-[#0f2537] leading-[1.18] tracking-tight">
                    Empowering<br />
                    Cardiologists with<br />
                    <span className="text-teal-600">Intelligent Insights</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-[380px]">
                    Access patient cardiovascular risk assessments, AI-powered reports and make better, faster clinical decisions.
                  </p>
                </div>

                {/* 4 Feature Rows */}
                <div className="pt-2">
                  <FeatureList />
                </div>
              </div>

              {/* Right Column: Doctor Artwork & Floating Analytical Cards */}
              <div className="md:col-span-6 xl:col-span-7 flex flex-col items-center relative pt-2">
                
                {/* Doctor Portrait Illustration (Centered, clean silhouette) */}
                <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex justify-center -mb-8 z-10 pointer-events-none select-none">
                  <img
                    src={doctorImg}
                    alt="Cardiologist Doctor"
                    className="w-full h-auto max-h-[290px] sm:max-h-[320px] object-contain drop-shadow-sm"
                  />
                </div>

                {/* Patient Overview Card (Overlapping doctor illustration) */}
                <div className="relative z-20 w-full max-w-[440px] mb-3">
                  <PatientOverviewCard isPreviewMode={isPreviewMode} />
                </div>

                {/* 3 Analytics Cards Grid */}
                <div className="relative z-20 w-full max-w-[440px] grid grid-cols-3 gap-2 sm:gap-3">
                  <RiskPredictionCard isPreviewMode={isPreviewMode} />
                  <AIAnalysisCard isPreviewMode={isPreviewMode} />
                  <KeyFactorsCard isPreviewMode={isPreviewMode} />
                </div>
              </div>
            </div>

            {/* Bottom Promotional Metric Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 border-t border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    {isPreviewMode ? '10,000+' : 'Multi-Clinic'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Patients Managed</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    {isPreviewMode ? '95%' : 'Calibrated'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Accurate Risk Prediction</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    {isPreviewMode ? '100%' : 'HIPAA / SOC2'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Secure & Compliant</span>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* RIGHT LOGIN SECTION (~35% width on desktop)                    */}
          {/* ============================================================== */}
          <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
            <LoginForm />
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-20 w-full py-2 px-6 text-center text-[11px] text-slate-500">
        TrustBeat Healthcare Intelligence &copy; {new Date().getFullYear()}. All clinical rights reserved.
      </footer>
    </div>
  )
}
