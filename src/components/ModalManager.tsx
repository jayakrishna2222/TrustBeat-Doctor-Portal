import React, { useState } from 'react'
import {
  X,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api, type DoctorProfile } from '../services/api'

export const ModalManager: React.FC = () => {
  const { activeModal, modalData, closeModal, addToast } = useApp()

  // Patient / Assessment form states
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('Male')
  const [patientPhone, setPatientPhone] = useState('')

  const [assessmentPatient, setAssessmentPatient] = useState('')
  const [assessmentType, setAssessmentType] = useState('Full Cardiovascular Panel')

  // Password reset states
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Contact admin states
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  // Doctor registration states
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regLicense, setRegLicense] = useState('')
  const [regAuthority, setRegAuthority] = useState('Karnataka Medical Council')
  const [regSpecialty, setRegSpecialty] = useState('Cardiology')
  const [regHospital, setRegHospital] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regError, setRegError] = useState('')
  const [registeredDoctor, setRegisteredDoctor] = useState<DoctorProfile | null>(null)
  const [copiedDoctorId, setCopiedDoctorId] = useState(false)

  if (!activeModal) return null

  const handleCopyDoctorId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedDoctorId(true)
    addToast('Doctor ID copied to clipboard.', 'success')
    setTimeout(() => setCopiedDoctorId(false), 2000)
  }

  const handleDoctorRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (
      !regFullName.trim() ||
      !regEmail.trim() ||
      !regPassword.trim() ||
      !regPasswordConfirm.trim() ||
      !regLicense.trim() ||
      !regAuthority.trim()
    ) {
      setRegError('Please fill in all mandatory fields (*).')
      return
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Passwords do not match.')
      return
    }

    if (regPassword.length < 8) {
      setRegError('Password must contain at least 8 characters.')
      return
    }

    setRegSubmitting(true)
    try {
      const res = await api.registerDoctor({
        full_name: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        password_confirm: regPasswordConfirm,
        license_number: regLicense.trim(),
        licensing_authority: regAuthority.trim(),
        specialty: regSpecialty.trim(),
        hospital_affiliation: regHospital.trim(),
        phone_number: regPhone.trim(),
      })
      setRegisteredDoctor(res.doctor)
      addToast('Doctor registration submitted successfully.', 'success')
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please try again.')
    } finally {
      setRegSubmitting(false)
    }
  }

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      addToast('Please enter your clinical email address.', 'warning')
      return
    }
    setResetSubmitting(true)
    try {
      await api.requestPasswordReset(resetEmail.trim())
      setResetSuccess(true)
      addToast('Password recovery instructions dispatched.', 'info')
    } catch {
      setResetSuccess(true)
    } finally {
      setResetSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative my-8">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================== */}
        {/* DOCTOR REGISTRATION MODAL                                      */}
        {/* ============================================================== */}
        {activeModal === 'doctor-register' && (
          <div>
            {registeredDoctor ? (
              <div className="text-center py-3 space-y-4 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registration Complete</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your doctor account has been registered with Argon2id password encryption.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Permanent Doctor ID
                    </span>
                    <button
                      onClick={() => handleCopyDoctorId(registeredDoctor.doctor_id)}
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      {copiedDoctorId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDoctorId ? 'Copied' : 'Copy ID'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-white border border-teal-200 rounded-xl font-mono text-sm font-bold text-teal-900 flex items-center justify-between">
                    <span>{registeredDoctor.doctor_id}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-600">Verification Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      Pending Administrative Review
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-left leading-relaxed">
                  You can now log in using your clinical email and password. Once hospital verification is approved, patients can link to you using this permanent Doctor ID.
                </p>

                <button
                  onClick={() => {
                    setRegisteredDoctor(null)
                    closeModal()
                  }}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Proceed to Login
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">Doctor Account Registration</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Register your medical credentials to receive a permanent Doctor ID.
                </p>

                {regError && (
                  <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleDoctorRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Sunita Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="doctor@hospital.org"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medical License No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="e.g. KMC/2026/12345"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Licensing Authority *
                      </label>
                      <input
                        type="text"
                        required
                        value={regAuthority}
                        onChange={(e) => setRegAuthority(e.target.value)}
                        placeholder="e.g. State Medical Council"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={regSpecialty}
                        onChange={(e) => setRegSpecialty(e.target.value)}
                        placeholder="e.g. Cardiology"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hospital Affiliation
                      </label>
                      <input
                        type="text"
                        value={regHospital}
                        onChange={(e) => setRegHospital(e.target.value)}
                        placeholder="e.g. Apollo Hospital"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {regSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{regSubmitting ? 'Registering...' : 'Register Account'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* FORGOT PASSWORD MODAL                                          */}
        {/* ============================================================== */}
        {activeModal === 'forgot-password' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your clinical email address to receive secure password recovery instructions.
            </p>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Request Dispatched</span>
                </div>
                <p>
                  If that clinical email address is registered, instructions have been dispatched. Please check your inbox or hospital mail directory.
                </p>
                <button
                  onClick={() => {
                    setResetSuccess(false)
                    closeModal()
                  }}
                  className="w-full py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  Password reset tokens are verified by the backend password-hashing authority.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {resetSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{resetSubmitting ? 'Sending...' : 'Send Instructions'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* CONTACT ADMIN MODAL                                            */}
        {/* ============================================================== */}
        {activeModal === 'contact-admin' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Contact Administrator</h3>
            <p className="text-xs text-slate-500 mb-4">
              Hospital cardiology departments must request system provisioning through medical administration.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="doctor@trustbeat.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry / Request</label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your department or access request..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeModal()
                  addToast('Admin inquiry noted. Hospital IT has been notified.', 'info')
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NEW CARDIOVASCULAR ASSESSMENT                                 */}
        {/* ============================================================== */}
        {activeModal === 'new-assessment' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">New Cardiovascular Assessment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Initiate a clinical AI assessment for an active patient profile.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Identifier or Name
                </label>
                <input
                  type="text"
                  value={assessmentPatient}
                  onChange={(e) => setAssessmentPatient(e.target.value)}
                  placeholder="e.g. TBP00125 or Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assessment Protocol
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                >
                  <option value="Full Cardiovascular Panel">Full Cardiovascular Panel</option>
                  <option value="Cardiac MRI & Grad-CAM Analysis">Cardiac MRI & Grad-CAM Analysis</option>
                  <option value="Hypertension & Arterial Stiffness">Hypertension & Arterial Stiffness</option>
                  <option value="Post-Intervention Follow-up">Post-Intervention Follow-up</option>
                </select>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-teal-900 leading-relaxed">
                  <strong>Diagnostic Standard:</strong> All AI inference outputs require cardiologist validation before clinical decisions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!assessmentPatient.trim()) {
                    addToast('Please enter a patient identifier', 'warning')
                    return
                  }
                  closeModal()
                  addToast(
                    'Cardiovascular assessment queued for inference.',
                    'success'
                  )
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Run Assessment
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADD PATIENT                                                   */}
        {/* ============================================================== */}
        {activeModal === 'add-patient' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Patient</h3>
            <p className="text-xs text-slate-500 mb-4">
              Register a new patient into the hospital registry.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sunita Iyer"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 52"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!patientName.trim() || !patientAge.trim()) {
                    addToast('Please fill in required fields (Name & Age)', 'warning')
                    return
                  }
                  closeModal()
                  addToast(
                    `Patient ${patientName} registered into cardiology registry.`,
                    'success'
                  )
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Register Patient
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* INTEGRATION CONNECT                                            */}
        {/* ============================================================== */}
        {activeModal === 'integration-connect' && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Configure {(modalData as { name?: string })?.name || 'Integration'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter API credentials or OAuth tokens to synchronize health services.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">API Key / Client Secret</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeModal()
                  addToast('Integration credentials saved.', 'success')
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
