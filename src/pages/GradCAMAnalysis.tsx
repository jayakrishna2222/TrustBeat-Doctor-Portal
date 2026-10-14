import React, { useState } from 'react'
import {
  Scan,
  Search,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  HeartPulse,
  BarChart2,
  ShieldCheck,
  Download,
  Users,
  Sparkles,
  X,
} from 'lucide-react'
import { Panel } from '../components/Panel'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_PATIENTS } from '../data/referencePreviewData'
import type { Patient } from '../types'
import { api } from '../services/api'
import gradcamOriginal from '../assets/gradcam_original.png'
import gradcamHeatmap from '../assets/gradcam_heatmap.png'
import gradcamOverlay from '../assets/gradcam_overlay.png'
import gradcamAttention from '../assets/gradcam_attention.png'

export const GradCAMAnalysis: React.FC = () => {
  const { isPreviewMode, addToast } = useApp()

  const [searchVal, setSearchVal] = useState('')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [sortOrder, setSortOrder] = useState('Latest First')

  const [realPatients, setRealPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    isPreviewMode ? PREVIEW_PATIENTS[0] : null
  )

  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  React.useEffect(() => {
    if (isPreviewMode) {
      setRealPatients([])
      setSelectedPatient(PREVIEW_PATIENTS[0])
    } else {
      api.getDoctorReports()
        .then((reports) => {
          if (reports.length > 0) {
            const map = new Map<number, Patient>()
            for (const c of reports) {
              if (!map.has(c.patient_id)) {
                map.set(c.patient_id, {
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
                })
              }
            }
            const pts = Array.from(map.values())
            setRealPatients(pts)
            setSelectedPatient(pts[0] || null)
          } else {
            setRealPatients([])
            setSelectedPatient(null)
          }
        })
        .catch(() => {
          setRealPatients([])
          setSelectedPatient(null)
        })
    }
  }, [isPreviewMode])

  const sourcePatients = isPreviewMode ? PREVIEW_PATIENTS : realPatients
  const patientList = sourcePatients.filter((p) => {
    if (riskFilter !== 'All Risk Levels' && p.riskLevel !== riskFilter) return false
    if (
      searchVal &&
      !p.name.toLowerCase().includes(searchVal.toLowerCase()) &&
      !p.id.toLowerCase().includes(searchVal.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* 12.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Grad-CAM Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualize AI model attention and understand key regions influencing cardiovascular risk predictions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => addToast('Patient comparison dialog loaded.', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Compare Patients</span>
          </button>

          <button
            onClick={() => addToast('Analysis PDF export engine required.', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analysis</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 12.2 Patient Selector (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Select Patient</h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-none"
            >
              <option>All Risk Levels</option>
              <option>High</option>
              <option>Moderate</option>
              <option>Low</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-none"
            >
              <option>Latest First</option>
              <option>Oldest First</option>
            </select>
          </div>

          {isPreviewMode ? (
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {patientList.map((pt) => {
                const isSelected = selectedPatient?.id === pt.id
                return (
                  <div
                    key={pt.id}
                    onClick={() => setSelectedPatient(pt)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {pt.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {pt.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{pt.id}</p>
                        <p className="text-[9px] text-slate-400">{pt.lastAssessment}</p>
                      </div>
                    </div>

                    <RiskBadge level={pt.riskLevel} size="sm" />
                  </div>
                )
              })}

              {/* Pagination */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <button className="p-1 hover:text-slate-600">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1 font-semibold text-slate-600">
                  <span className="w-5 h-5 bg-teal-700 text-white rounded flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>...</span>
                  <span>42</span>
                </div>
                <button className="p-1 hover:text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Users className="w-5 h-5 text-slate-400" />}
              title="No patient records"
              description="Patient list is empty in Zero Fake Data mode."
              compact
            />
          )}
        </div>

        {/* Center Column: Medical Image Analysis & Attention Regions (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 12.3 Medical Image Analysis */}
          <Panel
            title="Medical Image Analysis"
            subtitle={
              isPreviewMode && selectedPatient
                ? `Patient: ${selectedPatient.name} | ID: ${selectedPatient.id} | Date: ${selectedPatient.lastAssessment}, 10:30 AM`
                : 'DICOM MRI sequence viewer'
            }
          >
            {isPreviewMode ? (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {/* Original Image */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square bg-black rounded-xl overflow-hidden relative group border border-slate-200">
                    <img
                      src={gradcamOriginal}
                      alt="Original Image"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setExpandedImage('Original Image')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Original Image</span>
                </div>

                {/* Grad-CAM Heatmap */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square bg-black rounded-xl overflow-hidden relative group border border-slate-200">
                    <img
                      src={gradcamHeatmap}
                      alt="Grad-CAM Heatmap"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setExpandedImage('Grad-CAM Heatmap')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Grad-CAM Heatmap</span>
                </div>

                {/* Overlay View */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square bg-black rounded-xl overflow-hidden relative group border border-slate-200">
                    <img
                      src={gradcamOverlay}
                      alt="Overlay View"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setExpandedImage('Overlay View')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Overlay View</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Scan className="w-6 h-6 text-slate-400" />}
                title="No image analysis loaded"
                description="Upload or connect cardiac MRI DICOM scan to run Grad-CAM convolutional layer visual attention maps."
              />
            )}
          </Panel>

          {/* 12.5 Attention Regions */}
          <Panel
            title="Attention Regions"
            subtitle="Key regions that influenced the AI prediction"
          >
            {isPreviewMode ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                {/* MRI scan with bounding boxes */}
                <div className="md:col-span-5 aspect-square bg-black rounded-xl overflow-hidden relative border border-slate-200">
                  <img
                    src={gradcamAttention}
                    alt="Attention Regions"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setExpandedImage('Attention Regions')}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-md"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Region items */}
                <div className="md:col-span-7 space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Left Ventricular Region
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">42.6%</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Structural changes and wall thickness variation detected.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Myocardial Tissue</span>
                        <span className="text-xs font-extrabold text-slate-900">28.3%</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Intensity variations indicating potential abnormalities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Aortic Region</span>
                        <span className="text-xs font-extrabold text-slate-900">18.7%</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Irregular patterns in vascular structure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Surrounding Tissue</span>
                        <span className="text-xs font-extrabold text-slate-900">10.4%</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Secondary contributing factors.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Scan className="w-6 h-6 text-slate-400" />}
                title="Attention regions uncomputed"
                description="Convolutional feature attribution heatmaps require model inference."
              />
            )}
          </Panel>
        </div>

        {/* Right Column: AI Analysis Result & Key Findings (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* 12.4 AI Analysis Result */}
          <Panel title="AI Analysis Result" className="h-auto">
            {isPreviewMode ? (
              <div className="space-y-4 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Risk Score
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">78</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                      <RiskBadge level="High" size="sm" />
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      Based on AI model analysis
                    </span>
                  </div>
                </div>

                {/* Model Confidence Bars */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Model Confidence</h4>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>High Risk</span>
                      <span>78.4%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full w-[78.4%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Moderate Risk</span>
                      <span>15.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[15.2%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Low Risk</span>
                      <span>4.3%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[4.3%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Normal</span>
                      <span>2.1%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full w-[2.1%]" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<BarChart2 className="w-5 h-5 text-slate-400" />}
                title="No risk inference output"
                description="Model probabilities require backend prediction."
                compact
              />
            )}
          </Panel>

          {/* 12.6 Key Findings */}
          <Panel title="Key Findings">
            {isPreviewMode ? (
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-start gap-2.5">
                  <HeartPulse className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 leading-snug">
                    Abnormal structural patterns detected in left ventricular region.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <BarChart2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 leading-snug">
                    AI model identified areas of higher intensity indicating potential cardiovascular risk.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 leading-snug">
                    Multiple regions show structural variations compared to normal reference patterns.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 leading-snug">
                    Recommend detailed evaluation by cardiologist and additional diagnostic tests.
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Info className="w-5 h-5 text-slate-400" />}
                title="No clinical findings"
                description="Automated medical remarks generate when features correlate with risk thresholds."
                compact
              />
            )}
          </Panel>
        </div>
      </div>

      {/* Bottom Row: Similar Cases & Model Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Similar Cases (7 cols) */}
        <div className="lg:col-span-7">
          <Panel
            title="Similar Cases"
            action={
              <button
                onClick={() => addToast('Case library index required.', 'info')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {isPreviewMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { match: '92% match', risk: 'High Risk' },
                  { match: '87% match', risk: 'High Risk' },
                  { match: '76% match', risk: 'Moderate Risk' },
                  { match: '71% match', risk: 'Moderate Risk' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 text-center">
                    <div className="aspect-square bg-black rounded-xl overflow-hidden relative border border-slate-200">
                      <img
                        src={gradcamHeatmap}
                        alt="Similar Case"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        item.risk === 'High Risk'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {item.risk}
                    </span>
                    <p className="text-[10px] text-slate-400">{item.match}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="w-5 h-5 text-slate-400" />}
                title="No case similarities computed"
                description="Vector embeddings search requires hospital database indexing."
                compact
              />
            )}
          </Panel>
        </div>

        {/* Model Information (5 cols) */}
        <div className="lg:col-span-5">
          <Panel title="Model Information">
            {isPreviewMode ? (
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">AI Model</span>
                  <span className="font-bold text-slate-800">CardioNet v2.1 (CNN + Grad-CAM)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Input Image</span>
                  <span className="font-semibold text-slate-800">Cardiac MRI (224 × 224)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Processing Time</span>
                  <span className="font-semibold text-slate-800">2.3 seconds</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Model Accuracy</span>
                  <span className="font-bold text-emerald-600">92.4% (on validation set)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Updated</span>
                  <span className="font-semibold text-slate-800">01 Oct 2024</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="w-5 h-5 text-slate-400" />}
                title="AI inference model offline"
                description="Deep learning weights and pipeline metadata connect via API."
                compact
              />
            )}
          </Panel>
        </div>
      </div>

      {/* Expanded Image Viewer Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 flex flex-col items-center">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3">{expandedImage}</h4>
            <div className="max-h-[70vh] aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={
                  expandedImage === 'Original Image'
                    ? gradcamOriginal
                    : expandedImage === 'Grad-CAM Heatmap'
                    ? gradcamHeatmap
                    : expandedImage === 'Overlay View'
                    ? gradcamOverlay
                    : gradcamAttention
                }
                alt={expandedImage}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

