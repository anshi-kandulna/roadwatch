export default function Sidebar({ data, onClose }) {
  if (!data) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '360px',
      height: '100vh',
      background: 'white',
      zIndex: 9999,
      overflowY: 'auto',
      padding: '1rem',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>{data.Name}</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
      </div>

      <p style={{ color: '#666', fontSize: '14px', marginTop: 0 }}>{data.projects?.length} projects</p>

      {data.projects?.map((proj, i) => (
        <div key={i} style={{
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: '14px' }}>{proj.project_name}</p>
          <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>
            {proj.start_date} → {proj.end_date}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>
            ₹{proj.sanctioned_amt_cr} Cr | {proj.physical_progress_pct}% done
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>
            {proj.state} | {proj.work_type}
          </p>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>
            PIU: {proj.piu_city} | RO: {proj.ro_name}
          </p>
        </div>
      ))}
    </div>
  )
}