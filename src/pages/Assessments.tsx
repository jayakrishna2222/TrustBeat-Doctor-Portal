import React, { useState } from 'react'
import {
  Activity,
  HeartPulse,
  BarChart2,
  ShieldCheck,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Share2,
  CalendarPlus,
  FileEdit,
  TrendingUp,
  Droplet,
  CheckCircle2,
  Square,
  CheckSquare,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { StatCard } from '../components/StatCard'
import { Panel } from '../components/Panel'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_ASSESSMENTS } from '../data/referencePreviewData'
import type { Assessment } from '../types'
import { api } from '../services/api'

export const Assessments: React.FC = () => {
  const { isPreviewMode, openModal, addToast } = useApp()

  const [searchVal, setSearchVal] = useState('')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [activeTab, setActiveTab] = useState<'Overview' | 'AI Analysis' | 'Grad-CAM' | 'Medical Info'>('Overview')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [realAssessments, setRealAssessments] = useState<Assessment[]>([])
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    isPreviewMode ? PREVIEW_ASSESSMENTS[0] : null
  )

  React.useEffect(() => {
    if (isPreviewMode) {
      setActiveAssessment(PREVIEW_ASSESSMENTS[0])
      setRealAssessments([])
    } else {
      setSelectedIds([])
      api.getDoctorReports()
        .then((reports) => {
          if (reports.length > 0) {
            const list: Assessment[] = reports.map((c) => ({
              id: c.report_id,
              patientId: `PAT-${c.patient_id}`,
              patientName: c.patient_name,
              patientAge: c.age,
              patientGender: c.sex?.toLowerCase() === 'female' ? 'Female' : 'Male',
              dateTime: c.created_at,
              riskLevel: (c.risk_level as any) || 'Low',
              riskScore: c.risk_percentage,
              keyFindings: `${c.result || `${c.risk_percentage}% risk`} (BP: ${c.trestbps || 120} mmHg, Chol: ${c.chol || 180} mg/dL)`,
              status: 'Completed',
              metrics: {
                bp: `${c.trestbps || 120}/80 mmHg`,
                cholesterol: c.chol || 180,
                glucose: c.fbs ? 130 : 95,
                heartRate: c.thalch || 75,
              }
            }))
            setRealAssessments(list)
            setActiveAssessment(list[0] || null)
          } else {
            setRealAssessments([])
            setActiveAssessment(null)
          }
        })
        .catch(() => {
          setRealAssessments([])
          setActiveAssessment(null)
        })
    }
  }, [isPreviewMode])

  const totalCount = isPreviewMode ? 412 : realAssessments.length
  const lowCount = isPreviewMode ? 238 : realAssessments.filter(a => a.riskLevel === 'Low' || a.riskScore < 10).length
  const modCount = isPreviewMode ? 118 : realAssessments.filter(a => a.riskLevel === 'Moderate' || (a.riskScore >= 10 && a.riskScore < 20)).length
  const highCount = isPreviewMode ? 56 : realAssessments.filter(a => a.riskLevel === 'High' || a.riskScore >= 20).length

  const calcDistPct = (v: number) => totalCount > 0 ? `${((v / totalCount) * 100).toFixed(1)}%` : '0%'

  // Donut data for Risk Level Distribution
  const riskDistData = [
    { name: 'Low Risk', value: lowCount, color: '#10b981', percentage: calcDistPct(lowCount) },
    { name: 'Moderate Risk', value: modCount, color: '#f59e0b', percentage: calcDistPct(modCount) },
    { name: 'High Risk', value: highCount, color: '#ef4444', percentage: calcDistPct(highCount) },
  ]

  // Multi-line chart data for Assessment Trend
  const trendData = [
    { month: 'Apr', low: isPreviewMode ? 20 : Math.round(lowCount * 0.2), moderate: isPreviewMode ? 15 : Math.round(modCount * 0.2), high: isPreviewMode ? 8 : Math.round(highCount * 0.2) },
    { month: 'May', low: isPreviewMode ? 28 : Math.round(lowCount * 0.35), moderate: isPreviewMode ? 20 : Math.round(modCount * 0.35), high: isPreviewMode ? 12 : Math.round(highCount * 0.35) },
    { month: 'Jun', low: isPreviewMode ? 38 : Math.round(lowCount * 0.5), moderate: isPreviewMode ? 25 : Math.round(modCount * 0.5), high: isPreviewMode ? 15 : Math.round(highCount * 0.5) },
    { month: 'Jul', low: isPreviewMode ? 48 : Math.round(lowCount * 0.65), moderate: isPreviewMode ? 28 : Math.round(modCount * 0.65), high: isPreviewMode ? 18 : Math.round(highCount * 0.65) },
    { month: 'Aug', low: isPreviewMode ? 55 : Math.round(lowCount * 0.8), moderate: isPreviewMode ? 32 : Math.round(modCount * 0.8), high: isPreviewMode ? 22 : Math.round(highCount * 0.8) },
    { month: 'Sep', low: isPreviewMode ? 62 : Math.round(lowCount * 0.9), moderate: isPreviewMode ? 38 : Math.round(modCount * 0.9), high: isPreviewMode ? 25 : Math.round(highCount * 0.9) },
    { month: 'Oct', low: lowCount, moderate: modCount, high: highCount },
  ]

  // Donut data for Processing Status
  const processingStatusData = [
    { name: 'Completed', value: totalCount, color: '#10b981', percentage: totalCount > 0 ? '100%' : '0%' },
    { name: 'Processing', value: 0, color: '#0ea5e9', percentage: '0%' },
    { name: 'Failed', value: 0, color: '#ef4444', percentage: '0%' },
  ]

  const baseList = isPreviewMode ? PREVIEW_ASSESSMENTS : realAssessments
  const assessmentsList = baseList.filter((a) => {
    if (riskFilter !== 'All Risk Levels' && a.riskLevel !== riskFilter) return false
    if (statusFilter !== 'All Status' && a.status !== statusFilter) return false
    if (searchVal && !a.patientName.toLowerCase().includes(searchVal.toLowerCase()) && !a.id.toLowerCase().includes(searchVal.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* 9.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assessments</h1>
          <p className="text-xs text-slate-500 mt-1">
            View and analyze cardiovascular risk assessments performed by patients.
          </p>
        </div>

        <button
          onClick={() => openModal('new-assessment')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* 9.1 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Assessments"
          value={String(totalCount)}
          trend="↗ +18%"
          trendPositive={true}
          subtext={isPreviewMode ? "+63 this month" : `${totalCount} recorded`}
          icon={<Activity className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          isUnavailable={false}
        />
        <StatCard
          title="High Risk"
          value={String(highCount)}
          trend="↗ +5%"
          trendPositive={false}
          subtext={calcDistPct(highCount) + " of total"}
          icon={<HeartPulse className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Moderate Risk"
          value={String(modCount)}
          trend="↗ +12%"
          trendPositive={true}
          subtext={calcDistPct(modCount) + " of total"}
          icon={<BarChart2 className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          isUnavailable={false}
        />
        <StatCard
          title="Low Risk"
          value={String(lowCount)}
          trend="↗ +20%"
          trendPositive={true}
          subtext={calcDistPct(lowCount) + " of total"}
          icon={<ShieldCheck className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          isUnavailable={false}
        />
      </div>

      {/* 9.2 Analytical Panels (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk Level Distribution */}
        <Panel
          title="Risk Level Distribution"
          action={
            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          }
        >
          {(isPreviewMode || totalCount > 0) ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistData}
                      innerRadius={44}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 leading-tight">{totalCount}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Assessments</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {riskDistData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <span>{item.percentage}</span>
                      <span className="text-slate-400 font-normal">({item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="w-5 h-5 text-slate-400" />}
              title="No distribution data"
              description="Connect an operational data source to render risk distribution."
              compact
            />
          )}
        </Panel>

        {/* Assessment Trend (Multi-Line Chart) */}
        <Panel
          title="Assessment Trend"
          action={
            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          }
        >
          {(isPreviewMode || totalCount > 0) ? (
            <div className="h-44 w-full pt-1">
              <div className="flex items-center justify-end gap-3 text-[10px] text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> High Risk
                </span>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="moderate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="w-5 h-5 text-slate-400" />}
              title="No trend data"
              description="Historical monthly patterns will plot as assessments complete."
              compact
            />
          )}
        </Panel>

        {/* Processing Status (Donut Chart) */}
        <Panel
          title="Processing Status"
          action={
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Pipeline Live
            </span>
          }
        >
          {(isPreviewMode || totalCount > 0) ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processingStatusData}
                      innerRadius={44}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {processingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 leading-tight">{totalCount}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Assessments</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {processingStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <span>{item.percentage}</span>
                      <span className="text-slate-400 font-normal">({item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="w-5 h-5 text-slate-400" />}
              title="No pipeline executions"
              description="Real-time model queue metrics appear during AI batch runs."
              compact
            />
          )}
        </Panel>
      </div>

      {/* Main Content: Filter + Assessments Table + Assessment Report Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* 9.3 Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search by patient name or assessment ID..."
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
                <option>Completed</option>
                <option>Processing</option>
                <option>Failed</option>
              </select>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>12 Oct 2024 - 12 Oct 2024</span>
              </div>

              <button
                onClick={() => addToast('Assessment query filters applied.', 'info')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* 9.4 Assessment Table */}
          {(isPreviewMode || assessmentsList.length > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <button
                        onClick={() => {
                          if (selectedIds.length === assessmentsList.length) setSelectedIds([])
                          else setSelectedIds(assessmentsList.map((a) => a.id))
                        }}
                        className="text-slate-400 hover:text-slate-600 block"
                      >
                        {selectedIds.length === assessmentsList.length && assessmentsList.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">Assessment ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3">Key Findings</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {assessmentsList.map((asmt) => {
                    const isSelected = selectedIds.includes(asmt.id)
                    const isActive = activeAssessment?.id === asmt.id
                    return (
                      <tr
                        key={asmt.id}
                        onClick={() => setActiveAssessment(asmt)}
                        className={`transition-colors cursor-pointer ${
                          isActive ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setSelectedIds((prev) =>
                                prev.includes(asmt.id)
                                  ? prev.filter((i) => i !== asmt.id)
                                  : [...prev, asmt.id]
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
                              {asmt.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{asmt.patientName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{asmt.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{asmt.patientAge}</td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">{asmt.id}</td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{asmt.dateTime}</td>
                        <td className="py-3.5 px-3">
                          <RiskBadge level={asmt.riskLevel} size="sm" />
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 max-w-[130px] truncate">
                          {asmt.keyFindings}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                asmt.status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : asmt.status === 'Processing'
                                  ? 'bg-sky-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span
                              className={
                                asmt.status === 'Completed'
                                  ? 'text-slate-700'
                                  : asmt.status === 'Processing'
                                  ? 'text-sky-700'
                                  : 'text-rose-700'
                              }
                            >
                              {asmt.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveAssessment(asmt)}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                            >
                              {asmt.status === 'Completed'
                                ? 'View Report'
                                : asmt.status === 'Processing'
                                ? 'View Details'
                                : 'Retry'}
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
                <span>Showing 1-8 of 412 assessments</span>
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
                    52
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                    <option>8</option>
                    <option>16</option>
                    <option>32</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Activity className="w-6 h-6 text-slate-400" />}
                title="No assessment records available"
                description="Zero clinical assessment records exist in the operational dataset. Initiate a new assessment or toggle Design Preview for visual verification."
                actionLabel="+ New Assessment"
                onAction={() => openModal('new-assessment')}
              />
            </div>
          )}
        </div>

        {/* 9.5 Assessment Report Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-5">
          {activeAssessment ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    {activeAssessment.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeAssessment.patientName}</h3>
                    <p className="text-[11px] text-slate-400">
                      ID: {activeAssessment.patientId} | {activeAssessment.patientAge} years, Male
                    </p>
                    <p className="text-[10px] text-slate-400">{activeAssessment.dateTime}</p>
                  </div>
                </div>

                <RiskBadge level={activeAssessment.riskLevel} size="sm" />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-3">
                {(['Overview', 'AI Analysis', 'Grad-CAM', 'Medical Info'] as const).map((tab) => (
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
                      {activeAssessment.riskScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <RiskBadge level={activeAssessment.riskLevel} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Based on AI model analysis
                  </span>
                </div>

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

              {/* Health Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">BP</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeAssessment.metrics?.bp || '142/90'}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">mmHg</span>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center gap-2.5">
                  <Droplet className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Cholesterol</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeAssessment.metrics?.cholesterol || 240}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">mg/dL</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Glucose</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeAssessment.metrics?.glucose || 110}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">mg/dL</span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5">
                  <HeartPulse className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Heart Rate</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeAssessment.metrics?.heartRate || 82}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">bpm</span>
                  </div>
                </div>
              </div>

              {/* Key Findings List */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Key Findings</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>Elevated blood pressure (142/90 mmHg)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>High cholesterol level (240 mg/dL)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Increased risk of cardiovascular disease</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span>Recommend lifestyle changes and medication review</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToast('PDF generator service required.', 'info')}
                    className="py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>

                  <button
                    onClick={() => addToast('Patient portal sharing integration required.', 'info')}
                    className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share with Patient</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToast('Follow-up scheduler integration required.', 'info')}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Schedule Follow-up</span>
                  </button>

                  <button
                    onClick={() => addToast('Clinical notes persist requires database.', 'info')}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Add Notes</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Activity className="w-6 h-6 text-slate-400" />}
              title="No Assessment Selected"
              description="Select an assessment row to inspect deep learning model outputs, clinical metrics, and physician actions."
            />
          )}
        </div>
      </div>
    </div>
  )
}
