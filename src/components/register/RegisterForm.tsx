import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Award,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import trustbeatLogo from '../../assets/trustbeat_logo_primary.png'
import { api, type DoctorProfile } from '../../services/api'
import { useApp } from '../../context/AppContext'

interface RegisterFormProps {
  className?: string
  onSuccess?: (doctor: DoctorProfile) => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = '',
  onSuccess,
}) => {
  const navigate = useNavigate()
  const { addToast } = useApp()

  // Form input state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licensingAuthority, setLicensingAuthority] = useState('Karnataka Medical Council')
  const [specialty, setSpecialty] = useState('Cardiology')
  const [hospitalAffiliation, setHospitalAffiliation] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [registeredDoctor, setRegisteredDoctor] = useState<DoctorProfile | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  const handleCopyDoctorId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    addToast('Permanent Doctor ID copied to clipboard.', 'success')
    setTimeout(() => setCopiedId(false), 2500)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const cleanFullName = fullName.trim()
    const cleanEmail = email.trim()
    const cleanPassword = password.trim()
    const cleanPasswordConfirm = passwordConfirm.trim()
    const cleanLicense = licenseNumber.trim()
    const cleanAuthority = licensingAuthority.trim()

    // Validation
    if (!cleanFullName || !cleanEmail || !cleanPassword || !cleanPasswordConfirm || !cleanLicense || !cleanAuthority) {
      setFormError('Please fill in all mandatory fields marked with an asterisk (*).')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid clinical email address format (e.g., doctor@hospital.org).')
      return
    }

    if (cleanPassword.length < 8) {
      setFormError('Password must contain at least 8 characters.')
      return
    }

    if (cleanPassword !== cleanPasswordConfirm) {
      setFormError('Passwords do not match. Please ensure both fields are identical.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.registerDoctor({
        full_name: cleanFullName,
        email: cleanEmail,
        password: cleanPassword,
        password_confirm: cleanPasswordConfirm,
        license_number: cleanLicense,
        licensing_authority: cleanAuthority,
        specialty: specialty.trim() || 'Cardiology',
        hospital_affiliation: hospitalAffiliation.trim(),
        phone_number: phoneNumber.trim(),
      })

      setRegisteredDoctor(res.doctor)
      addToast('Doctor credentials registered successfully.', 'success')
      if (onSuccess) {
        onSuccess(res.doctor)
      }
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please review your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Registration Complete Success View
  if (registeredDoctor) {
    return (
      <div
        className={`w-full max-w-[500px] bg-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100 flex flex-col text-center animate-in fade-in ${className}`}
      >
        <div className="flex flex-col items-center mb-4">
          <img
            src={trustbeatLogo}
            alt="TrustBeat Doctor Portal"
            className="h-10 sm:h-11 object-contain mb-3"
          />
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f2537] mb-1">
          Registration Complete
        </h2>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Your physician account has been securely provisioned with Argon2id cryptographic password hashing.
        </p>

        {/* Doctor Identity & Verification Status Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 mb-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Permanent Doctor ID
              </span>
              <button
                type="button"
                onClick={() => handleCopyDoctorId(registeredDoctor.doctor_id)}
                className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>
            <div className="p-3 bg-white border border-teal-200 rounded-xl font-mono text-sm font-bold text-teal-950 select-all flex items-center justify-between">
              <span>{registeredDoctor.doctor_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Clinician:</span>
              <span className="font-semibold text-slate-800">{registeredDoctor.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Specialty:</span>
              <span className="font-semibold text-slate-800">{registeredDoctor.specialty}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">License:</span>
              <span className="font-mono text-slate-700">{registeredDoctor.license_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Verification:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Pending Review
              </span>
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-[11px] text-amber-900 leading-relaxed mb-6 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            Verification Policy
          </p>
          <p>
            You can log in immediately to explore the clinical workspace. In accordance with clinical safety constraints, your profile will be listed in the mobile patient consultation directory once your medical registration credentials are professionally verified by hospital administration.
          </p>
        </div>

        {/* Proceed to Login Button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Proceed to Doctor Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`w-full max-w-[500px] bg-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100 flex flex-col ${className}`}
    >
      {/* Brand logo at top */}
      <div className="flex flex-col items-center text-center mb-4">
        <img
          src={trustbeatLogo}
          alt="TrustBeat Doctor Portal"
          className="h-9 sm:h-10 object-contain"
        />
      </div>

      {/* Heading & Subtitle */}
      <div className="mb-5 text-center">
        <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0f2537] mb-1.5 leading-tight">
          Register as <span className="text-teal-600">Doctor</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[360px] mx-auto">
          Create your verified clinical account to access patient cardiovascular assessments and intelligent AI reports.
        </p>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-snug break-words">{formError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Legal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (formError) setFormError('')
              }}
              placeholder="Dr. Sunita Sharma, MD"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Clinical Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (formError) setFormError('')
              }}
              placeholder="sunita.sharma@hospital.org"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (formError) setFormError('')
                }}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                required
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value)
                  if (formError) setFormError('')
                }}
                placeholder="Repeat password"
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
              >
                {showPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* License & Authority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medical License No. <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value)
                  if (formError) setFormError('')
                }}
                placeholder="e.g. KMC-78921"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Licensing Authority <span className="text-rose-500">*</span>
            </label>
            <select
              value={licensingAuthority}
              onChange={(e) => setLicensingAuthority(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-teal-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="Karnataka Medical Council">Karnataka Medical Council</option>
              <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
              <option value="Delhi Medical Council">Delhi Medical Council</option>
              <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
              <option value="National Medical Commission">National Medical Commission (NMC)</option>
              <option value="General Medical Council">General Medical Council (GMC)</option>
              <option value="State Medical Board">State Medical Board</option>
            </select>
          </div>
        </div>

        {/* Specialty & Hospital Affiliation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specialty
            </label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Cardiology / Electrophysiology"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hospital Affiliation
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={hospitalAffiliation}
                onChange={(e) => setHospitalAffiliation(e.target.value)}
                placeholder="Apollo Heart Centre"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Contact Phone
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Security & Argon2 Notice */}
        <p className="text-[11px] text-slate-400 leading-tight pt-1">
          Protected with Argon2id password derivation and role-isolated clinician privileges.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering Clinician Credentials...</span>
            </>
          ) : (
            <>
              <span>Complete Doctor Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login link */}
      <div className="text-center pt-4 mt-4 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-teal-700 hover:underline cursor-pointer"
          >
            Sign in to Doctor Portal
          </Link>
        </p>
      </div>
    </div>
  )
}
