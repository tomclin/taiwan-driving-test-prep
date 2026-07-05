# 汽車駕照筆試通 2026 · Taiwan Car Written-Test Prep PWA

A mobile-first, installable PWA for practising Taiwan's **2026 car driving written test** (公路局新制：全 50 題選擇題，含危險感知／情境題). No login, no server — all progress is stored locally on the device.

Built with **Vite + React + TypeScript + Tailwind CSS**. Deployable to Vercel or GitHub Pages as a static site.

**中文文件：** [設計說明](docs/DESIGN-zh-TW.md) · [使用手冊](docs/USER-GUIDE-zh-TW.md)　|　**Live:** https://tomclin.github.io/taiwan-driving-test-prep/

---

## About the question bank

This project ships with the **official Highway Bureau car test bank — 1,090 questions (公路局 115.06.09 版, 2026 新制)** as the built-in default (`src/data/sampleQuestions.json`). A fresh install loads it automatically; no manual import needed.

Category breakdown (official 7 buckets folded into the app's 4):

| App category | Count | Official source buckets |
|---|---|---|
| 交通標誌 `signs` | 154 | traffic_sign, road_marking |
| 交通規則 `rules` | 804 | traffic_rule, penalty_or_violation, vehicle_knowledge |
| 情境／防禦駕駛 `situational` | 65 | defensive_driving |
| 危險感知 `hazard` | 67 | situational_judgment |

**Sign images:** All 101 image-dependent questions have their official sign graphics extracted from the source PDF into `public/signs/` (`car_XXXX.png`), at the source's native ~187 px. All are live.
- **95 image-stem** items (the sign *is* the question) show it via an `image` field.
- **6 image-option** items (car_0183, 0185, 0233, 0523, 0723, 1004) render their three choices as sign images via `optionImages` (`car_XXXX_opt1/2/3.png`, left→right = 選項 (1)(2)(3)). `QuestionCard` renders picture-options.
- Live bank = **1,090**. **~790 questions have no explanation** in the official export; those show the correct answer with no 解析.

To refresh from a newer official release, download from the Highway Bureau, convert to the `questions.json` format below, and import via **更多 → 匯入題庫** — your practice progress is **not** erased.

- 汽車題庫下載頁：<https://www.thb.gov.tw/News_Download.aspx?n=284&sms=12823>
- 線上模擬考系統：<https://www.mvdis.gov.tw/m3-simulator-drv/index>

---

## Features

| Feature | Where |
|---|---|
| Import `questions.json` (replace or merge) | 更多 → 匯入題庫 |
| Keyword search (question / options / explanation / topic) | 更多 → 搜尋題庫 |
| Practice by category — 標誌 / 規則 / 情境防禦 / 危險感知 / 錯題 / 待複習 | 練習 |
| Mock exam — 50 random Q's, ~20% hazard-perception, scored, records wrong + uncertain | 模擬考 |
| Wrong-question notebook with **spaced repetition** (same day → +1 → +3 → +7 days) | 錯題本 |
| Daily dashboard — days to exam, today's target, coverage, recent scores, due reviews | 首頁 |
| Parent view — coverage, 7-day activity, per-category accuracy, weakest areas, scores | 更多 → 家長檢視 |
| Local storage only (localStorage), offline-capable, installable PWA | everywhere |

Options are **shuffled per question** so the answer is never in a fixed slot. During a mock exam, answers stay hidden until you submit (交卷).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the built app
npm run typecheck  # optional: TypeScript check
```

Open on a phone (or Chrome mobile emulation) and **Add to Home Screen** to install it as an app.

---

## File structure

```
taiwan-driving-test-prep/
├── index.html
├── vite.config.ts            # base:'./' + vite-plugin-pwa (manifest + service worker)
├── tailwind.config.js
├── public/
│   ├── icon.svg              # app icon (replace with your own PNGs if desired)
│   ├── signs/                # 157 official graphics (139 question-stem figures + 18 option signs), by id
│   └── questions.json        # full 1,090-item record (format reference / import demo)
└── src/
    ├── main.tsx              # HashRouter entry (GitHub-Pages friendly)
    ├── App.tsx               # layout + bottom nav + routes
    ├── types.ts             # Question / Progress / MockResult / Settings
    ├── data/sampleQuestions.json   # bundled seed bank (1,090 official questions)
    ├── lib/
    │   ├── bank.ts          # categories, search, shuffle, buildMock (20% hazard)
    │   ├── srs.ts           # spaced-repetition scheduling
    │   ├── stats.ts         # coverage, per-category accuracy, weakest areas
    │   ├── importer.ts      # questions.json parsing + validation
    │   └── date.ts          # day math / exam countdown
    ├── store/useStore.ts    # zustand store, persisted to localStorage
    ├── components/
    │   ├── QuestionCard.tsx # the one card used in practice / exam / review
    │   └── ui.tsx           # small shared UI pieces
    └── pages/               # Dashboard, Practice, MockExam, Notebook,
                             # Search, ParentView, ImportPage, Settings, More
```

---

## Data model (`questions.json`)

Import a **JSON array** of questions (or an object with a `questions` array):

```json
[
  {
    "id": "sign-001",
    "category": "signs",
    "topic": "號誌",
    "question": "紅色八角形的「停車再開」標誌，駕駛人應如何處理？",
    "options": ["遇有來車或行人時才需停車", "一律先停車，確認左右安全後再前進", "減速慢行通過即可"],
    "answer": 1,
    "explanation": "八角形紅底白字的「停」標誌，要求車輛必須完全停止…",
    "source": "公路局 114 年版",
    "image": "https://…/sign.png",
    "video": "https://…/hazard-clip.mp4"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique. Auto-generated if missing. |
| `category` | `"signs"` \| `"rules"` \| `"situational"` \| `"hazard"` | 標誌／規則／情境防禦／危險感知. Unknown → `rules`. |
| `topic` | string | Free-text sub-topic (optional). |
| `question` | string | **Required.** |
| `options` | string[] | **Required**, ≥2 options. |
| `answer` | number | **Required.** 0-based index into `options`. |
| `explanation` | string | Optional, shown after answering. |
| `source` | string | Optional. |
| `image` / `video` | string (URL) | Optional media — used for hazard-perception clips/pictures. |

**Progress fields** from the brief — `mistake_count`, `confidence`, `last_seen`, `next_review` — are **per-learner state**, not part of the shared question file. They live in `localStorage` (see `Progress` in `src/types.ts`) so the same `questions.json` can be shared between people without leaking anyone's answers.

### Spaced repetition
A question enters the notebook the first time it's answered wrong. On each subsequent **correct** review it advances through the intervals **same day → +1 day → +3 days → +7 days**, then graduates. Any **wrong** answer resets it to "due today". The 錯題本 tab surfaces everything currently due.

---

## Deploy

### Vercel
Import the repo (or `vercel` CLI). Framework preset **Vite**; build `npm run build`; output `dist`. `base: './'` means it works at the domain root with no extra config.

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist        # or push dist/ to the gh-pages branch
```
`base: './'` + HashRouter means it also works under `https://<user>.github.io/<repo>/` with no rewrites. (For a project page, no `vite.config` change is needed thanks to relative asset paths.)

---

## Privacy
No accounts, no analytics, no network calls after load. Everything (question bank + progress) is stored in the browser's `localStorage` on the device. Clearing site data or using **設定 → 重設全部** wipes it.
