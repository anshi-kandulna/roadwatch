# 🛣️ RoadWatch

> AI-powered National Highway monitoring platform for India — built to surface road defects, track MoRTH project progress, and let anyone report issues directly to the nearest PIU office.

---

## ✨ Features

- **Interactive NH Map** — Click any road segment to see active projects, progress, and status
- **AI Damage Assessment** — Take a photo of a road defect and get an instant VLM-powered damage report
- **One-tap Email Report** — Auto-fills a pre-addressed email to the nearest Project Implementation Unit (PIU)
- **RoadWatch AI Chatbot** — Ask anything about road conditions, projects, or defects
- **Search** — Fuzzy search across all 1,400+ NH segments by name or project
- **Responsive** — Works on mobile and desktop
- **PWA-ready** — Installable as a Progressive Web App

---

## 🗂️ Project Structure

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
│   │   └── utils.js        # Shared helpers (colors, search, date)
│   ├── .env                # API keys (not committed)
│   └── package.json
├── emails.py               # PIU email data processing
├── enrich.py               # GeoJSON enrichment with project data
├── fetch_nh_geometry.py    # NH geometry fetching pipeline
├── match.py / match2.py    # Project-to-segment matching
└── pyproject.toml          # Python tooling config
```

---

## 🚀 Setup & Running Locally

### Prerequisites

- **Node.js** v18+ (check with `node -v`)
- **npm** v9+ (comes with Node)
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/anshi-kandulna/roadwatch.git
cd roadwatch
```

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Add your API key

Create a `.env` file inside the `frontend/` directory:

```bash
touch frontend/.env
```

Add the following line to `frontend/.env`:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> **How to get a Groq API key:**
> 1. Go to [console.groq.com](https://console.groq.com) and sign up (free)
> 2. Navigate to **API Keys** in the sidebar
> 3. Click **Create API Key**, give it a name, and copy it
> 4. Paste it as the value for `VITE_GROQ_API_KEY` in your `.env` file

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔑 API Key Reference

| Variable | Purpose | Where to get it |
|---|---|---|
| `VITE_GROQ_API_KEY` | Powers the AI chatbot (LLaMA 3.3 70B) and road damage photo analysis (LLaMA 4 Scout VLM) | [console.groq.com](https://console.groq.com) — free tier available |

The key is accessed in the frontend via `import.meta.env.VITE_GROQ_API_KEY`. It is **never** committed to Git — `frontend/.env` is listed in `.gitignore`.

---

## 🛠️ Build for Production

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`. Serve it with any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Map | Leaflet + OpenStreetMap / Esri Satellite |
| Styling | Tailwind CSS v4 |
| AI Inference | Groq API (LLaMA 3.3 70B, LLaMA 4 Scout VLM) |
| Icons | Lucide React |
| Font | Inter (Fontsource) |
| PWA | vite-plugin-pwa |

---

## 📍 How Reporting Works

1. Click **"Report Road Issue"** button (bottom-center)
2. Take or upload a photo of the defect
3. The app sends the image to the Groq VLM — it auto-generates a damage description
4. Your GPS location is used to find the **nearest PIU office**
5. A pre-filled email draft is opened in your mail app, addressed directly to the right office

---

## 🗺️ Data Sources

- **NH GeoJSON** — National Highway corridor geometries sourced via `fetch_nh_geometry.py`
- **Project data** — MoRTH project records enriched via `enrich.py` and matched to segments via `match.py`
- **PIU contacts** — Project Implementation Unit office emails compiled in `emails.py`

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
