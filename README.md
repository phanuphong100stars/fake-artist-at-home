# 🎨 จิตรกรตัวปลอม — Fake Artist

เกมปาร์ตี้แนว **Hidden Role + Drawing** เล่นด้วยมือถือเครื่องเดียว (Pass & Play) ภาษาไทย 100%

จิตรกรทุกคนได้ **คำจริง** เดียวกัน แต่มี **ตัวปลอม** แอบปนอยู่ ได้ **คำหลอกที่คล้ายกัน** ผลัดกันวาดคนละเส้นบนภาพเดียวกัน แล้วช่วยกันจับว่าใครคือตัวปลอม

> ตัวอย่าง: คำจริง = **แมว** · คำหลอก = **เสือ** — ตัวปลอมต้องวาดให้เนียนโดยไม่รู้คำจริง

---

## ✨ Features

- **Hidden role + word-cluster** — ตัวปลอมได้คำคล้าย ไม่ใช่ไม่รู้คำ ทำให้ภาพเนียนและเกมลึก
- **Pass & Play** — หน้าคั่นส่งเครื่อง + **แตะค้างเพื่อดูบทบาท** (hold-to-peek) กันแอบดู
- **Canvas วาดจริง** — รองรับ touch / mouse / Apple Pencil (แรงกด), เส้นเวกเตอร์ลื่น, undo/clear, โหมดเส้นเดียว
- **Reveal ดราม่า** — เฉลยตัวปลอม + คำจริง/คำหลอก พร้อม **confetti / firework**
- **Replay** — เล่นซ้ำทีละเส้น/ตามเวลา, play/pause, ความเร็ว x1/x2/x4, scrubber
- **Export** — บันทึกภาพวาดเป็น **GIF** และ **วิดีโอ (WebM)**
- **Statistics** — จำนวนเกม, เส้น, ตัวปลอม, ผู้ชนะ, เวลาเล่นรวม
- **Themes & Paper** — สว่าง/มืด/ระบบ + พื้นกระดาษ 6 แบบ (ขาว/ตาราง/สมุด/จุด/ดำ/คราฟท์)
- **Sound & Haptic** — เสียงสังเคราะห์ WebAudio + สั่น
- **PWA** — ติดตั้งลงจอโฮม, ทำงาน **offline**, ไอคอน + splash
- **Accessibility** — ตัวอักษรใหญ่, ลดการเคลื่อนไหว, คอนทราสต์สูง
- **Resume** — ปิดแอปกลางเกมแล้วเปิดใหม่ เล่นต่อได้

---

## 🎮 วิธีเล่น

1. เพิ่มผู้เล่น (3 คนขึ้นไป, แนะนำ 3–12) ตั้งชื่อ + เลือกสี
2. ตั้งค่าเกม: จำนวนตัวปลอม (1–3), โหมดทีม/เดี่ยว, ความยาก, จับเวลา
3. สุ่มบทบาท → ส่งเครื่องเวียนกัน **แตะค้าง** ดูบทบาทของตัวเอง
4. ผลัดกันวาดคนละ 1 เส้น
5. วาดครบ → คุยกันหาตัวปลอม → กด **จบเกม** เพื่อเฉลย
6. บอกแอปว่าใครชนะ → ดูรีเพลย์ / บันทึก GIF / เล่นอีกครั้ง

**เงื่อนไขชนะ (มนุษย์ตัดสิน):** จิตรกรชนะถ้าจับตัวปลอมได้ · ตัวปลอมชนะถ้ารอด

---

## 🛠 Tech Stack

| ด้าน | เลือกใช้ |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| ภาษา | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme`, oklch tokens) |
| State | Zustand (+ persist) |
| Animation | Motion (Framer Motion) |
| Effects | canvas-confetti, gifenc, MediaRecorder |
| Storage | localStorage + idb-keyval |
| PWA | Service worker (cache-first) + Web App Manifest |
| Test | Vitest (domain) + Playwright (visual/e2e) |
| Deploy | Vercel |

---

## 🚀 เริ่มต้น

```bash
npm install
npm run dev        # http://localhost:3000
```

Scripts:

```bash
npm run dev        # dev server
npm run build      # production build
npm start          # serve production build
npm test           # domain unit tests (vitest)
npm run lint       # eslint
```

---

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                 # Next App Router — layout, page, manifest, icons, sw register
├── components/
│   ├── screens/         # 1 ไฟล์ต่อ 1 หน้าจอ (Home, Setup, Draw, Reveal, Replay, ...)
│   ├── game/            # DrawCanvas, StaticCanvas, PlayerLegend
│   ├── common/          # Button, ConfirmDialog, controls
│   └── theme/           # ThemeApplier
├── domain/              # PURE logic (role, word, turn, scoring) — มี unit test
├── stores/              # zustand: game, settings, stats, history
├── data/words/          # word cluster JSON packs + loader
└── lib/                 # utils, colors, sound, haptics, canvas render/replay, export
```

### Architecture

Layered แบบ pragmatic: **UI → Stores → Domain (pure) → Data**
- `domain/` เป็น pure functions ทดสอบง่าย ไม่พึ่ง React
- Game phase เป็น explicit state machine ใน `gameStore`
- เส้นวาดเก็บเป็น **vector** (จุด + timestamp, normalized 0..1) → ใช้ซ้ำได้ทั้งวาดสด / replay / export

---

## 🗂 Word Packs — เพิ่มคำเอง

โครงสร้าง cluster (คำที่วาดออกมาคล้ายกัน):

```json
{ "id": "animal-bigcat", "category": "สัตว์", "difficulty": "medium", "words": ["เสือ", "สิงโต", "เสือดาว"] }
```

- แต่ละ cluster มี 2–4 คำคล้ายกัน · สุ่ม 1 คำ = คำจริง, อีก 1 คำ = คำหลอก
- `difficulty`: `easy` (ต่างชัด) / `medium` (ใกล้มาก)
- เพิ่มไฟล์ pack ใหม่ใน `src/data/words/` แล้ว concat ใน `index.ts`
- ระบบกันซ้ำ: ไม่สุ่ม cluster เดิมในช่วง 10 เกมล่าสุด
- ปัจจุบันมี ~185 clusters ครอบคลุม 20+ หมวด

---

## 📱 PWA / Offline

- ติดตั้งลงจอโฮมได้ทั้ง iPhone / Android / Desktop
- Service worker แคชแบบ cache-first → หลังเปิดครั้งแรกเล่น offline ได้
- ไอคอน maskable + apple-touch + manifest ครบ

---

## 🧪 Testing

- **Domain**: `npm test` — logic การสุ่มบทบาท, คำ (anti-repeat), การตัดสิน, ความถูกต้องของ word DB
- **Visual/e2e**: สคริปต์ Playwright ใน `tests/visual/` จับ layout overflow + ตรวจทุกหน้าจอ (mobile-first 390px)

---

## ☁️ Deploy (Vercel)

push ขึ้น GitHub แล้ว import ที่ [vercel.com](https://vercel.com) — zero config

---

## 📄 License

ส่วนตัว / เพื่อการเรียนรู้
