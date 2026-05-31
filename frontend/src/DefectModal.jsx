import { useState, useRef, useEffect } from 'react'
import { findNearestPIU } from './findNearestPIU'

export default function DefectModal({ nhName, onClose }) {
  const [step, setStep] = useState('camera')
  const [photoURL, setPhotoURL] = useState(null)
  const [vlmStatus, setVlmStatus] = useState('Analyzing damage...')
  const [nearestPIU, setNearestPIU] = useState(null)
  const [location, setLocation] = useState(null)
  const [email, setEmail] = useState({
    to: '',
    subject: `Road Defect Report - ${nhName}`,
    body: ''
  })
  const fileRef = useRef(null)

  function buildBody(description, loc, piu) {
    const locationStr = loc
      ? `GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
      : 'Location unavailable'
    const officeStr = piu
      ? `Nearest Office: ${piu.piu_city} (${piu.ro_name})`
      : 'Nearest Office: Unknown'

    return `Defect Report
═══════════════════════════
NH: ${nhName}
${officeStr}
${locationStr}
Reported at: ${new Date().toLocaleString()}

${description}

═══════════════════════════
Reported via RoadWatch App`
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
          body: buildBody('[Please describe the defect here]', loc, piu)
        }))
      },
      err => {
        console.error('GPS failed:', err)
        setEmail(prev => ({
          ...prev,
          body: buildBody('[Please describe the defect here]', null, null)
        }))
      }
    )
  }, [])

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoURL(URL.createObjectURL(file))
    setStep('analyzing')
    await analyzePhoto(file)
  }

  async function analyzePhoto(file) {
    try {
      setVlmStatus('Analyzing damage...')
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.readAsDataURL(file)
      })

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
              { type: 'text', text: 'Describe the road damage or defect in this image. Be specific about type (pothole, crack, waterlogging etc), location on road, and severity. Keep it under 100 words.' }
            ]
          }],
          max_tokens: 150
        })
      })

      const data = await response.json()
      const description = `AI Damage Assessment:\n${data.choices?.[0]?.message?.content || 'Could not analyze image'}`
      setEmail(prev => ({ ...prev, body: buildBody(description, location, nearestPIU) }))

    } catch (err) {
      console.log('VLM unavailable, proceeding without analysis')
      // body already set from GPS useEffect, just go to edit
    }

    setStep('edit')
  }

  function sendEmail() {
    const mailto = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    window.location.href = mailto
    setStep('done')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '1.5rem', width: '90%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Report Defect — {nhName}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 'camera' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Take a photo of the road defect</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={handlePhoto} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current.click()} style={{
              background: '#e85d04', color: 'white', border: 'none',
              borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '16px', cursor: 'pointer'
            }}>
              📷 Open Camera
            </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div style={{ textAlign: 'center' }}>
            {photoURL && <img src={photoURL} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />}
            <p style={{ color: '#666' }}>{vlmStatus}</p>
            <div style={{ fontSize: '24px' }}>⏳</div>
          </div>
        )}

        {step === 'edit' && (
          <div>
            {photoURL && <img src={photoURL} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>To</label>
              <input value={email.to} onChange={e => setEmail(p => ({ ...p, to: e.target.value }))}
                placeholder="PIU email address"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Subject</label>
              <input value={email.subject} onChange={e => setEmail(p => ({ ...p, subject: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Body</label>
              <textarea value={email.body} onChange={e => setEmail(p => ({ ...p, body: e.target.value }))}
                rows={10} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }} />
            </div>
            <button onClick={sendEmail} style={{
              width: '100%', background: '#e85d04', color: 'white',
              border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '16px', cursor: 'pointer'
            }}>
              📧 Open in Email App
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px' }}>✅</p>
            <p>Email app opened with report pre-filled.</p>
            <button onClick={onClose} style={{ marginTop: '1rem', padding: '0.5rem 2rem', cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}