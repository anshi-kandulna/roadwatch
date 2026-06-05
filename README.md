# RoadWatch

AI-powered National Highway monitoring platform for India — built to surface road defects, track MoRTH project progress, and enable direct reporting to the nearest Project Implementation Unit (PIU).

---

## Features

- **Interactive NH Map** — Click any road segment to view active projects, completion progress, and current status
- **AI Damage Assessment** — Capture a photo of a road defect and receive an automated VLM-powered damage analysis
- **Direct Email Reporting** — Pre-addressed defect report sent to the nearest PIU office, auto-filled from GPS and AI analysis
- **AI Chat Assistant** — Ask questions about road conditions, projects, or defects via the built-in chatbot
- **Segment Search** — Search across 1,400+ NH segments by name or project
- **Responsive Design** — Optimised for both mobile and desktop
- **PWA Support** — Installable as a Progressive Web App

---

## Project Structure

```
roadwatch/
├── frontend/               # React + Vite web app
│   ├── src/
│   │   ├── App.jsx         # Root component, state management
│   │   ├── Map.jsx         # Leaflet map, GeoJSON layer, segment selection
│   │   ├── Sidebar.jsx     # Road segment detail panel
│   │   ├── DefectModal.jsx # Photo capture, VLM analysis, email report
│   │   ├── components/
│   │   │   ├── ChatBot.jsx       # Floating AI chat assistant
│   │   │   ├── MapControls.jsx   # Zoom, locate, layer toggle
│   │   │   ├── MenuDrawer.jsx    # Slide-out menu with About panel
│   │   │   ├── SearchBar.jsx     # Road segment search
│   │   │   └── TopBar.jsx        # App header bar
│   │   └── utils.js        # Shared helpers (colours, search, date)
│   ├── .env                # API keys (not committed)
│   └── package.json
├── emails.py               # PIU email data processing
├── enrich.py               # GeoJSON enrichment with project data
├── fetch_nh_geometry.py    # NH geometry fetching pipeline
├── match.py / match2.py    # Project-to-segment matching
└── pyproject.toml          # Python tooling config
```

---

## Setup and Running Locally

### Prerequisites

- Node.js v18 or later
- npm v9 or later (bundled with Node.js)
- A Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/anshi-kandulna/roadwatch.git
cd roadwatch
```

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `frontend/` directory:

```bash
touch frontend/.env
```

Add the following line:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Key Configuration

| Variable | Purpose | Source |
|---|---|---|
| `VITE_GROQ_API_KEY` | Powers the AI chatbot (LLaMA 3.3 70B) and road damage photo analysis (LLaMA 4 Scout VLM) | [console.groq.com](https://console.groq.com) — free tier available |

**How to obtain a Groq API key:**

1. Sign up at [console.groq.com](https://console.groq.com)
2. Navigate to **API Keys** in the left sidebar
3. Click **Create API Key**, assign a name, and copy the generated key
4. Paste the key as the value of `VITE_GROQ_API_KEY` in `frontend/.env`

The key is referenced in the app via `import.meta.env.VITE_GROQ_API_KEY` and is excluded from version control via `.gitignore`.

---

## Building for Production

```bash
cd frontend
npm run build
```

The compiled output is written to `frontend/dist/` and can be served from any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Map | Leaflet, OpenStreetMap, Esri World Imagery |
| Styling | Tailwind CSS v4 |
| AI Inference | Groq API — LLaMA 3.3 70B, LLaMA 4 Scout VLM |
| Icons | Lucide React |
| Typeface | Inter (Fontsource) |
| PWA | vite-plugin-pwa |

---

## Defect Reporting Flow

1. Click the **Report Road Issue** button at the bottom of the screen
2. Capture or upload a photo of the defect
3. The image is submitted to the Groq VLM, which generates a structured damage description
4. The device GPS location is used to identify the nearest PIU office
5. A pre-filled email draft is opened in the system mail client, addressed to the relevant office

---

## Data Sources

- **NH GeoJSON** — National Highway corridor geometries, fetched via `fetch_nh_geometry.py`
- **Project data** — MoRTH project records, enriched via `enrich.py` and matched to segments via `match.py`
- **PIU contacts** — Project Implementation Unit office email addresses, compiled in `emails.py`
