import { useState, useRef, useEffect } from 'react'
import { X, Camera, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { findNearestPIU } from './findNearestPIU'

const inputClass =
  'w-full rounded-xl px-3 py-2.5 text-sm bg-white/12 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400/40 transition-all duration-150'

const labelClass = 'text-white/90 text-xs font-medium uppercase tracking-wide'

const submitClass =
  'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm bg-green-400/30 hover:bg-green-400/50 border border-green-400/50 hover:border-green-400/80 text-green-200 hover:text-white backdrop-blur-sm transition-all duration-150 shadow-[0_0_12px_rgba(74,222,128,0.15)] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]'

export default function DefectModal({ nhName, hasSelectedRoad = true, onClose }) {
  const [step, setStep] = useState('camera')
  const [photoURL, setPhotoURL] = useState(null)
  const [vlmStatus, setVlmStatus] = useState('Analyzing damage...')
  const [userDescription, setUserDescription] = useState('')
  const [assessmentText, setAssessmentText] = useState('[Please describe the defect here]')
  const [nearestPIU, setNearestPIU] = useState(null)
  const [location, setLocation] = useState(null)
  const [email, setEmail] = useState({
    to: '',
    subject: `Road Defect Report - ${nhName}`,
    body: '',
  })
  const fileRef = useRef(null)

  function buildBody(description, loc, piu, userDesc) {
    const locationStr = loc
      ? `GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
      : 'Location unavailable'
    const officeStr = piu
      ? `Nearest Office: ${piu.piu_city} (${piu.ro_name})`
      : 'Nearest Office: Unknown'

    const userSection = userDesc?.trim()
      ? `User Description:\n${userDesc.trim()}\n\n`
      : ''

    return `Defect Report
═══════════════════════════
NH: ${nhName}
${officeStr}
${locationStr}
Reported at: ${new Date().toLocaleString()}

${userSection}${description}

═══════════════════════════
Reported via RoadWatch App`
  }

  function syncEmailBody(description, loc, piu, userDesc) {
    setEmail(prev => ({
      ...prev,
      body: buildBody(description, loc, piu, userDesc),
    }))
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        const loc = { lat: latitude, lng: longitude }
        setLocation(loc)

        const piu = await findNearestPIU(latitude, longitude)
        setNearestPIU(piu)

        setEmail(prev => ({
          ...prev,
          to: piu?.best_email || '',
          subject: `Road Defect Report - ${nhName}${piu ? ' - ' + piu.piu_city : ''}`,
          body: buildBody(assessmentText, loc, piu, userDescription),
        }))
      },
      err => {
        console.error('GPS failed:', err)
        syncEmailBody(assessmentText, null, null, userDescription)
      }
    )
  }, [])

  function handleDescriptionChange(value) {
    setUserDescription(value)
    syncEmailBody(assessmentText, location, nearestPIU, value)
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoURL(URL.createObjectURL(file))
    setStep('analyzing')
    await analyzePhoto(file)
  }

  async function analyzePhoto(file) {
    let description = assessmentText

    try {
      setVlmStatus('Analyzing damage...')
      const base64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.readAsDataURL(file)
      })

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64}` },
                },
                {
                  type: 'text',
                  text: 'Describe the road damage or defect in this image. Be specific about type (pothole, crack, waterlogging etc), location on road, and severity. Keep it under 100 words.',
                },
              ],
            },
          ],
          max_tokens: 150,
        }),
      })

      const data = await response.json()
      description = `AI Damage Assessment:\n${data.choices?.[0]?.message?.content || 'Could not analyze image'}`
    } catch (err) {
      console.log('VLM unavailable, proceeding without analysis')
      description = '[Photo analysis unavailable]'
    }

    setAssessmentText(description)
    syncEmailBody(description, location, nearestPIU, userDescription)
    setStep('edit')
  }

  function sendEmail() {
    const mailto = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    window.location.href = mailto
    setStep('done')
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-black/45 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col gap-5 sidebar-scroll">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold text-white">Report Defect — {nhName}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {step === 'camera' && (
            <div className="flex flex-col gap-5">
              {!hasSelectedRoad && (
                <p className="text-xs text-amber-300/90 text-center bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2">
                  Tip: click a road segment first to auto-fill location
                </p>
              )}
              <p className="text-sm text-white/80 text-center">
                Take a photo of the road defect
              </p>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={userDescription}
                  onChange={e => handleDescriptionChange(e.target.value)}
                  placeholder="Describe the issue in detail — size, severity, exact location, hazard level..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current.click()}
                className={`${submitClass} active:scale-95`}
              >
                <Camera size={18} strokeWidth={2} />
                Open Camera
              </button>
            </div>
        )}

        {step === 'analyzing' && (
            <div className="flex flex-col gap-5 text-center py-2">
              {photoURL && (
                <img
                  src={photoURL}
                  alt="Defect"
                  className="w-full rounded-lg mb-4 border border-white/15"
                />
              )}
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Loader2 size={18} className="animate-spin" />
                <p className="text-sm">{vlmStatus}</p>
              </div>
            </div>
        )}

        {step === 'edit' && (
            <div className="flex flex-col gap-5">
              {photoURL && (
                <img
                  src={photoURL}
                  alt="Defect"
                  className="w-full rounded-lg border border-white/15"
                />
              )}

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={userDescription}
                  onChange={e => handleDescriptionChange(e.target.value)}
                  placeholder="Describe the issue in detail — size, severity, exact location, hazard level..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>To</label>
                <input
                  value={email.to}
                  onChange={e => setEmail(p => ({ ...p, to: e.target.value }))}
                  placeholder="PIU email address"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Subject</label>
                <input
                  value={email.subject}
                  onChange={e => setEmail(p => ({ ...p, subject: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Body</label>
                <textarea
                  value={email.body}
                  onChange={e => setEmail(p => ({ ...p, body: e.target.value }))}
                  rows={10}
                  className={`${inputClass} font-mono resize-none`}
                />
              </div>
              <button onClick={sendEmail} className={submitClass}>
                <Mail size={18} strokeWidth={2} />
                Open in Email App
              </button>
            </div>
        )}

        {step === 'done' && (
            <div className="flex flex-col gap-5 text-center py-2">
              <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
              <p className="text-sm text-white/80">
                Email app opened with report pre-filled.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2 text-sm text-white/50 hover:text-white bg-white/8 border border-white/15 rounded-lg transition-all duration-150 backdrop-blur-sm"
              >
                Close
              </button>
            </div>
        )}
      </div>
    </div>
  )
}
