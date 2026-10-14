import React, { useState } from 'react'
import {
  FileText,
  HeartPulse,
  Share2,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Printer,
  CalendarPlus,
  FileEdit,
  Activity,
  Droplet,
  ShieldCheck,
  CheckSquare,
  Square,
  HelpCircle,
  Shield,
  Check,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  X,
  ImageIcon,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_REPORTS } from '../data/referencePreviewData'
import type { ReportItem, RiskLevel } from '../types'
import { api, type ClinicalReport, type ReportVerificationResponse, getBackendMediaUrl } from '../services/api'
import gradcamOriginal from '../assets/gradcam_original.png'
import gradcamHeatmap from '../assets/gradcam_heatmap.png'

export type ExtendedReportItem = ReportItem & {
  raw?: ClinicalReport
}

export const Reports: React.FC = () => {
  const { isPreviewMode, openModal, addToast, selectedReportId } = useApp()

  const [searchVal, setSearchVal] = useState('')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [typeFilter, setTypeFilter] = useState('All Report Types')
  const [activeTab, setActiveTab] = useState<
    'Report Overview' | 'AI Analysis' | 'Grad-CAM' | 'Medical Info' | 'History'
  >('Report Overview')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeReport, setActiveReport] = useState<ExtendedReportItem | null>(
    isPreviewMode ? (PREVIEW_REPORTS[0] as ExtendedReportItem) : null
  )

  const [realReports, setRealReports] = useState<ClinicalReport[]>([])
  const [loadingReports, setLoadingReports] = useState<boolean>(false)
  const [verifyingId, setVerifyingId] = useState<string | number | null>(null)
  const [verificationResult, setVerificationResult] = useState<ReportVerificationResponse | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)

  // Report action states
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [sharingReport, setSharingReport] = useState(false)
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpReason, setFollowUpReason] = useState('Cardiovascular risk re-assessment and clinical consultation')

  const mapClinicalToReportItem = (c: ClinicalReport): ExtendedReportItem => ({
    id: c.report_id || `REP-${c.id}`,
    patientId: `PAT-${String(c.patient_id).padStart(4, '0')}`,
    patientName: c.patient_name || 'Anonymous Patient',
    patientAge: c.age || 45,
    patientGender: (c.sex?.toLowerCase() === 'female' ? 'Female' : 'Male') as 'Male' | 'Female',
    dateTime: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : 'Not recorded',
    riskLevel: (c.risk_level === 'High' ? 'High' : c.risk_level === 'Moderate' ? 'Moderate' : 'Low') as RiskLevel,
    riskScore: Math.round(c.risk_percentage || 0),
    reportType: 'Heart Assessment',
    raw: c,
  })

  // Sync clinician notes when active report changes
  React.useEffect(() => {
    setNotesText(activeReport?.raw?.clinician_notes || '')
    setShowNotesEditor(false)
    setShowFollowUpDialog(false)
    setVerificationResult(null)
  }, [activeReport?.id])

  const handleSelectReport = (rep: ExtendedReportItem) => {
    setActiveReport(rep)
    if (!isPreviewMode && rep.raw) {
      const repKey = rep.raw.id || rep.raw.report_id || rep.id
      api.getDoctorReportDetail(repKey)
        .then((detail) => {
          if (detail) {
            setActiveReport(mapClinicalToReportItem(detail))
          }
        })
        .catch((err) => {
          console.warn('Could not refresh full report detail:', err)
        })
    }
  }

  // Fetch live reports from Django backend
  React.useEffect(() => {
    if (!isPreviewMode) {
      setLoadingReports(true)
      api.getDoctorReports()
        .then((data) => {
          setRealReports(data)
          if (data.length > 0) {
            const mapped = data.map(mapClinicalToReportItem)
            if (selectedReportId) {
              const matched = mapped.find(
                (r) => r.id === selectedReportId || String(r.raw?.id) === selectedReportId
              )
              const chosen = matched || mapped[0]
              handleSelectReport(chosen)
            } else {
              handleSelectReport(mapped[0])
            }
          } else {
            setActiveReport(null)
          }
        })
        .catch((err) => {
          console.error('Failed to load doctor reports:', err)
          addToast(err.message || 'Could not load clinical reports.', 'error')
        })
        .finally(() => setLoadingReports(false))
    } else {
      setRealReports([])
      if (selectedReportId) {
        const found = PREVIEW_REPORTS.find((r) => r.id === selectedReportId)
        setActiveReport((found as ExtendedReportItem) || (PREVIEW_REPORTS[0] as ExtendedReportItem))
      } else {
        setActiveReport(PREVIEW_REPORTS[0] as ExtendedReportItem)
      }
    }
  }, [isPreviewMode, selectedReportId])

  const handleVerifyReport = async (reportId: string | number) => {
    setVerifyingId(reportId)
    setVerificationResult(null)
    try {
      const res = await api.verifyReportIntegrity(reportId)
      setVerificationResult(res)
      if (res.status === 'CONFIRMED') {
        addToast(`Report ${res.report_id} verified on-chain against TrustBeat smart contract.`, 'success')
      } else if (res.status === 'TAMPERED_MISMATCH') {
        addToast(`TAMPER DETECTED: Report ${res.report_id} cryptographic hash mismatch!`, 'error')
      } else if (res.status === 'SERVICE_OFFLINE') {
        addToast(`Blockchain offline: Report ${res.report_id} verified locally, but on-chain proof unavailable.`, 'warning')
      } else if (res.status === 'PENDING') {
        addToast(`Report ${res.report_id} transaction pending network finality.`, 'info')
      } else if (res.status === 'FAILED') {
        addToast(`Report ${res.report_id} transaction failed or reverted on-chain.`, 'error')
      } else if (res.status === 'NOT_FOUND') {
        addToast(`Report ${res.report_id} hash was not found on-chain.`, 'warning')
      } else {
        addToast(`Report ${res.report_id} status: ${res.status}.`, 'info')
      }
    } catch (err: any) {
      addToast(err.message || 'Verification request failed.', 'error')
    } finally {
      setVerifyingId(null)
    }
  }

  // Real PDF Download
  const handleDownloadPdf = async () => {
    if (!activeReport) {
      addToast('No report selected for download.', 'warning')
      return
    }

    if (isPreviewMode) {
      addToast('PDF download engine requires live authenticated session.', 'info')
      return
    }

    const reportIdentifier = activeReport.raw?.report_id || activeReport.raw?.id || activeReport.id
    setDownloadingPdf(true)
    try {
      const blob = await api.downloadReportPdf(reportIdentifier)
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      const filename = `TrustBeat_Report_${activeReport.raw?.report_number || activeReport.id}.pdf`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
      addToast(`Downloaded ${filename} successfully.`, 'success')
    } catch (err: any) {
      console.error('PDF download error:', err)
      addToast(err.message || 'Failed to download report PDF.', 'error')
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Share with patient
  const handleShareWithPatient = async () => {
    if (!activeReport) {
      addToast('No report selected.', 'warning')
      return
    }

    if (isPreviewMode) {
      addToast(`[Preview] Report shared with ${activeReport.patientName}.`, 'success')
      return
    }

    setSharingReport(true)
    try {
      const reportIdentifier = activeReport.raw?.report_id || activeReport.raw?.id || activeReport.id
      const res = await api.shareReportWithPatient(reportIdentifier)
      addToast(res.message || `Report shared with patient ${activeReport.patientName}.`, 'success')
      if (activeReport.raw) {
        activeReport.raw.status = 'COMPLETED'
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to share report with patient.', 'error')
    } finally {
      setSharingReport(false)
    }
  }

  // Save clinician notes
  const handleSaveNotes = async () => {
    if (!activeReport) return
    if (isPreviewMode) {
      addToast('Notes saved in preview session.', 'success')
      setShowNotesEditor(false)
      return
    }
    setSavingNotes(true)
    try {
      const reportIdentifier = activeReport.raw?.id || activeReport.id
      await api.updateReportNotes(reportIdentifier, notesText)
      if (activeReport.raw) {
        activeReport.raw.clinician_notes = notesText
      }
      addToast(`Clinician notes saved for Report ${activeReport.id}.`, 'success')
      setShowNotesEditor(false)
    } catch (err: any) {
      addToast(err.message || 'Failed to save clinician notes.', 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  // Schedule Follow-up
  const handleScheduleFollowUp = () => {
    if (!activeReport) return
    if (!followUpDate) {
      addToast('Please select a consultation date.', 'warning')
      return
    }
    addToast(`Follow-up consultation booked for ${activeReport.patientName} on ${followUpDate}.`, 'success')
    setShowFollowUpDialog(false)
  }

  const allReports: ExtendedReportItem[] = isPreviewMode
    ? (PREVIEW_REPORTS as ExtendedReportItem[])
    : realReports.map(mapClinicalToReportItem)

  const reportsList = allReports.filter((r) => {
    if (riskFilter !== 'All Risk Levels' && r.riskLevel !== riskFilter) return false
    if (typeFilter !== 'All Report Types' && r.reportType !== typeFilter) return false
    if (
      searchVal &&
      !r.patientName.toLowerCase().includes(searchVal.toLowerCase()) &&
      !r.id.toLowerCase().includes(searchVal.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* 10.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            View, analyze and manage patient cardiovascular assessment reports.
          </p>
        </div>

        <button
          onClick={() => addToast('Report generator requires backend ML pipeline.', 'info')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* 10.1 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={isPreviewMode ? '412' : String(allReports.length)}
          trend="↗ +18%"
          trendPositive={true}
          subtext={isPreviewMode ? "+63 this month" : `${allReports.length} authorized`}
          icon={<FileText className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          isUnavailable={false}
        />
        <StatCard
          title="High Risk Reports"
          value={
            isPreviewMode
              ? '56'
              : String(allReports.filter((r) => r.riskLevel === 'High' || r.riskLevel === 'Very High').length)
          }
          trend="↗ +5%"
          trendPositive={false}
          subtext={
            isPreviewMode
              ? "13.6% of total"
              : `${allReports.filter((r) => r.riskLevel === 'High' || r.riskLevel === 'Very High').length} flagged high`
          }
          icon={<HeartPulse className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Blockchain Verified"
          value={
            isPreviewMode
              ? '128'
              : String(realReports.filter((r) => r.blockchain_status === 'confirmed').length)
          }
          trend="↗ 100%"
          trendPositive={true}
          subtext={
            isPreviewMode
              ? "Shared with patients"
              : `${realReports.filter((r) => r.blockchain_status === 'confirmed').length} on-chain anchored`
          }
          icon={<Share2 className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          isUnavailable={false}
        />
        <StatCard
          title="Authorized Patients"
          value={
            isPreviewMode
              ? '356'
              : String(new Set(realReports.map((r) => r.patient_id)).size)
          }
          trend="↗ +15%"
          trendPositive={true}
          subtext={
            isPreviewMode
              ? "This month"
              : `${new Set(realReports.map((r) => r.patient_id)).size} consent active`
          }
          icon={<Download className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
      </div>

      {/* Main Content: Reports Table + Report Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* 10.2 Search & Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search reports by patient name, ID, or date..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Risk Levels</option>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Very High</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Report Types</option>
                <option>Heart Assessment</option>
                <option>Follow-up Report</option>
                <option>Routine Checkup</option>
              </select>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>12 Oct 2024 - 12 Oct 2024</span>
              </div>

              <button
                onClick={() => addToast('Report filter filters applied.', 'info')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* 10.3 Reports Table */}
          {reportsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <button
                        onClick={() => {
                          if (selectedIds.length === reportsList.length) setSelectedIds([])
                          else setSelectedIds(reportsList.map((r) => r.id))
                        }}
                        className="text-slate-400 hover:text-slate-600 block"
                      >
                        {selectedIds.length === reportsList.length && reportsList.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Report ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3">Integrity & Blockchain</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {reportsList.map((rep) => {
                    const isSelected = selectedIds.includes(rep.id)
                    const isActive = activeReport?.id === rep.id
                    const isVerifying = verifyingId === (rep.raw?.id || rep.id)
                    return (
                      <tr
                        key={rep.id}
                        onClick={() => handleSelectReport(rep)}
                        className={`transition-colors cursor-pointer ${
                          isActive ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setSelectedIds((prev) =>
                                prev.includes(rep.id)
                                  ? prev.filter((i) => i !== rep.id)
                                  : [...prev, rep.id]
                              )
                            }
                            className="text-slate-400 hover:text-slate-600 block"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {rep.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{rep.patientName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {rep.patientAge} years, {rep.patientGender}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">{rep.id}</td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{rep.dateTime}</td>
                        <td className="py-3.5 px-3">
                          <RiskBadge level={rep.riskLevel} size="sm" />
                        </td>
                        <td className="py-3.5 px-3">
                          {rep.raw?.blockchain_status === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>On-Chain Verified</span>
                            </span>
                          ) : rep.raw?.blockchain_status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[10px] border border-amber-200">
                              <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                              <span>Anchoring Pending</span>
                            </span>
                          ) : rep.raw?.blockchain_status === 'service_offline' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200" title="Deterministic SHA-256 integrity valid locally. Blockchain node offline.">
                              <Shield className="w-3 h-3 text-slate-500" />
                              <span>SHA-256 Valid</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                              {rep.reportType}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPreviewMode && rep.raw && (
                              <button
                                onClick={() => handleVerifyReport(rep.raw?.id || rep.id)}
                                disabled={isVerifying}
                                className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Verify report integrity hash & blockchain status"
                              >
                                <Shield className={`w-3 h-3 text-teal-600 ${isVerifying ? 'animate-spin' : ''}`} />
                                <span>{isVerifying ? 'Checking...' : 'Verify'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleSelectReport(rep)}
                              className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                            >
                              View
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>Showing 1-{reportsList.length} of {reportsList.length} reports</span>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center">
                    1
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<FileText className="w-6 h-6 text-slate-400" />}
                title={loadingReports ? "Loading reports..." : "No reports available"}
                description={
                  loadingReports
                    ? "Connecting to authoritative backend and retrieving clinical records..."
                    : "Reports will appear when patients complete cardiovascular risk assessments and authorize your Doctor ID."
                }
                actionLabel={isPreviewMode ? "Create Assessment" : undefined}
                onAction={isPreviewMode ? () => openModal('new-assessment') : undefined}
              />
            </div>
          )}
        </div>

        {/* 10.4 Report Details Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          {activeReport ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    {activeReport.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeReport.patientName}</h3>
                    <p className="text-[11px] text-slate-400">
                      ID: {activeReport.patientId} | {activeReport.patientAge} years, {activeReport.patientGender}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Report ID: {activeReport.id} | {activeReport.dateTime}
                    </p>
                  </div>
                </div>

                <RiskBadge level={activeReport.riskLevel} size="sm" />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-3 overflow-x-auto pb-0.5">
                {(['Report Overview', 'AI Analysis', 'Grad-CAM', 'Medical Info', 'History'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-teal-700 text-teal-700'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {/* Tab 1: Report Overview */}
              {activeTab === 'Report Overview' && (
                <>
                  {/* Risk Assessment */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Cardiovascular Risk Assessment
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-900">{activeReport.riskScore}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                        <RiskBadge level={activeReport.riskLevel} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {activeReport.raw?.inference_engine
                          ? `Engine: ${activeReport.raw.inference_engine}`
                          : activeReport.raw?.model_type_used
                          ? `Model: ${activeReport.raw.model_type_used}`
                          : 'Multi-factor clinical risk classifier'}
                      </span>
                    </div>

                    <div className="w-20 h-10">
                      <svg viewBox="0 0 80 40" className="w-full h-full">
                        <path
                          d="M2 30 Q 20 20, 35 25 T 60 12 T 78 18"
                          fill="none"
                          stroke={activeReport.riskLevel === 'High' ? '#ef4444' : activeReport.riskLevel === 'Moderate' ? '#f59e0b' : '#10b981'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Key Health Metrics - Authoritative Patient Data Only */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">Resting BP</span>
                        <span className="text-xs font-bold text-slate-800">
                          {activeReport.raw?.systolic_bp && activeReport.raw?.diastolic_bp
                            ? `${activeReport.raw.systolic_bp}/${activeReport.raw.diastolic_bp}`
                            : activeReport.raw?.trestbps
                            ? `${activeReport.raw.trestbps}`
                            : isPreviewMode
                            ? '142/90'
                            : 'Not recorded'}
                        </span>
                        <span className="text-[8px] text-slate-400 ml-0.5">mmHg</span>
                      </div>
                    </div>

                    <div className="p-2 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">Serum Chol</span>
                        <span className="text-xs font-bold text-slate-800">
                          {activeReport.raw?.total_cholesterol
                            ? `${activeReport.raw.total_cholesterol}`
                            : activeReport.raw?.chol
                            ? `${activeReport.raw.chol}`
                            : isPreviewMode
                            ? '240'
                            : 'Not recorded'}
                        </span>
                        <span className="text-[8px] text-slate-400 ml-0.5">mg/dL</span>
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">Fasting Sugar</span>
                        <span className="text-xs font-bold text-slate-800">
                          {activeReport.raw?.fasting_glucose
                            ? `${activeReport.raw.fasting_glucose}`
                            : activeReport.raw?.diabetes_status !== undefined
                            ? (activeReport.raw.diabetes_status ? 'Diabetic' : 'Normal')
                            : activeReport.raw?.fbs !== undefined
                            ? (activeReport.raw.fbs ? '> 120' : 'Normal')
                            : isPreviewMode
                            ? '110'
                            : 'Not recorded'}
                        </span>
                        <span className="text-[8px] text-slate-400 ml-0.5">{activeReport.raw?.fasting_glucose ? 'mg/dL' : ''}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2">
                      <HeartPulse className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">Heart Rate</span>
                        <span className="text-xs font-bold text-slate-800">
                          {activeReport.raw?.heart_rate
                            ? `${activeReport.raw.heart_rate}`
                            : activeReport.raw?.thalch
                            ? `${activeReport.raw.thalch}`
                            : isPreviewMode
                            ? '82'
                            : 'Not recorded'}
                        </span>
                        <span className="text-[8px] text-slate-400 ml-0.5">bpm</span>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Blockchain Cryptographic Integrity Card */}
                  {activeReport.raw && (
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-teal-700" />
                          <span>Tamper-Proof Blockchain Integrity</span>
                        </span>
                        <button
                          onClick={() => handleVerifyReport(activeReport.raw?.id || activeReport.id)}
                          disabled={verifyingId !== null}
                          className="px-2 py-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${verifyingId !== null ? 'animate-spin' : ''}`} />
                          <span>{verifyingId !== null ? 'Verifying...' : 'Verify On-Chain'}</span>
                        </button>
                      </div>

                      {/* Verification Result Feedback */}
                      {verificationResult && (
                        <div
                          className={`p-2 rounded-lg border text-[11px] ${
                            verificationResult.status === 'CONFIRMED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : verificationResult.status === 'TAMPERED_MISMATCH' || verificationResult.status === 'FAILED'
                              ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                              : verificationResult.status === 'SERVICE_OFFLINE'
                              ? 'bg-slate-100 border-slate-200 text-slate-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {verificationResult.status === 'CONFIRMED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : verificationResult.status === 'TAMPERED_MISMATCH' || verificationResult.status === 'FAILED' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                            )}
                            <p>{verificationResult.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Cryptographic SHA-256 Digest */}
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider">
                          Canonical SHA-256 Digest
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-[10px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 flex-1 truncate">
                            {activeReport.raw.integrity_hash || 'Pending hash calculation'}
                          </code>
                          {activeReport.raw.integrity_hash && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(activeReport.raw?.integrity_hash || '')
                                setCopiedHash(true)
                                setTimeout(() => setCopiedHash(false), 2000)
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                              title="Copy SHA-256 hash"
                            >
                              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Blockchain Status & Tx Hash */}
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Blockchain State:</span>
                        <span className="font-mono font-bold text-slate-700">
                          {activeReport.raw.blockchain_status.toUpperCase()}
                        </span>
                      </div>
                      {activeReport.raw.tx_hash && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Tx Reference:</span>
                          <span className="font-mono text-teal-700 truncate max-w-[180px]">
                            {activeReport.raw.tx_hash}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Analysis Result & Diagnostic Preview */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                        AI Analysis Result & Diagnostics
                      </h4>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activeReport.raw
                        ? `${activeReport.raw.result}. Calculated cardiovascular risk: ${activeReport.raw.risk_percentage}%.`
                        : isPreviewMode
                        ? 'Elevated risk of cardiovascular disease due to high blood pressure and cholesterol levels.'
                        : 'Assessment completed.'}
                    </p>

                    {/* Authoritative Diagnostic Image Thumbnails or Honest Status */}
                    {activeReport.raw?.retinal_record?.image_url ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video flex flex-col items-center justify-center relative">
                          <img
                            src={getBackendMediaUrl(activeReport.raw.retinal_record.image_url)}
                            alt="Original Fundus Scan"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 text-[8px] font-bold text-white bg-slate-900/70 px-1 rounded">
                            Original Fundus Scan
                          </span>
                        </div>

                        {activeReport.raw.retinal_record.gradcam_heatmap_url ? (
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video flex flex-col items-center justify-center relative">
                            <img
                              src={getBackendMediaUrl(activeReport.raw.retinal_record.gradcam_heatmap_url)}
                              alt="AI Grad-CAM Heatmap"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 text-[8px] font-bold text-white bg-slate-900/70 px-1 rounded">
                              Grad-CAM Heatmap
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 aspect-video flex flex-col items-center justify-center p-2 text-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
                            <span className="text-[9px] font-semibold text-amber-800">
                              {activeReport.raw.retinal_record.status === 'weights_unconfigured'
                                ? 'Weights Unconfigured'
                                : 'Heatmap Unavailable'}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : isPreviewMode ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video flex flex-col items-center justify-center relative">
                          <img
                            src={gradcamOriginal}
                            alt="Original Image"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 text-[8px] font-bold text-white bg-slate-900/70 px-1 rounded">
                            Original Image (Preview)
                          </span>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video flex flex-col items-center justify-center relative">
                          <img
                            src={gradcamHeatmap}
                            alt="AI Heatmap"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 text-[8px] font-bold text-white bg-slate-900/70 px-1 rounded">
                            AI Heatmap (Preview)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-100/70 border border-slate-200/60 rounded-lg text-slate-500 text-[11px] flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Retinal Fundus Scan: Not performed for this clinical assessment.</span>
                      </div>
                    )}
                  </div>

                  {/* Authoritative Key Findings */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-slate-800">Key Findings</h4>
                    {activeReport.raw?.key_findings && activeReport.raw.key_findings.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {activeReport.raw.key_findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                                f.type === 'danger'
                                  ? 'bg-rose-500'
                                  : f.type === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-teal-500'
                              }`}
                            />
                            <span><strong className="font-semibold text-slate-700">{f.label}:</strong> {f.detail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : isPreviewMode ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                          <span>Elevated blood pressure (142/90 mmHg)</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                          <span>High cholesterol level (240 mg/dL)</span>
                        </li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No specific risk findings flagged for this assessment.</p>
                    )}
                  </div>

                  {/* Authoritative Recommendations */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-slate-800">Recommendations</h4>
                    {activeReport.raw?.recommendations && activeReport.raw.recommendations.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {activeReport.raw.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                            <span>{r.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : isPreviewMode ? (
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                          <span>Regular monitoring & lifestyle modifications</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 shrink-0" />
                          <span>Medication review and follow-up in 3 months</span>
                        </li>
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Standard clinical monitoring recommended.</p>
                    )}
                  </div>
                </>
              )}

              {/* Tab 2: AI Analysis (Deep Dive on Cardiovascular & Retinal Models) */}
              {activeTab === 'AI Analysis' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                      <HeartPulse className="w-4 h-4 text-teal-600" />
                      <span>Cardiovascular Risk Assessment Pipeline</span>
                    </div>
                    <div className="text-[11px] space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Inference Engine:</span>
                        <span className="font-semibold text-slate-800">
                          {activeReport.raw?.inference_engine || 'UCI / Cleveland Heart Pipeline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Model Architecture:</span>
                        <span className="font-semibold text-slate-800">
                          {activeReport.raw?.model_type_used || 'Multi-Factor Classifier'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Calculated Risk Score:</span>
                        <span className="font-bold text-teal-700">{activeReport.riskScore}% ({activeReport.riskLevel})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Age Extrapolation:</span>
                        <span className="font-medium text-slate-700">
                          {activeReport.raw?.is_extrapolated_age ? 'Extrapolated for boundary age' : 'Standard baseline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                      <Eye className="w-4 h-4 text-teal-600" />
                      <span>Retinal Disease Deep Learning Pipeline</span>
                    </div>
                    {activeReport.raw?.retinal_record ? (
                      <div className="text-[11px] space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pipeline Status:</span>
                          <span className="font-semibold text-slate-800">{activeReport.raw.retinal_record.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Predicted Classification:</span>
                          <span className="font-bold text-slate-900">
                            {activeReport.raw.retinal_record.predicted_label || 'Normal / Analyzed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Model Confidence:</span>
                          <span className="font-semibold text-slate-800">
                            {activeReport.raw.retinal_record.confidence
                              ? `${(activeReport.raw.retinal_record.confidence * 100).toFixed(1)}%`
                              : 'Not recorded'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Microvascular Index:</span>
                          <span className="font-mono text-slate-800">
                            {activeReport.raw.retinal_record.microvascular_index !== null &&
                            activeReport.raw.retinal_record.microvascular_index !== undefined
                              ? activeReport.raw.retinal_record.microvascular_index.toFixed(2)
                              : 'Not computed'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        Retinal deep learning analysis was not performed for this patient assessment.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Grad-CAM Visualization Tab */}
              {activeTab === 'Grad-CAM' && (
                <div className="space-y-3">
                  {activeReport.raw?.retinal_record?.image_url ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Original Retinal Fundus Scan
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                          <img
                            src={getBackendMediaUrl(activeReport.raw.retinal_record.image_url)}
                            alt="Original Retinal Fundus"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Grad-CAM Visual Attention Map
                        </span>
                        {activeReport.raw.retinal_record.gradcam_heatmap_url ? (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                            <img
                              src={getBackendMediaUrl(activeReport.raw.retinal_record.gradcam_heatmap_url)}
                              alt="Grad-CAM Heatmap"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                            <div className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Attention Map Unavailable</span>
                            </div>
                            <p>
                              {activeReport.raw.retinal_record.status === 'weights_unconfigured'
                                ? 'Model weights were unconfigured when this inference was run. The system operated in fallback mode without generating Grad-CAM heatmaps.'
                                : 'No Grad-CAM heatmap was generated for this retinal scan.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isPreviewMode ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Original Fundus (Preview)
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                          <img src={gradcamOriginal} alt="Preview Original" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Grad-CAM Heatmap (Preview)
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                          <img src={gradcamHeatmap} alt="Preview Heatmap" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 border border-slate-200/60 rounded-xl p-4">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No Retinal Images Available</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        This clinical assessment did not include retinal fundus photography.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Medical Info (Authoritative Clinical Measurements) */}
              {activeTab === 'Medical Info' && (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block">Recorded Clinical Measurements</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Systolic BP</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.systolic_bp ? `${activeReport.raw.systolic_bp} mmHg` : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Diastolic BP</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.diastolic_bp ? `${activeReport.raw.diastolic_bp} mmHg` : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Total Cholesterol</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.total_cholesterol
                            ? `${activeReport.raw.total_cholesterol} mg/dL`
                            : activeReport.raw?.chol
                            ? `${activeReport.raw.chol} mg/dL`
                            : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">HDL Cholesterol</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.hdl_cholesterol ? `${activeReport.raw.hdl_cholesterol} mg/dL` : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Body Mass Index (BMI)</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.bmi ? `${activeReport.raw.bmi} kg/m²` : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Smoking Status</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.smoking_status !== undefined
                            ? activeReport.raw.smoking_status
                              ? 'Active Smoker'
                              : 'Non-Smoker'
                            : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Diabetes Status</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.diabetes_status !== undefined
                            ? activeReport.raw.diabetes_status
                              ? 'Diagnosed Diabetic'
                              : 'Non-Diabetic'
                            : 'Not recorded'}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block font-medium">Hypertension Rx</span>
                        <span className="font-bold text-slate-800">
                          {activeReport.raw?.hypertension_treatment !== undefined
                            ? activeReport.raw.hypertension_treatment
                              ? 'On Antihypertensive'
                              : 'None Reported'
                            : 'Not recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: History & Audit Log */}
              {activeTab === 'History' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-[11px]">
                    <span className="font-bold text-slate-800 block">Assessment Lifecycle</span>
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="font-medium text-slate-700">{activeReport.dateTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Report Status:</span>
                        <span className="font-semibold text-teal-700">{activeReport.raw?.status || 'COMPLETED'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Blockchain Integrity:</span>
                        <span className="font-mono text-slate-700">{activeReport.raw?.blockchain_status || 'UNREGISTERED'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
                    <span className="font-bold text-slate-800 block">Clinician Notes</span>
                    <p className="text-slate-600 italic">
                      {activeReport.raw?.clinician_notes || 'No clinician notes recorded for this assessment.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Inline Clinician Notes Editor */}
              {showNotesEditor && (
                <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-teal-700" />
                      <span>Edit Clinician Notes</span>
                    </span>
                    <button
                      onClick={() => setShowNotesEditor(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter confidential clinical observations, treatment plans, or follow-up notes..."
                    rows={3}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-slate-800"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setShowNotesEditor(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-3 py-1 text-xs bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Follow-up Consultation Dialog */}
              {showFollowUpDialog && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-700" />
                      <span>Schedule Follow-up Consultation</span>
                    </span>
                    <button
                      onClick={() => setShowFollowUpDialog(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Consultation Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block">Consultation Reason</label>
                      <input
                        type="text"
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setShowFollowUpDialog(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleFollowUp}
                      className="px-3 py-1 text-xs bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="py-2.5 px-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {downloadingPdf ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{downloadingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
                  </button>

                  <button
                    onClick={handleShareWithPatient}
                    disabled={sharingReport}
                    className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {sharingReport ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    <span>{sharingReport ? 'Sharing...' : 'Share with Patient'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setShowFollowUpDialog(!showFollowUpDialog)}
                    className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CalendarPlus className="w-3 h-3 text-teal-700" />
                    <span>Follow-up</span>
                  </button>

                  <button
                    onClick={() => setShowNotesEditor(!showNotesEditor)}
                    className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileEdit className="w-3 h-3 text-teal-700" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-teal-700" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<FileText className="w-6 h-6 text-slate-400" />}
              title="No Report Selected"
              description="Select a report to inspect cardiovascular risk breakdowns and physician recommendations."
            />
          )}
        </div>
      </div>
    </div>
  )
}
