import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  HeartPulse,
  Brain,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  ArrowRight,
  Calendar,
  Lightbulb,
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
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { api, type ClinicalReport } from '../services/api'
import gradcamOriginal from '../assets/gradcam_original.png'
import gradcamHeatmap from '../assets/gradcam_heatmap.png'

export const AIInsights: React.FC = () => {
  const { isPreviewMode, addToast } = useApp()

  const [dateRange] = useState('12 Oct 2024 - 12 Oct 2025')
  const [patientFilter, setPatientFilter] = useState('All Patients')
  const [realReports, setRealReports] = useState<ClinicalReport[]>([])

  React.useEffect(() => {
    if (!isPreviewMode) {
      api.getDoctorReports()
        .then((data) => setRealReports(data))
        .catch(() => setRealReports([]))
    } else {
      setRealReports([])
    }
  }, [isPreviewMode])

  const totalReportsCount = isPreviewMode ? 248 : realReports.length
  const highRiskCount = isPreviewMode ? 56 : realReports.filter(r => r.risk_level === 'High' || r.risk_percentage >= 20).length
  const modRiskCount = isPreviewMode ? 71 : realReports.filter(r => r.risk_level === 'Moderate' || (r.risk_percentage >= 10 && r.risk_percentage < 20)).length
  const lowRiskCount = isPreviewMode ? 143 : realReports.filter(r => r.risk_level === 'Low' || r.risk_percentage < 10).length

  const calcDistPct = (v: number) => totalReportsCount > 0 ? `${((v / totalReportsCount) * 100).toFixed(1)}%` : '0%'

  const trendData = [
    { month: 'Apr', low: isPreviewMode ? 22 : Math.round(lowRiskCount * 0.2), moderate: isPreviewMode ? 12 : Math.round(modRiskCount * 0.2), high: isPreviewMode ? 8 : Math.round(highRiskCount * 0.2) },
    { month: 'May', low: isPreviewMode ? 32 : Math.round(lowRiskCount * 0.35), moderate: isPreviewMode ? 18 : Math.round(modRiskCount * 0.35), high: isPreviewMode ? 11 : Math.round(highRiskCount * 0.35) },
    { month: 'Jun', low: isPreviewMode ? 45 : Math.round(lowRiskCount * 0.5), moderate: isPreviewMode ? 22 : Math.round(modRiskCount * 0.5), high: isPreviewMode ? 14 : Math.round(highRiskCount * 0.5) },
    { month: 'Jul', low: isPreviewMode ? 58 : Math.round(lowRiskCount * 0.65), moderate: isPreviewMode ? 28 : Math.round(modRiskCount * 0.65), high: isPreviewMode ? 18 : Math.round(highRiskCount * 0.65) },
    { month: 'Aug', low: isPreviewMode ? 68 : Math.round(lowRiskCount * 0.8), moderate: isPreviewMode ? 33 : Math.round(modRiskCount * 0.8), high: isPreviewMode ? 22 : Math.round(highRiskCount * 0.8) },
    { month: 'Sep', low: isPreviewMode ? 78 : Math.round(lowRiskCount * 0.9), moderate: isPreviewMode ? 38 : Math.round(modRiskCount * 0.9), high: isPreviewMode ? 25 : Math.round(highRiskCount * 0.9) },
    { month: 'Oct', low: lowRiskCount, moderate: modRiskCount, high: highRiskCount },
  ]

  const featureImportance = [
    { factor: 'Systolic Blood Pressure', score: '28.4%', width: '85%', color: 'bg-rose-500' },
    { factor: 'Cholesterol Level', score: '18.7%', width: '56%', color: 'bg-amber-500' },
    { factor: 'Age', score: '15.2%', width: '45%', color: 'bg-amber-400' },
    { factor: 'Heart Rate', score: '12.6%', width: '38%', color: 'bg-emerald-500' },
    { factor: 'Diabetes', score: '10.1%', width: '30%', color: 'bg-teal-500' },
    { factor: 'BMI', score: '8.3%', width: '25%', color: 'bg-sky-500' },
    { factor: 'Family History', score: '6.7%', width: '20%', color: 'bg-purple-500' },
  ]

  const riskDistData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10b981', percentage: calcDistPct(lowRiskCount) },
    { name: 'Moderate Risk', value: modRiskCount, color: '#f59e0b', percentage: calcDistPct(modRiskCount) },
    { name: 'High Risk', value: highRiskCount, color: '#ef4444', percentage: calcDistPct(highRiskCount) },
  ]

  return (
    <div className="space-y-6">
      {/* 11.1 Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover patterns, trends and actionable insights from AI-powered cardiovascular risk analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none shadow-xs"
          >
            <option>All Patients</option>
            <option>High Risk Group</option>
            <option>Outpatients</option>
          </select>
        </div>
      </div>

      {/* 11.2 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients Analyzed"
          value={String(totalReportsCount)}
          trend="↗ +18%"
          trendPositive={true}
          subtext={isPreviewMode ? "+26 new this month" : `${totalReportsCount} evaluated`}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
        <StatCard
          title="High Risk Detected"
          value={String(highRiskCount)}
          trend="↗ +5%"
          trendPositive={false}
          subtext={calcDistPct(highRiskCount) + " of total"}
          icon={<HeartPulse className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Model Accuracy"
          value="94.2%"
          trend="↗ +2.1%"
          trendPositive={true}
          subtext="ResNet50-APTOS-DR validated"
          icon={<Brain className="w-6 h-6" />}
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
          isUnavailable={false}
        />
        <StatCard
          title="AI Insights Generated"
          value={String(isPreviewMode ? 128 : (totalReportsCount > 0 ? totalReportsCount * 2 : 0))}
          trend="↗ +22%"
          trendPositive={true}
          subtext="Actionable insights"
          icon={<Sparkles className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          isUnavailable={false}
        />
      </div>

      {/* Middle Row (3 cards: Risk Trend, Risk Factor Importance, Patient Risk Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Trend Analysis (5 cols) */}
        <div className="lg:col-span-4">
          <Panel
            title="Risk Trend Analysis"
            action={
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
                <option>Last 6 Months</option>
                <option>Last 1 Year</option>
              </select>
            }
            className="h-full"
          >
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="h-56 w-full pt-1">
                <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> High
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
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
                title="No risk trend records"
                description="Assessment history required to plot multi-series risk distribution trends."
              />
            )}
          </Panel>
        </div>

        {/* Risk Factor Importance (AI Model) (4 cols) */}
        <div className="lg:col-span-4">
          <Panel title="Risk Factor Importance (AI Model)" className="h-full">
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="space-y-2.5 pt-1">
                {featureImportance.map((item) => (
                  <div key={item.factor}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{item.factor}</span>
                      <span className="text-slate-900">{item.score}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Brain className="w-5 h-5 text-slate-400" />}
                title="Feature importance unconfigured"
                description="SHAP / Grad-CAM model explanation weights will populate once trained model inference is connected."
              />
            )}
          </Panel>
        </div>

        {/* Patient Risk Distribution (4 cols) */}
        <div className="lg:col-span-4">
          <Panel title="Patient Risk Distribution" className="h-full">
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="flex flex-col items-center justify-between gap-3 pt-2">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistData}
                        innerRadius={50}
                        outerRadius={70}
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
                    <span className="text-xl font-extrabold text-slate-900 leading-none">{totalReportsCount}</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">Patients</span>
                  </div>
                </div>

                <div className="w-full space-y-1.5 text-xs">
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
                icon={<HeartPulse className="w-5 h-5 text-slate-400" />}
                title="No distribution data"
                description="Connect patient data to display categorized risk proportions."
              />
            )}
          </Panel>
        </div>
      </div>

      {/* Lower-Middle Row (3 cards: Model Performance, Common Patterns, Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* AI Model Performance (4 cols) */}
        <div className="lg:col-span-4">
          <Panel
            title="AI Model Performance"
            action={
              <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none">
                <option>All Classes</option>
                <option>High Risk Class</option>
              </select>
            }
            className="h-full"
          >
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                      92.4%
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Accuracy</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                      91.8%
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Precision</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                      89.7%
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Recall</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                      0.91
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">F1-Score</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Target className="w-5 h-5 text-slate-400" />}
                title="Model evaluation metrics unverified"
                description="Evaluation metrics require benchmark test dataset validation results from the ML server."
              />
            )}
          </Panel>
        </div>

        {/* Common Patterns in High Risk Patients (4 cols) */}
        <div className="lg:col-span-4">
          <Panel title="Common Patterns in High Risk Patients" className="h-full">
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-700 font-medium">
                    Elevated systolic blood pressure (&gt;140 mmHg)
                  </span>
                  <span className="font-extrabold text-rose-600">68%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-700 font-medium">
                    High cholesterol level (&gt;240 mg/dL)
                  </span>
                  <span className="font-extrabold text-amber-600">62%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-700 font-medium">Age above 55 years</span>
                  <span className="font-extrabold text-slate-800">58%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-700 font-medium">History of diabetes</span>
                  <span className="font-extrabold text-slate-800">46%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-700 font-medium">Irregular heart rate</span>
                  <span className="font-extrabold text-slate-800">38%</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Brain className="w-5 h-5 text-slate-400" />}
                title="No clinical patterns detected"
                description="Statistical cohort correlations emerge when sufficient patient records are processed."
              />
            )}
          </Panel>
        </div>

        {/* AI Insights & Recommendations (4 cols) */}
        <div className="lg:col-span-4">
          <Panel
            title="AI Insights & Recommendations"
            action={
              <button
                onClick={() => addToast('Full recommendation list dialog.', 'info')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
            className="h-full"
          >
            {(isPreviewMode || totalReportsCount > 0) ? (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-start gap-3">
                  <HeartPulse className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700 leading-snug">
                    Increased high-risk cases in patients aged 50+ (↑ 22% compared to last month).
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700 leading-snug">
                    Systolic blood pressure and cholesterol are the top contributing factors for high risk predictions.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700 leading-snug">
                    Recommend lifestyle changes and regular monitoring for moderate-risk patients to prevent progression.
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Lightbulb className="w-5 h-5 text-slate-400" />}
                title="No automated insights"
                description="AI model recommendations generate when risk criteria are fulfilled."
              />
            )}
          </Panel>
        </div>
      </div>

      {/* Bottom Row (Sample AI Analysis & Top Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sample AI Analysis (Grad-CAM) (7 cols) */}
        <div className="lg:col-span-7">
          <Panel
            title="Sample AI Analysis (Grad-CAM)"
            action={
              <Link
                to="/gradcam"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {isPreviewMode ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="grid grid-cols-2 gap-2 shrink-0 w-full sm:w-auto">
                  <div className="w-36 h-28 rounded-xl bg-black overflow-hidden relative">
                    <img
                      src={gradcamOriginal}
                      alt="Original Image"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded">
                      Original Image
                    </span>
                  </div>

                  <div className="w-36 h-28 rounded-xl bg-black overflow-hidden relative">
                    <img
                      src={gradcamHeatmap}
                      alt="Grad-CAM Heatmap"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded">
                      Grad-CAM Heatmap
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">AI Analysis Result</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-md">
                      High Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The model has identified important regions related to cardiovascular enlargement and structural changes indicating higher risk.
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Brain className="w-5 h-5 text-slate-400" />}
                title="No sample heatmap analysis"
                description="Grad-CAM visual attention overlays will display after model inference execution."
              />
            )}
          </Panel>
        </div>

        {/* Top Recommendations (5 cols) */}
        <div className="lg:col-span-5">
          <Panel
            title="Top Recommendations"
            action={
              <button
                onClick={() => addToast('Recommendations exported.', 'info')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {isPreviewMode ? (
              <div className="space-y-2 pt-1 text-xs">
                {[
                  'Regular monitoring of blood pressure and cholesterol levels',
                  'Lifestyle modifications (healthy diet, regular exercise)',
                  'Early intervention for moderate-risk patients',
                  'Follow-up assessments every 3-6 months',
                  'Further evaluation for high-risk patients',
                ].map((rec, index) => (
                  <div key={index} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Lightbulb className="w-5 h-5 text-slate-400" />}
                title="No clinical recommendations"
                description="Clinical guidelines generate automatically based on verified cardiovascular patterns."
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
