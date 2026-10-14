import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  History,
  Copy,
  Check,
  Download,
  Building,
  RefreshCw,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { api, type DoctorProfile } from '../services/api'

export const DoctorVerification: React.FC = () => {
  const { currentDoctor, addToast } = useApp()

  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false)
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject'>('approve')
  const [decisionReason, setDecisionReason] = useState<string>('')
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false)
  const [decisionHistory, setDecisionHistory] = useState<
    Array<{ action: string; actor: string; details: string; timestamp: string }>
  >([])
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)

  const isAdmin = Boolean(currentDoctor?.role === 'admin' || currentDoctor?.is_staff)

  const loadDoctors = useCallback(async () => {
    if (!isAdmin) return
    setIsLoading(true)
    try {
      const filterParam = statusFilter === 'all' ? undefined : statusFilter
      const res = await api.adminGetDoctors(filterParam)
      if (res.success && res.doctors) {
        setDoctors(res.doctors)
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch doctor verification queue.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, statusFilter, addToast])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const handleCopyDoctorId = (id: string) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    addToast(`Doctor ID copied: ${id}`, 'info')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenDecisionModal = async (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    setDecisionAction(doctor.is_verified ? 'reject' : 'approve')
    setDecisionReason('')
    setIsDecisionModalOpen(true)
    setIsLoadingHistory(true)
    try {
      const inspectRes = await api.adminInspectDoctor(doctor.doctor_id)
      if (inspectRes.success) {
        setDecisionHistory(inspectRes.decision_history || [])
        if (inspectRes.doctor) {
          setSelectedDoctor(inspectRes.doctor)
        }
      }
    } catch {
      setDecisionHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleDownloadDocument = async (doctorId: string, doctorName: string) => {
    try {
      addToast('Downloading credential document...', 'info')
      const blob = await api.downloadCredentialDocument(doctorId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TrustBeat_Credential_${doctorId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      addToast(`Credential document for ${doctorName} downloaded.`, 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to download credential document.', 'error')
    }
  }

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return

    if (decisionAction === 'reject' && !decisionReason.trim()) {
      addToast('A valid rejection reason must be recorded for regulatory auditing.', 'warning')
      return
    }

    if (
      decisionAction === 'approve' &&
      (!selectedDoctor.license_number || selectedDoctor.license_number.trim() === '-')
    ) {
      addToast(
        'Cannot approve doctor: Valid statutory medical license number is required.',
        'error'
      )
      return
    }

    setIsSubmittingDecision(true)
    try {
      const reasonToSubmit =
        decisionReason.trim() ||
        (decisionAction === 'approve'
          ? 'Hospital administration reviewed and verified medical credentials and license registry.'
          : 'Verification rejected by administrator.')

      const res = await api.adminVerifyDoctor(
        selectedDoctor.doctor_id,
        decisionAction,
        reasonToSubmit
      )

      if (res.success) {
        addToast(res.message, 'success')
        setIsDecisionModalOpen(false)
        await loadDoctors()
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to process verification decision.', 'error')
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  // Filtered list by query
  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      doc.full_name?.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q) ||
      doc.doctor_id?.toLowerCase().includes(q) ||
      doc.license_number?.toLowerCase().includes(q) ||
      doc.specialty?.toLowerCase().includes(q) ||
      doc.hospital_affiliation?.toLowerCase().includes(q)
    )
  })

  // Aggregation counts
  const totalCount = doctors.length
  const pendingCount = doctors.filter(
    (d) => !d.is_verified && d.verification_status !== 'rejected'
  ).length
  const verifiedCount = doctors.filter((d) => d.is_verified).length
  const rejectedCount = doctors.filter((d) => d.verification_status === 'rejected').length

  // Authorization Check
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl mx-auto flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Hospital Administrator Access Required
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Credential verification, licensing board validation, and Consult directory approvals are
          strictly restricted to authorized hospital administrators and credentialing committee
          members.
        </p>
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1.5">
          <p className="font-semibold text-slate-700">Account Security Details:</p>
          <p className="text-slate-500">
            Current User: <span className="font-medium text-slate-800">{currentDoctor?.email || 'Unauthenticated'}</span>
          </p>
          <p className="text-slate-500">
            Doctor ID:{' '}
            <span className="font-mono text-teal-800 font-bold">
              {currentDoctor?.doctor_id || 'N/A'}
            </span>
          </p>
          <p className="text-slate-500">
            Administrative Privileges:{' '}
            <span className="font-bold text-rose-600">Denied (Requires role='admin' or is_staff)</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Doctor Credential Verification
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-teal-100 text-teal-800 border border-teal-200">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative clinical credential review, statutory licensing authority verification,
            and Consult directory management.
          </p>
        </div>

        <button
          onClick={loadDoctors}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Clinicians</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Authoritative database records</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{pendingCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Awaiting admin decision</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Verified & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900">{verifiedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Listed in Consult directory</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Rejected / Suspended</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">{rejectedCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Credential check failed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, Doctor ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {(
            [
              { key: 'all', label: 'All Clinicians' },
              { key: 'pending', label: 'Pending Review' },
              { key: 'approved', label: 'Verified' },
              { key: 'rejected', label: 'Rejected' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Doctor Records Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Doctor Verification Queue ({filteredDoctors.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Preserves persistent Doctor IDs & regulatory audit trail
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Loading doctor profiles from authoritative backend...</span>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No doctor records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-3 px-4">Clinician & Persistent Doctor ID</th>
                  <th className="py-3 px-4">Medical License & Authority</th>
                  <th className="py-3 px-4">Specialty & Affiliation</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Credential Document</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDoctors.map((doc) => {
                  const isRejected = doc.verification_status === 'rejected'
                  const isApproved = doc.is_verified

                  return (
                    <tr
                      key={doc.id || doc.doctor_id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Doctor Identity */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{doc.full_name || 'Dr. Unspecified'}</span>
                          {doc.is_active === false && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-200 text-slate-600">
                              DEACTIVATED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{doc.email}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 select-all">
                            {doc.doctor_id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyDoctorId(doc.doctor_id)}
                            className="p-0.5 text-slate-400 hover:text-teal-700 cursor-pointer"
                            title="Copy Doctor ID"
                          >
                            {copiedId === doc.doctor_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* License & Authority */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {doc.license_number && doc.license_number !== '-' ? (
                            doc.license_number
                          ) : (
                            <span className="text-amber-600 font-medium italic">
                              Not Provided
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {doc.licensing_authority || 'Statutory authority unspecified'}
                        </div>
                      </td>

                      {/* Specialty & Hospital */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {doc.specialty || 'General Practice'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {doc.hospital_affiliation || 'Independent / Unaffiliated'}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </div>
                        ) : isRejected ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{doc.verification_status === 'under_review' ? 'Under Review' : 'Pending'}</span>
                          </div>
                        )}

                        {doc.missing_requirements && doc.missing_requirements.length > 0 && !isApproved && (
                          <div className="mt-1 text-[10px] text-amber-600 font-medium">
                            Missing: {doc.missing_requirements.join(', ')}
                          </div>
                        )}

                        {doc.review_notes && (
                          <div className="mt-1 text-[10px] text-slate-500 italic truncate max-w-xs" title={doc.review_notes}>
                            Note: {doc.review_notes}
                          </div>
                        )}
                      </td>

                      {/* Credential Document */}
                      <td className="py-3.5 px-4">
                        {doc.has_credential_document ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadDocument(doc.doctor_id, doc.full_name)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-teal-600" />
                            <span>Download PDF</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No document</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDecisionModal(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Review & Verify</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision & Verification Modal */}
      {isDecisionModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Review Clinician Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Perform statutory verification for {selectedDoctor.full_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Doctor Card Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Clinician Email</span>
                  <div className="font-semibold text-slate-800">{selectedDoctor.email}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Persistent Doctor ID</span>
                  <div className="font-mono font-bold text-teal-800">{selectedDoctor.doctor_id}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">License Registration</span>
                  <div className="font-semibold text-slate-800">
                    {selectedDoctor.license_number || (
                      <span className="text-rose-600 font-bold">MISSING</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Licensing Authority</span>
                  <div className="font-semibold text-slate-800">
                    {selectedDoctor.licensing_authority || 'Not Specified'}
                  </div>
                </div>
              </div>

              {selectedDoctor.has_credential_document && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 font-medium">Uploaded Medical Certificate</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(selectedDoctor.doctor_id, selectedDoctor.full_name)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-teal-700 hover:bg-teal-50"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              )}
            </div>

            {/* Decision History Audit Log */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Regulatory Audit & Decision History</span>
              </div>
              {isLoadingHistory ? (
                <div className="text-[11px] text-slate-400 py-3 text-center">Loading audit log...</div>
              ) : decisionHistory.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                  No prior administrative verification decisions recorded for this account.
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {decisionHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[10px]">{item.details}</div>
                      <div className="text-[10px] text-teal-700">By: {item.actor}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmitDecision} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Administrative Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                      decisionAction === 'approve'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionAction"
                      value="approve"
                      checked={decisionAction === 'approve'}
                      onChange={() => setDecisionAction('approve')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Approve Clinician</div>
                      <div className="text-[10px] text-emerald-700">Add to Consult directory</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                      decisionAction === 'reject'
                        ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionAction"
                      value="reject"
                      checked={decisionAction === 'reject'}
                      onChange={() => setDecisionAction('reject')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-rose-900">Reject / Request Fixes</div>
                      <div className="text-[10px] text-rose-700">Exclude from Consult</div>
                    </div>
                  </label>
                </div>
              </div>

              {decisionAction === 'approve' &&
                (!selectedDoctor.license_number || selectedDoctor.license_number === '-') && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Approval requires a statutory medical council registration number. Doctor must
                      submit credentials before verification can be granted.
                    </span>
                  </div>
                )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Regulatory Decision Reason / Review Notes{' '}
                  {decisionAction === 'reject' && <span className="text-rose-600">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder={
                    decisionAction === 'approve'
                      ? 'e.g. Verified with Karnataka Medical Council register. All credentials verified.'
                      : 'e.g. Registration number invalid or document unreadable. Please upload original council certificate.'
                  }
                  required={decisionAction === 'reject'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white resize-none text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  disabled={isSubmittingDecision}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingDecision ||
                    (decisionAction === 'approve' &&
                      (!selectedDoctor.license_number || selectedDoctor.license_number === '-'))
                  }
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                    decisionAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
                      : 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                  }`}
                >
                  {isSubmittingDecision ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : decisionAction === 'approve' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSubmittingDecision
                      ? 'Recording Decision...'
                      : decisionAction === 'approve'
                      ? 'Approve & Verify Clinician'
                      : 'Record Rejection'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorVerification
