import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ShieldCheck, ArrowLeft, HeartPulse, Stethoscope } from 'lucide-react'
import ambientBg from '../assets/ambient_bg.png'
import trustbeatLogo from '../assets/trustbeat_logo_primary.png'
import doctorImg from '../assets/doctor_illustration.png'
import { FeatureList } from '../components/login/FeatureList'
import { RegisterForm } from '../components/register/RegisterForm'

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-[#eaf4f7] font-sans antialiased text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Decorative Hospital / Ambient Background Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-left-top bg-no-repeat opacity-50 pointer-events-none"
        style={{ backgroundImage: `url(${ambientBg})` }}
      />

      {/* Subtle cyan ambient bottom glow / wave */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-teal-500/10 via-cyan-400/5 to-transparent pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-teal-800 border border-teal-200/80 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
            <span>Back to Login</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            SECURE DOCTOR ONBOARDING PORTAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Already registered?
          </span>
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Doctor Login
          </Link>
        </div>
      </header>

      {/* Main Container: Two-column Desktop Layout */}
      <main className="relative z-20 w-full max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ============================================================== */}
          {/* LEFT PROMOTIONAL & CLINICAL HERO (~55-60% width on desktop)    */}
          {/* ============================================================== */}
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Upper Content: Brand, Headline & Visual Composition */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Brand Logo, Headline & Value Proposition */}
              <div className="md:col-span-12 xl:col-span-7 flex flex-col space-y-4">
                {/* TrustBeat Primary Logo */}
                <div className="pt-1">
                  <img
                    src={trustbeatLogo}
                    alt="TrustBeat — Your Heart Health, Our Intelligent Care"
                    className="h-12 sm:h-14 object-contain select-none"
                  />
                </div>

                {/* Headline */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-extrabold text-[#0f2537] leading-[1.18] tracking-tight">
                    Join the TrustBeat<br />
                    Network of <span className="text-teal-600">Cardiologists</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-[440px]">
                    Register your clinical credentials to review patient assessments, examine Grad-CAM visual heatmaps, and verify blockchain-anchored integrity in real time.
                  </p>
                </div>

                {/* 4 Feature Rows */}
                <div className="pt-2">
                  <FeatureList />
                </div>
              </div>

              {/* Right Column: Doctor Illustration & Credential Card */}
              <div className="hidden xl:flex xl:col-span-5 flex-col items-center relative pt-2">
                <div className="relative w-full max-w-[280px] flex justify-center -mb-6 z-10 pointer-events-none select-none">
                  <img
                    src={doctorImg}
                    alt="Cardiologist Doctor"
                    className="w-full h-auto max-h-[260px] object-contain drop-shadow-sm"
                  />
                </div>

                {/* Onboarding Credential Info Card */}
                <div className="relative z-20 w-full max-w-[320px] bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-teal-100 shadow-md space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-xs border-b border-slate-100 pb-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Physician Verification Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Every registered practitioner receives a permanent cryptographically generated Doctor ID. Mobile patients can only consult verified physicians approved by clinical governance.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-teal-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Argon2id &bull; Role-Isolation &bull; On-Chain Integrity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Promotional Metric Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    Multi-Clinic
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Physician Directory</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    Grad-CAM
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Explainable AI Analysis</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0f2537] block leading-tight">
                    Ethereum L2
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Tamper-Proof Audit Trail</span>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* RIGHT REGISTRATION SECTION (~40-45% width on desktop)           */}
          {/* ============================================================== */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end">
            <RegisterForm />
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

export default Register
