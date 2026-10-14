import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Activity,
  HeartPulse,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Brain,
  MoreVertical,
  CalendarDays,
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
import {
  PREVIEW_ASSESSMENTS,
  PREVIEW_APPOINTMENTS,
} from '../data/referencePreviewData'
import type { Assessment, RiskLevel } from '../types'
import { api, type DoctorDashboardSummary, type ClinicalReport } from '../services/api'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { isPreviewMode, openModal, addToast, setSelectedReportId, currentDoctor } =
    useApp()

  const [summary, setSummary] = React.useState<DoctorDashboardSummary | null>(null)

  React.useEffect(() => {
    if (!isPreviewMode) {
      api.getDoctorDashboardSummary()
        .then((data) => setSummary(data))
        .catch((err) => console.error('Dashboard summary fetch failed:', err))
    }
  }, [isPreviewMode])

  // Format system date according to reference style
  const todayDateStr = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date())

  const totalReportsCount = isPreviewMode
    ? 248
    : ((summary?.stats.low_risk_count ?? 0) + (summary?.stats.moderate_risk_count ?? 0) + (summary?.stats.high_risk_count ?? 0))

  const lowVal = isPreviewMode ? 104 : (summary?.stats.low_risk_count ?? 0)
  const modVal = isPreviewMode ? 69 : (summary?.stats.moderate_risk_count ?? 0)
  const highVal = isPreviewMode ? 45 : (summary?.stats.high_risk_count ?? 0)

  const calcPct = (val: number) =>
    totalReportsCount > 0 ? `${Math.round((val / totalReportsCount) * 100)}%` : '0%'

  // Risk donut data
  const riskDonutData = [
    {
      name: 'Low Risk',
      value: lowVal,
      color: '#10b981',
      percentage: calcPct(lowVal),
    },
    {
      name: 'Moderate Risk',
      value: modVal,
      color: '#f59e0b',
      percentage: calcPct(modVal),
    },
    {
      name: 'High Risk',
      value: highVal,
      color: '#f97316',
      percentage: calcPct(highVal),
    },
    ...(isPreviewMode ? [{ name: 'Very High Risk', value: 30, color: '#ef4444', percentage: '12%' }] : []),
  ]

  // Trend data
  const trendData = [
    { month: 'Apr', assessments: isPreviewMode ? 40 : Math.round(totalReportsCount * 0.15) },
    { month: 'May', assessments: isPreviewMode ? 65 : Math.round(totalReportsCount * 0.25) },
    { month: 'Jun', assessments: isPreviewMode ? 85 : Math.round(totalReportsCount * 0.45) },
    { month: 'Jul', assessments: isPreviewMode ? 110 : Math.round(totalReportsCount * 0.65) },
    { month: 'Aug', assessments: isPreviewMode ? 135 : Math.round(totalReportsCount * 0.85) },
    { month: 'Sep', assessments: isPreviewMode ? 160 : totalReportsCount },
  ]

  const mapReportToAssessment = (c: ClinicalReport): Assessment => ({
    id: c.report_id || `REP-${c.id}`,
    patientId: `PAT-${String(c.patient_id).padStart(4, '0')}`,
    patientName: c.patient_name || 'Anonymous Patient',
    patientAge: c.age || 45,
    patientGender: (c.sex?.toLowerCase() === 'female' ? 'Female' : 'Male'),
    dateTime: new Date(c.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    riskLevel: (c.risk_level === 'High' ? 'High' : c.risk_level === 'Moderate' ? 'Moderate' : 'Low') as RiskLevel,
    riskScore: Math.round(c.risk_percentage || 0),
    keyFindings: c.result || 'Cardiovascular assessment completed',
    status: 'Completed',
    metrics: {
      bp: c.trestbps ? `${c.trestbps}` : 'Not recorded',
      cholesterol: Math.round(c.chol || 0),
      glucose: c.fbs ? 130 : 95,
      heartRate: Math.round(c.thalch || 0),
    },
  })

  const assessmentsList = isPreviewMode
    ? PREVIEW_ASSESSMENTS.slice(0, 5)
    : (summary?.recent_reports?.map(mapReportToAssessment) || [])
  const appointmentsList = isPreviewMode ? PREVIEW_APPOINTMENTS.slice(0, 4) : []

  return (
    <div className="space-y-6">
      {/* 7.1 Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentDoctor?.full_name
                ? `Welcome back, ${currentDoctor.full_name}!`
                : isPreviewMode
                ? 'Welcome back, Dr. Arjun Mehta!'
                : 'Welcome to TrustBeat'}
            </h1>
            {(currentDoctor?.doctor_id || isPreviewMode) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                {currentDoctor?.doctor_id || 'DOC-7F21A9C84D36B508'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isPreviewMode || currentDoctor
              ? "Here's an overview of your patients and cardiovascular health insights."
              : 'Cardiovascular risk assessments, patient tracking, and AI diagnostics platform.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dynamic system date */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5 text-xs text-slate-700">
            <CalendarDays className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 font-semibold block">Today</span>
              <span className="font-bold text-slate-800">{todayDateStr}</span>
            </div>
          </div>

          {/* New Assessment button */}
          <button
            onClick={() => openModal('new-assessment')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* 7.2 Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={isPreviewMode ? '248' : (summary ? String(summary.stats.total_patients) : '0')}
          trend="↗ +12%"
          trendPositive={true}
          subtext={isPreviewMode ? "+26 new this month" : `${summary?.stats.total_patients || 0} active`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
        <StatCard
          title="Total Assessments"
          value={isPreviewMode ? '412' : (summary ? String(summary.stats.total_reports) : '0')}
          trend="↗ +18%"
          trendPositive={true}
          subtext={isPreviewMode ? "+63 this month" : `${summary?.stats.total_reports || 0} completed`}
          icon={<Activity className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          isUnavailable={false}
        />
        <StatCard
          title="High Risk Patients"
          value={isPreviewMode ? '56' : (summary ? String(summary.stats.high_risk_count) : '0')}
          trend="↗ +5%"
          trendPositive={false}
          subtext={isPreviewMode ? "Require follow-up" : `${summary?.stats.high_risk_count || 0} flagged high`}
          icon={<HeartPulse className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Blockchain Verified"
          value={isPreviewMode ? '128' : (summary ? String(summary.stats.verified_onchain_count) : '0')}
          trend="↗ +33%"
          trendPositive={true}
          subtext={isPreviewMode ? "Today" : `${summary?.stats.verified_onchain_count || 0} on-chain`}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-cyan-50"
          iconColor="text-cyan-600"
          isUnavailable={false}
        />
      </div>

      {/* Middle Row: Risk Distribution + Assessment Trends + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Distribution (Donut Chart) */}
        <div className="lg:col-span-4">
          <Panel
            title="Risk Distribution"
            action={
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
                <option>All Patients</option>
                <option>Active Patients</option>
                <option>Inpatients</option>
              </select>
            }
            className="h-full"
          >
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="relative w-44 h-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDonutData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {riskDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-900 leading-none">
                      {isPreviewMode ? 248 : (summary?.stats.total_patients ?? totalReportsCount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">Patients</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs w-full">
                  {riskDonutData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
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
                title="No risk distribution data"
                description="Connect an operational data source or import records to view patient risk classification."
              />
            )}
          </Panel>
        </div>

        {/* Assessment Trends (Line Chart) */}
        <div className="lg:col-span-5">
          <Panel
            title="Assessment Trends"
            action={
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
            }
            className="h-full"
          >
            {isPreviewMode ? (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      domain={[0, 200]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="assessments"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ fill: '#0d9488', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="w-5 h-5 text-slate-400" />}
                title="No historical trend data"
                description="Assessment volume history will chart automatically once patient sessions are recorded."
              />
            )}
          </Panel>
        </div>

        {/* AI Insights Card */}
        <div className="lg:col-span-3">
          <Panel
            title="AI Insights"
            action={
              <Link
                to="/ai-insights"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="h-full"
          >
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      <span className="text-rose-600">{isPreviewMode ? 5 : (summary?.stats.high_risk_count ?? 0)}</span> high-risk patients
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {isPreviewMode ? 'require immediate follow-up.' : 'flagged for clinical review.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      <span className="text-blue-600">{isPreviewMode ? '17%' : (summary?.stats.verified_onchain_count ?? 0)}</span> {isPreviewMode ? 'increase in high-risk' : 'on-chain verified records'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {isPreviewMode ? 'cases this month.' : 'cryptographically anchored.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isPreviewMode ? 'Most common risk factor:' : 'Total Patient Reports:'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {isPreviewMode ? 'Hypertension (62%).' : `${summary?.stats.total_reports ?? totalReportsCount} assessment records evaluated.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Brain className="w-5 h-5 text-slate-400" />}
                title="No AI insights yet"
                description="AI insights will appear when validated assessment data is available."
                compact
              />
            )}
          </Panel>
        </div>
      </div>

      {/* Bottom Row: Recent Assessments + Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Assessments Table (7 cols) */}
        <div className="lg:col-span-7">
          <Panel
            title="Recent Assessments"
            action={
              <Link
                to="/assessments"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {(isPreviewMode || assessmentsList.length > 0) ? (
              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-5">Patient</th>
                      <th className="py-2.5 px-3">Age</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3">Key Findings</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {assessmentsList.map((asmt) => (
                      <tr key={asmt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {asmt.patientName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{asmt.patientName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{asmt.patientAge}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {asmt.dateTime.split(',')[0]}
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={asmt.riskLevel} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                          {asmt.keyFindings}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedReportId(asmt.id)
                                navigate('/reports')
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                            >
                              View Report
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<Activity className="w-5 h-5 text-slate-400" />}
                title="No recent assessments"
                description="Clinical evaluations performed by doctors will be logged here."
                actionLabel="Create Assessment"
                onAction={() => openModal('new-assessment')}
              />
            )}
          </Panel>
        </div>

        {/* Upcoming Appointments (5 cols) */}
        <div className="lg:col-span-5">
          <Panel
            title="Upcoming Appointments"
            action={
              <Link
                to="/appointments"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {isPreviewMode ? (
              <div className="space-y-3">
                {appointmentsList.map((apt, idx) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center shrink-0 w-14">
                        <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                          {apt.time.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {apt.time.split(' ')[1]}
                        </span>
                      </div>

                      <div className="w-1.5 h-7 rounded-full bg-teal-600 shrink-0" />

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{apt.patientName}</p>
                          <p className="text-[11px] text-slate-400">{apt.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {idx === 2 ? (
                        <button
                          onClick={() => addToast('Reschedule modal will open', 'info')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          Reschedule
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            addToast(
                              'Telehealth connector required. Video call room simulated.',
                              'info'
                            )
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-5 h-5 text-slate-400" />}
                title="No appointments scheduled"
                description="Consultations and patient checkups will appear here once booked."
                actionLabel="Schedule Appointment"
                onAction={() => addToast('Appointment booking integration is deferred.', 'info')}
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
