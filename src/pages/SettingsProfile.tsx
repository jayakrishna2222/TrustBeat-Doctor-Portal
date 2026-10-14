import React, { useState } from 'react'
import {
  User,
  Briefcase,
  Calendar,
  Bell,
  Shield,
  Sliders,
  Link2,
  Camera,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  KeyRound,
  Laptop,
  Eye,
  Edit,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import doctorAvatar from '../assets/doctor_avatar.png'
import { EmptyState } from '../components/EmptyState'

export const SettingsProfile: React.FC = () => {
  const { currentDoctor, isPreviewMode, addToast, refreshDoctorProfile } = useApp()

  const [activeTab, setActiveTab] = useState<
    'Profile' | 'Professional Details' | 'Availability' | 'Notifications' | 'Security' | 'Preferences' | 'Integrations'
  >('Profile')

  const [copiedId, setCopiedId] = useState(false)

  const activeDoctorId = currentDoctor?.doctor_id || (isPreviewMode ? 'DOC-7F21A9C84D36B508' : '')
  const isVerified = currentDoctor ? currentDoctor.is_verified : isPreviewMode

  // Form states
  const [fullName, setFullName] = useState(
    currentDoctor?.full_name || (isPreviewMode ? 'Dr. Arjun Mehta' : '')
  )
  const [email, setEmail] = useState(
    currentDoctor?.email || (isPreviewMode ? 'arjun.mehta@trustbeat.com' : '')
  )
  const [phone, setPhone] = useState(
    currentDoctor?.phone_number || (isPreviewMode ? '+91 98765 43210' : '')
  )
  const [location, setLocation] = useState(isPreviewMode ? 'Bangalore, Karnataka' : '')
  const [dob, setDob] = useState(isPreviewMode ? '15 Mar 1982' : '')

  const [specialization, setSpecialization] = useState(
    currentDoctor?.specialty || (isPreviewMode ? 'Cardiology' : '')
  )
  const [subSpec, setSubSpec] = useState(isPreviewMode ? 'Interventional Cardiology' : '')
  const [qualification, setQualification] = useState(
    isPreviewMode ? 'MBBS, MD (Cardiology), DM (Cardiology)' : ''
  )
  const [license, setLicense] = useState(
    currentDoctor?.license_number || (isPreviewMode ? 'KMC/2024/12345' : '')
  )
  const [licensingAuthority, setLicensingAuthority] = useState(
    currentDoctor?.licensing_authority || (isPreviewMode ? 'Karnataka Medical Council' : '')
  )
  const [hospital, setHospital] = useState(
    currentDoctor?.hospital_affiliation || (isPreviewMode ? 'Aster CMI Hospital' : '')
  )
  const [experience, setExperience] = useState(isPreviewMode ? '12' : '')
  const [bio, setBio] = useState(
    isPreviewMode
      ? 'Experienced cardiologist specializing in preventive cardiology, interventional cardiology, and cardiovascular imaging. Passionate about using AI and technology for better patient outcomes.'
      : ''
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false)

  // Toggles
  const [notifAppt, setNotifAppt] = useState(true)
  const [notifMsg, setNotifMsg] = useState(true)
  const [notifReports, setNotifReports] = useState(true)
  const [notifAI, setNotifAI] = useState(true)
  const [notifSystem, setNotifSystem] = useState(false)

  React.useEffect(() => {
    if (currentDoctor) {
      setFullName(currentDoctor.full_name)
      setEmail(currentDoctor.email)
      setPhone(currentDoctor.phone_number || '')
      setSpecialization(currentDoctor.specialty || 'Cardiology')
      setLicense(currentDoctor.license_number || '')
      setLicensingAuthority(currentDoctor.licensing_authority || 'Karnataka Medical Council')
      setHospital(currentDoctor.hospital_affiliation || '')
      setLocation('Bangalore, Karnataka')
      setDob('15 Mar 1982')
      setSubSpec('Interventional Cardiology')
      setQualification('MBBS, MD (Cardiology), DM (Cardiology)')
      setExperience('12')
      setBio(
        'Experienced cardiologist specializing in preventive cardiology, interventional cardiology, and cardiovascular imaging. Passionate about using AI and technology for better patient outcomes.'
      )
    } else if (isPreviewMode) {
      setFullName('Dr. Arjun Mehta')
      setEmail('arjun.mehta@trustbeat.com')
      setPhone('+91 98765 43210')
      setLocation('Bangalore, Karnataka')
      setDob('15 Mar 1982')
      setSpecialization('Cardiology')
      setSubSpec('Interventional Cardiology')
      setQualification('MBBS, MD (Cardiology), DM (Cardiology)')
      setLicense('KMC/2024/12345')
      setLicensingAuthority('Karnataka Medical Council')
      setHospital('Aster CMI Hospital')
      setExperience('12')
      setBio(
        'Experienced cardiologist specializing in preventive cardiology, interventional cardiology, and cardiovascular imaging. Passionate about using AI and technology for better patient outcomes.'
      )
    } else {
      setFullName('')
      setEmail('')
      setPhone('')
      setLocation('')
      setDob('')
      setSpecialization('')
      setSubSpec('')
      setQualification('')
      setLicense('')
      setLicensingAuthority('')
      setHospital('')
      setExperience('')
      setBio('')
    }
  }, [currentDoctor, isPreviewMode])

  const handleCopyDoctorId = (id: string) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    addToast(`Doctor ID copied: ${id}`, 'success')
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!license || !license.trim()) {
      addToast('Valid medical registration/license number is required.', 'warning')
      return
    }

    setIsSubmittingCredentials(true)
    try {
      const formData = new FormData()
      formData.append('license_number', license.trim())
      if (licensingAuthority.trim()) {
        formData.append('licensing_authority', licensingAuthority.trim())
      }
      if (specialization.trim()) {
        formData.append('specialty', specialization.trim())
      }
      if (hospital.trim()) {
        formData.append('hospital_affiliation', hospital.trim())
      }
      if (bio.trim()) {
        formData.append('bio', bio.trim())
      }
      if (selectedFile) {
        formData.append('credential_document', selectedFile)
      }

      const res = await api.submitDoctorCredentials(formData)
      if (res.success) {
        addToast(
          res.message || 'Medical credentials submitted successfully for administrative review.',
          'success'
        )
        setSelectedFile(null)
        await refreshDoctorProfile()
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to submit medical credentials.', 'error')
    } finally {
      setIsSubmittingCredentials(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 16.1 Header & Tabs */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account, professional details, preferences and security settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {[
          { label: 'Profile', key: 'Profile', icon: User },
          { label: 'Professional Details', key: 'Professional Details', icon: Briefcase },
          { label: 'Availability', key: 'Availability', icon: Calendar },
          { label: 'Notifications', key: 'Notifications', icon: Bell },
          { label: 'Security', key: 'Security', icon: Shield },
          { label: 'Preferences', key: 'Preferences', icon: Sliders },
          { label: 'Integrations', key: 'Integrations', icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Profile & Professional Forms (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 16.2 Profile Information */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Information</h3>
              <p className="text-[11px] text-slate-400">
                Update your personal and contact information.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="relative group shrink-0">
                {currentDoctor || isPreviewMode ? (
                  <img
                    src={doctorAvatar}
                    alt="Profile Avatar"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-500 font-bold text-xl flex items-center justify-center ring-4 ring-white shadow-sm">
                    DR
                  </div>
                )}
                <button
                  onClick={() => addToast('Photo upload dialog opened.', 'info')}
                  className="absolute bottom-0 right-0 p-1.5 bg-teal-700 text-white rounded-full shadow-md hover:bg-teal-800 transition-colors"
                  aria-label="Change photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {fullName || 'Clinician Profile'}
                  </h4>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  ) : currentDoctor?.preview_access_enabled ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Preview Access Enabled — Credential Verification Pending
                    </span>
                  ) : activeDoctorId ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Pending Verification
                    </span>
                  ) : null}
                </div>

                {/* Permanent Doctor ID Display */}
                {activeDoctorId && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Doctor ID:
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200 select-all">
                      {activeDoctorId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyDoctorId(activeDoctorId)}
                      className="p-1 text-slate-400 hover:text-teal-700 transition-colors cursor-pointer rounded-md hover:bg-slate-200/60"
                      title="Copy Doctor ID to clipboard"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-teal-700" />
                      )}
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-500 font-medium">
                  {specialization || 'Specialization unassigned'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {license ? `Medical License: ${license}` : qualification || 'Credentials pending verification'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {hospital || (experience ? `${experience}+ years of experience` : 'Experience unconfigured')}
                </p>
              </div>

              <button
                onClick={() => addToast('Image selector active.', 'info')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            {/* Profile inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Arjun Mehta"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              {/* Immutable Permanent Doctor ID input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent Doctor ID (Server-Generated & Immutable)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={activeDoctorId || 'Not Generated (Sign in required)'}
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700 cursor-not-allowed select-all"
                  />
                  {activeDoctorId && (
                    <button
                      type="button"
                      onClick={() => handleCopyDoctorId(activeDoctorId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-700 cursor-pointer"
                      title="Copy Doctor ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-teal-700" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@trustbeat.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bangalore, Karnataka"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="DD Mon YYYY"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 16.3 Professional Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Professional Details</h3>
              <p className="text-[11px] text-slate-400">
                Update your medical credentials and specialization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Cardiac Surgery">Cardiac Surgery</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-specialization
                </label>
                <select
                  value={subSpec}
                  onChange={(e) => setSubSpec(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                >
                  <option value="">Select Sub-specialization</option>
                  <option value="Interventional Cardiology">Interventional Cardiology</option>
                  <option value="Electrophysiology">Electrophysiology</option>
                  <option value="Heart Failure">Heart Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. MBBS, MD"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="KMC/2024/00000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Hospital Name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Licensing Authority / State Council
                </label>
                <input
                  type="text"
                  value={licensingAuthority}
                  onChange={(e) => setLicensingAuthority(e.target.value)}
                  placeholder="e.g. Karnataka Medical Council"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credential Certificate / Registration Proof (PDF, PNG, JPG &lt; 10MB)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-xs text-slate-500 truncate">
                      {selectedFile ? selectedFile.name : currentDoctor?.has_credential_document ? 'Certificate on file (click to replace)' : 'Upload council certificate...'}
                    </span>
                    <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0]
                          if (f.size > 10 * 1024 * 1024) {
                            addToast('File exceeds 10MB limit.', 'error')
                            return
                          }
                          setSelectedFile(f)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Bio / About</label>
                  <span className="text-[10px] text-slate-400">{bio.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Physician bio and clinical areas of interest..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Verification Status & Missing Requirements Alert */}
            {currentDoctor && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {currentDoctor.is_verified ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Account Verified & Active in Consult Directory.</span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Your professional medical credentials have been approved by hospital administration.
                      </p>
                    </div>
                  </div>
                ) : currentDoctor.verification_status === 'rejected' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Verification Decision: Rejected by Hospital Administration</span>
                    </div>
                    {currentDoctor.review_notes && (
                      <p className="text-[11px] text-rose-800 bg-white/70 p-2 rounded-lg border border-rose-100 font-medium">
                        Reason: {currentDoctor.review_notes}
                      </p>
                    )}
                    <p className="text-[11px] text-rose-600">
                      Please update your statutory registration number and upload a clear council certificate, then click "Submit Credentials for Verification" below.
                    </p>
                  </div>
                ) : currentDoctor.verification_status === 'under_review' ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                    <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
                    <div>
                      <span className="font-bold">Credentials Under Administrative Review.</span>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Your medical credentials were submitted on {currentDoctor.submitted_at ? new Date(currentDoctor.submitted_at).toLocaleDateString() : 'recently'} and are awaiting review.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Verification Status: Pending Submission</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Account activation is separate from professional verification. To be listed in the Consult directory and receive patient reports, submit your medical license details below.
                    </p>
                    {currentDoctor.missing_requirements && currentDoctor.missing_requirements.length > 0 && (
                      <div className="text-[10px] text-amber-800 font-semibold pt-1">
                        Missing Requirements: {currentDoctor.missing_requirements.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Credentials Action */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitCredentials}
                    disabled={isSubmittingCredentials}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmittingCredentials ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSubmittingCredentials
                        ? 'Submitting Credentials...'
                        : 'Submit Credentials for Verification'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 16.6 Notification Preferences & Appearance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Notification Preferences</h4>
                <p className="text-[10px] text-slate-400">Choose what notifications you want to receive.</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">New appointment requests</span>
                  <input
                    type="checkbox"
                    checked={notifAppt}
                    onChange={(e) => setNotifAppt(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Patient messages</span>
                  <input
                    type="checkbox"
                    checked={notifMsg}
                    onChange={(e) => setNotifMsg(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Report generation alerts</span>
                  <input
                    type="checkbox"
                    checked={notifReports}
                    onChange={(e) => setNotifReports(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">AI insights and recommendations</span>
                  <input
                    type="checkbox"
                    checked={notifAI}
                    onChange={(e) => setNotifAI(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">System updates and announcements</span>
                  <input
                    type="checkbox"
                    checked={notifSystem}
                    onChange={(e) => setNotifSystem(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Appearance & Preferences */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Appearance & Preferences</h4>
                <p className="text-[10px] text-slate-400">Customize your portal experience.</p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Theme</label>
                  <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700">
                    <option>Light Mode</option>
                    <option>Dark Mode (Coming soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Language
                  </label>
                  <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700">
                    <option>English</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Time Zone
                  </label>
                  <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700">
                    <option>(GMT+05:30) India Standard Time</option>
                    <option>(GMT+00:00) UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Overview, Quick Actions & Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 16.4 Account Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Account Overview</h3>
              <button
                onClick={() => addToast('Edit profile shortcut.', 'info')}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {currentDoctor || isPreviewMode ? (
              <>
                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isVerified
                      ? 'bg-emerald-50/70 border-emerald-100'
                      : currentDoctor?.verification_status === 'rejected'
                      ? 'bg-rose-50/70 border-rose-100'
                      : 'bg-amber-50/70 border-amber-100'
                  }`}
                >
                  {isVerified ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : currentDoctor?.verification_status === 'rejected' ? (
                    <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isVerified
                          ? 'text-emerald-900'
                          : currentDoctor?.verification_status === 'rejected'
                          ? 'text-rose-900'
                          : 'text-amber-900'
                      }`}
                    >
                      {isVerified
                        ? 'Verified Doctor Account'
                        : currentDoctor?.verification_status === 'rejected'
                        ? 'Verification Rejected'
                        : 'Verification Pending Review'}
                    </h4>
                    <p
                      className={`text-[11px] ${
                        isVerified
                          ? 'text-emerald-700'
                          : currentDoctor?.verification_status === 'rejected'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {isVerified
                        ? 'Your account is verified and active on the blockchain registry.'
                        : currentDoctor?.verification_status === 'rejected'
                        ? 'Credential check failed. Contact administrator.'
                        : 'Awaiting licensing board and administrator approval.'}
                    </p>
                  </div>
                </div>

                {activeDoctorId && (
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                        Doctor Identifier
                      </span>
                      <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                        {activeDoctorId}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyDoctorId(activeDoctorId)}
                      className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-100/70 rounded-lg transition-colors cursor-pointer"
                      title="Copy Doctor ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-slate-900 block leading-tight">
                      248
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Patients</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-slate-900 block leading-tight">
                      412
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Reports</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-slate-900 block leading-tight">
                      86
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Appts</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-base font-extrabold text-slate-900 block leading-tight">
                      128
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Msgs</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <h4 className="text-xs font-bold text-slate-700">Account Not Connected</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connect your physician credentials via SSO or hospital directory service.
                </p>
              </div>
            )}
          </div>

          {/* 16.5 Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Quick Actions</h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => addToast('Change password modal.', 'info')}
                className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 font-semibold text-slate-700 text-left transition-colors"
              >
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="leading-tight">Change Password</span>
              </button>

              <button
                onClick={() => addToast('2FA setup requires authenticator token.', 'info')}
                className="p-3 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 font-semibold text-slate-700 text-left transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-tight">Two-Factor Auth</span>
              </button>

              <button
                onClick={() => addToast('Exporting local account metadata.', 'info')}
                className="p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 font-semibold text-slate-700 text-left transition-colors"
              >
                <Download className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="leading-tight">Download Data</span>
              </button>

              <button
                onClick={() => addToast('Account deletion requires admin authorization.', 'warning')}
                className="p-3 bg-rose-50/60 hover:bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 font-semibold text-rose-700 text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="leading-tight">Delete Account</span>
              </button>
            </div>
          </div>

          {/* 16.8 Account Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Account Activity</h4>
              <button className="text-[11px] font-bold text-teal-700 hover:underline">
                View All →
              </button>
            </div>

            {currentDoctor || isPreviewMode ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-medium text-slate-800">Profile updated</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Oct 2024, 10:30 AM</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-slate-800">Password changed</span>
                  </div>
                  <span className="text-[10px] text-slate-400">05 Oct 2024, 03:15 PM</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium text-slate-800">New device login (Windows)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">02 Oct 2024, 11:20 AM</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-medium text-slate-800">Profile viewed by patient</span>
                  </div>
                  <span className="text-[10px] text-slate-400">28 Sep 2024, 09:45 AM</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<User className="w-5 h-5 text-slate-400" />}
                title="No activity history"
                description="Security audit log will display after authenticated login."
                compact
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
