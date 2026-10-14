import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  HeartPulse,
  BarChart2,
  ShieldCheck,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Droplet,
  FileText,
  Calendar,
  MessageSquare,
  CheckSquare,
  Square,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_PATIENTS } from '../data/referencePreviewData'
import type { Patient } from '../types'
import { api } from '../services/api'

export const Patients: React.FC = () => {
  const navigate = useNavigate()
  const { isPreviewMode, openModal, addToast, setSelectedReportId } = useApp()

  // Filter states
  const [searchVal, setSearchVal] = useState('')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sortBy, setSortBy] = useState('Recent')
  const [activeTab, setActiveTab] = useState<'Overview' | 'Assessments' | 'Reports' | 'Appointments'>('Overview')

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [realPatients, setRealPatients] = useState<Patient[]>([])
  const [activePatient, setActivePatient] = useState<Patient | null>(
    isPreviewMode ? PREVIEW_PATIENTS[0] : null
  )

  // React to preview mode change & fetch live patient data
  React.useEffect(() => {
    if (isPreviewMode) {
      setActivePatient(PREVIEW_PATIENTS[0])
      setRealPatients([])
    } else {
      setSelectedIds([])
      api.getDoctorReports()
        .then((reports) => {
          if (reports.length > 0) {
            const patientMap = new Map<number, Patient>()
            for (const c of reports) {
              if (!patientMap.has(c.patient_id)) {
                patientMap.set(c.patient_id, {
                  id: `PAT-${c.patient_id}`,
                  name: c.patient_name,
                  age: c.age,
                  gender: c.sex?.toLowerCase() === 'female' ? 'Female' : 'Male',
                  lastAssessment: c.created_at,
                  lastAssessmentRelative: 'Recent',
                  riskLevel: (c.risk_level as any) || 'Low',
                  riskScore: c.risk_percentage,
                  status: 'Active',
                  metrics: {
                    bp: `${c.trestbps || 120}/80 mmHg`,
                    cholesterol: c.chol || 180,
                    glucose: c.fbs ? 130 : 95,
                    heartRate: c.thalch || 75,
                  },
                  medicalInfo: {
                    knownConditions: c.risk_percentage >= 20 ? 'Cardiovascular risk elevated' : 'No major chronic conditions',
                    currentMedications: 'Standard clinical management',
                    allergies: 'None recorded',
                    familyHistory: 'Non-contributory',
                  }
                })
              }
            }
            const pts = Array.from(patientMap.values())
            setRealPatients(pts)
            setActivePatient(pts[0] || null)
          } else {
            setRealPatients([])
            setActivePatient(null)
          }
        })
        .catch(() => {
          setRealPatients([])
          setActivePatient(null)
        })
    }
  }, [isPreviewMode])

  // Filter list
  const baseList = isPreviewMode ? PREVIEW_PATIENTS : realPatients
  const patientsList = baseList.filter((p) => {
    if (riskFilter !== 'All Risk Levels' && p.riskLevel !== riskFilter) return false
    if (statusFilter !== 'All Status' && p.status !== statusFilter) return false
    if (searchVal && !p.name.toLowerCase().includes(searchVal.toLowerCase()) && !p.id.toLowerCase().includes(searchVal.toLowerCase())) {
      return false
    }
    return true
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === patientsList.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(patientsList.map((p) => p.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* 8.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your patients, view their assessments and track their heart health progress.
          </p>
        </div>

        <button
          onClick={() => openModal('add-patient')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* 8.1 Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={String(isPreviewMode ? 248 : realPatients.length)}
          trend="↗ +12%"
          trendPositive={true}
          subtext={isPreviewMode ? "+26 new this month" : `${realPatients.length} active records`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
        <StatCard
          title="High Risk"
          value={String(
            isPreviewMode
              ? 56
              : realPatients.filter((p) => p.riskLevel === 'High' || (p.riskScore && p.riskScore >= 20)).length
          )}
          trend="↗ +5%"
          trendPositive={false}
          subtext="Require follow-up"
          icon={<HeartPulse className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Moderate Risk"
          value={String(
            isPreviewMode
              ? 69
              : realPatients.filter(
                  (p) => p.riskLevel === 'Moderate' || (p.riskScore && p.riskScore >= 10 && p.riskScore < 20)
                ).length
          )}
          trend="↗ +8%"
          trendPositive={true}
          subtext="Under monitoring"
          icon={<BarChart2 className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          isUnavailable={false}
        />
        <StatCard
          title="Low Risk"
          value={String(
            isPreviewMode
              ? 123
              : realPatients.filter((p) => p.riskLevel === 'Low' || (p.riskScore && p.riskScore < 10)).length
          )}
          trend="↗ +15%"
          trendPositive={true}
          subtext="Stable condition"
          icon={<ShieldCheck className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          isUnavailable={false}
        />
      </div>

      {/* Main Content: Left Patients Table + Right Patient Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Table & Filters (approx 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search patients..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>Sort by: Recent</option>
                <option>Sort by: Name</option>
                <option>Sort by: Risk</option>
              </select>

              <button
                onClick={() => addToast('Advanced patient query filters loaded.', 'info')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {(isPreviewMode || patientsList.length > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-slate-600 block"
                      >
                        {selectedIds.length === patientsList.length && patientsList.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">Gender</th>
                    <th className="py-3 px-3">Last Assessment</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {patientsList.map((pt) => {
                    const isSelected = selectedIds.includes(pt.id)
                    const isActiveRow = activePatient?.id === pt.id
                    return (
                      <tr
                        key={pt.id}
                        onClick={() => setActivePatient(pt)}
                        className={`transition-colors cursor-pointer ${
                          isActiveRow ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSelectOne(pt.id)}
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
                              {pt.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{pt.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{pt.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{pt.age}</td>
                        <td className="py-3.5 px-3 text-slate-600">{pt.gender}</td>
                        <td className="py-3.5 px-3">
                          <p className="font-medium text-slate-800">{pt.lastAssessment}</p>
                          {pt.lastAssessmentRelative && (
                            <p className="text-[10px] text-slate-400">{pt.lastAssessmentRelative}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <RiskBadge level={pt.riskLevel} size="sm" />
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                pt.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                            <span
                              className={
                                pt.status === 'Active' ? 'text-slate-700' : 'text-slate-400'
                              }
                            >
                              {pt.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActivePatient(pt)}
                              className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
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
                <span>
                  Showing 1-{Math.min(10, patientsList.length)} of {patientsList.length} patients
                </span>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center">
                    1
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    2
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    3
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    4
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    5
                  </button>
                  <span className="px-1 text-slate-400">...</span>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    25
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Users className="w-6 h-6 text-slate-400" />}
                title="No patient records available"
                description="Zero clinical records exist in the operational database. Use the button below to register a patient or switch on Design Preview for visual verification."
                actionLabel="+ Add New Patient"
                onAction={() => openModal('add-patient')}
              />
            </div>
          )}
        </div>

        {/* Right Column: 8.3 Patient Details Panel (approx 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-5">
          {activePatient ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activePatient.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      ID: {activePatient.id} | {activePatient.age} years, {activePatient.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <RiskBadge level={activePatient.riskLevel} size="sm" />
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-4">
                {(['Overview', 'Assessments', 'Reports', 'Appointments'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'border-teal-700 text-teal-700'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Risk Score */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                    Risk Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {activePatient.riskScore || 78}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <RiskBadge level={activePatient.riskLevel} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Based on latest assessment ({activePatient.lastAssessment})
                  </span>
                </div>

                {/* Mini SVG Sparkline */}
                <div className="w-20 h-10">
                  <svg viewBox="0 0 80 40" className="w-full h-full">
                    <path
                      d="M2 30 Q 20 20, 35 25 T 60 12 T 78 18"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Key Health Metrics (4 metric cards) */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Key Health Metrics</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">BP</span>
                      <span className="text-xs font-bold text-slate-800">
                        {activePatient.metrics?.bp || '142/90'}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">mmHg</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center gap-2.5">
                    <Droplet className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Cholesterol
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {activePatient.metrics?.cholesterol || 240}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">mg/dL</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Glucose</span>
                      <span className="text-xs font-bold text-slate-800">
                        {activePatient.metrics?.glucose || 110}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">mg/dL</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5">
                    <HeartPulse className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Heart Rate
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {activePatient.metrics?.heartRate || 82}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">bpm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Medical Information</h4>
                  <button className="text-[11px] font-semibold text-teal-700 hover:underline">
                    View All →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Known Conditions
                    </span>
                    <span className="font-semibold text-slate-800">
                      {activePatient.medicalInfo?.knownConditions || 'Hypertension, High Cholesterol'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Current Medications
                    </span>
                    <span className="font-semibold text-slate-800">
                      {activePatient.medicalInfo?.currentMedications ||
                        'Amlodipine 5mg, Atorvastatin 10mg'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                        Allergies
                      </span>
                      <span className="font-semibold text-slate-800">
                        {activePatient.medicalInfo?.allergies || 'None'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                        Family History
                      </span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {activePatient.medicalInfo?.familyHistory || 'Heart Disease (Father)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedReportId(activePatient.id)
                    navigate('/reports')
                  }}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full Report</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToast('Appointment scheduling connector required.', 'info')}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>

                  <button
                    onClick={() => navigate('/messages')}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Users className="w-6 h-6 text-slate-400" />}
              title="No Patient Selected"
              description="Select a patient from the table to view real-time cardiovascular telemetry and medical records."
            />
          )}
        </div>
      </div>
    </div>
  )
}
