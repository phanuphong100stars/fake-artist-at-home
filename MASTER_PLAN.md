# Fake Artist — Master Plan

> Party Game แนว Hidden Role + Drawing · Pass & Play · มือถือเครื่องเดียว · ภาษาไทย
> Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · Framer Motion · PWA · Vercel

เอกสารนี้คือแผนพัฒนาระดับ Production ใช้เป็น input ให้ Claude Code ทำงานต่อ **ยังไม่เขียนโค้ด**

---

## 0. TL;DR การตัดสินใจหลัก (Staff Engineer calls)

| เรื่อง | ตัดสินใจ | เหตุผล |
|---|---|---|
| Routing | **1 route + view state machine** (ไม่ใช่หลาย page route) | เกม Pass&Play เป็น session เดียวจบ ไม่ต้อง deep-link แต่ละ phase, state อยู่ใน memory ง่ายกว่า, page transition คุมเองได้เนียนกว่า |
| State | **Zustand + persist middleware** | เบา, ไม่มี boilerplate แบบ Redux, persist ลง localStorage ได้ฟรี. เกมนี้ state ไม่ซับซ้อนพอจะต้องใช้ Redux |
| เก็บ replay/history | **strokes เป็น vector (จุด + timestamp) ไม่ใช่ bitmap** | เปิดทางให้ replay ทีละเส้น + ตามเวลา + export GIF/video โดยไม่ต้องเก็บภาพ. bitmap replay ไม่ได้ |
| History 50 เกม | **IndexedDB ผ่าน `idb-keyval`** | vector data + อาจมี thumbnail โตเกิน localStorage 5MB. idb-keyval = 1 dependency จิ๋ว |
| Canvas | **custom pointer-events layer, requestAnimationFrame** | ต้องการ Apple Pencil pressure + replay control + export. lib วาดสำเร็จรูปคุม data model ไม่ได้ |
| GIF | **`gifenc`** (encode ใน worker) | เร็ว, เล็ก, ไม่มี dependency หนักแบบ gif.js เก่า |
| Video | **`MediaRecorder` + `canvas.captureStream()` → WebM** | native browser API, zero dependency. mp4 ไม่การันตีทุก browser |
| Confetti/Firework | **`canvas-confetti`** | 1 lib จบ, tuning ได้, ไม่ reinvent particle system |
| PWA | **Serwist** (`@serwist/next`) | next-pwa แทบตาย, Serwist คือ successor รองรับ App Router จริง |
| Sound | **Web Audio API + preload ไฟล์สั้น** | Howler เกินจำเป็นสำหรับ SFX ไม่กี่เสียง |

> ponytail: หลายอย่างข้างบนเลือก "native/lib จิ๋ว" แทน framework ใหญ่โดยตั้งใจ อัปเกรดเมื่อเจอเพดานจริงเท่านั้น

---

## 1. วิเคราะห์ Requirement

### เกมคืออะไร (สรุปความเข้าใจ) — กลไก word cluster
เกม "จิตรกรตัวปลอม" — จิตรกร (Normal) ทุกคนได้ **คำจริง** เดียวกัน. **Faker รู้ตัวว่าเป็น Faker** และได้ **คำหลอกที่คล้ายคำจริง** (เช่น จริง="แมว" หลอก="เสือ"). **ไม่แสดงหมวดหมู่**. ผลัดกันวาดคนละเส้นบนภาพเดียวกัน. Faker ต้องเนียนวาดตามคำหลอกให้กลืนกับคนอื่น + จับให้ได้ว่าคำจริงคืออะไร. Normal ต้องวาดให้เพื่อน Normal รู้ว่าตัวเองรู้คำ แต่ไม่ชัดจน Faker เดาคำจริงออก. จบเกมโหวตหา Faker.

> คำหลอกคล้ายคำจริง = ภาพวาดของ Faker จะดู "ใกล้เคียงแต่เพี้ยน" แทนที่จะมั่วสุ่ม → เกมเนียนและลึกกว่าเดิมมาก

### ช่องว่างสำคัญใน requirement เดิม
Requirement ครอบคลุม *กลไก* ดีมาก แต่ **ขาด win condition / การโหวต** — ข้อ Statistics มี Win/Lose แต่ flow ไม่มีขั้นตอนโหวตหรือเงื่อนไขแพ้ชนะ. นี่คือหัวใจเกมที่หายไป (ดูข้อ 3).

### ความตึงของ Pass & Play
มือถือเครื่องเดียวหมุนเวียน = **ความลับรั่วง่าย**. ต้องออกแบบ "pass screen" กันแอบมอง + reveal ที่กดค้าง/ปัดเปิด ไม่ใช่โชว์ค้าง.

---

## 2. Feature ที่ควรเพิ่ม (พร้อมเหตุผล)

| Feature | เหตุผล | Priority |
|---|---|---|
| **ระบบโหวต + Win/Lose logic** | requirement มี Win/Lose ใน stats แต่ไม่มีกลไก. เกมนี้เล่นไม่จบถ้าไม่มีโหวต. **บังคับต้องมี** | P0 |
| **Faker guess คำ (นาทีสุดท้าย)** | กติกาต้นฉบับ: ถ้าโดนจับได้ Faker เดาคำถูก = Faker ชนะ. เพิ่มความลึก | P1 |
| **Pass-screen กันแอบมอง** | หน้าคั่น "ส่งเครื่องให้ [ชื่อ]" กดค้างเพื่อดู role/วาด. กันคนถัดไปเห็น | P0 |
| **Hold-to-reveal role** | reveal role ด้วยการกดค้าง/ปัด ปล่อยแล้วปิด แทนโชว์ค้าง = ลดรั่ว | P0 |
| **Faker team/solo mode** | เคาะแล้ว: Faker หลายคน**รู้จักกัน**, win เลือกได้ทีม/เดี่ยว (setting) | P1 |
| **Word cluster (คำหลอกคล้ายกัน)** | เคาะแล้ว: Normal ได้คำจริง, Faker ได้คำหลอกคล้ายกัน, **ไม่โชว์หมวด**. หัวใจกลไกใหม่ | P0 |
| **Round system** | (optional อนาคต) เล่นหลายรอบสะสมแต้ม. **default = 1 รอบ** | P2 |
| **Sudden death / tie-break โหวต** | โหวตเสมอ ต้องมีทางออก | P1 |
| **Skip/Redraw ในเทิร์นตัวเอง (ก่อนปล่อยเส้น)** | กันลากพลาด ก่อน commit | P1 |
| **Haptic + Sound feedback** | มีใน settings แล้ว — ยกให้เป็น first-class ทุก interaction | P1 |
| **Onboarding / How-to-play 3 การ์ด** | ผู้เล่นใหม่ไม่เข้าใจกติกา hidden role | P1 |
| **Resume game (กันปิดแอปกลางเกม)** | persist state + "เล่นต่อ?" dialog ตอนเปิดใหม่ | P1 |
| **Share ผลเกม (image)** | export ภาพวาด + เฉลย เป็นรูปแชร์ social | P2 |
| **Word Pack เพิ่มเติม / custom words** | requirement บอกรองรับ word pack — เปิดช่องผู้ใช้เพิ่มคำเอง | P2 |
| **Spectator reveal ตอนจบ** | โชว์ว่าใครวาดเส้นไหน (สีต่อคน) ตอน reveal | P1 |

---

## 3. Requirement ที่ตกหล่น (ต้องเติมก่อนเริ่ม)

1. **Win condition** — เกมชนะเมื่อไหร่? ข้อเสนอ:
   - Normal ชนะ: โหวตจับ Faker ถูก (เสียงข้างมาก) **และ** Faker เดา**คำจริง**ไม่ถูก
   - Faker ชนะ: ไม่โดนจับ **หรือ** โดนจับแต่เดาคำจริงถูก (Faker มีคำหลอกใกล้เคียง จึงเดาได้ลุ้น)
2. **ขั้นตอนโหวต** — flow เดิมข้าม. ต้องแทรกหลัง "ทุกคนวาดครบ" ก่อน Reveal
3. **Faker หลายคน (1-3)** — ✓ เคาะ: **รู้จักกัน** (เห็นกันตอน role reveal), win **เลือกได้ทีม/เดี่ยว** (teamMode setting). ทีม: Faker ชนะ/แพ้พร้อมกัน. เดี่ยว: ตัดสินรายคน. **clamp**: Faker ≤ n-2 (เหลือคนปกติ ≥2)
4. **จำนวนเทิร์นต่อคน** — ✓ เคาะ: **1 รอบ** (แต่ละคนวาด 1 เส้น จบ). ตัด rounds setting ออกจาก P0
5. **Timer** — ✓ เคาะ: **ไม่ auto-commit** ผู้เล่นกด "เสร็จ" เองเสมอ. Timer = visual/แรงกดดันเท่านั้น หมดเวลาแค่โชว์ ไม่จบเทิร์นให้
6. **ปุ่ม Undo/Clear ตอน single-stroke=true** — undo ได้แค่เส้นตัวเองในเทิร์น, clear เฉพาะเส้นที่ยังไม่ commit
7. **Player ขั้นต่ำ 3** แต่ Faker 3 คน + player 3 = ไม่มีคนปกติ. ต้อง **clamp**: Faker ≤ floor((n-1)/2) หรืออย่างน้อยเหลือคนปกติ 2 คน
8. **ชื่อซ้ำ / ชื่อว่าง** — validation
9. **สีชนกัน** — กันเลือกสีซ้ำ หรือเตือน
10. **Locale/ตัวเลข** — ภาษาไทยล้วน, font ไทยสวย (LINE Seed / IBM Plex Thai / Noto Sans Thai)

---

## 4. UX ที่ดีกว่าเดิม

- **Pass-and-Play handoff pattern**: หน้าคั่นเต็มจอ สีประจำตัวผู้เล่นถัดไป + ชื่อใหญ่ + "แตะค้างเมื่อพร้อม" กัน reveal โดยไม่ตั้งใจ
- **Reveal role = hold-to-peek**: กดค้างเห็นคำ ปล่อย = เบลอ/ปิด. มี countdown เล็ก ๆ ป้องกันโชว์นานเกิน
- **Progress ที่รู้สึกได้**: dot ต่อผู้เล่น เปลี่ยนสีเมื่อผ่าน + haptic ตอนเปลี่ยนเทิร์น
- **Live turn indicator**: ระหว่างวาด โชว์ชื่อ+สีคนวาดอยู่ ชัดเจน ไม่ต้องเดา
- **จบเกมแบบ dramatic**: reveal Faker ด้วย card flip + suspense pause + confetti/firework ตามผล
- **Empty/Loading states** ทุกหน้า, skeleton ตอนโหลด word/history
- **One-hand reachable**: ปุ่มหลักอยู่ครึ่งล่างจอ (มือถือถือมือเดียว)
- **Undo ใหญ่กดง่าย**, ปุ่ม destructive (clear) ต้อง confirm
- **Confirm dialog "จบเกม"** — กันกดพลาดกลางเกม (มีใน req แล้ว ✓)
- **Accessibility**: reduce-motion ปิด particle, color-blind ใช้ pattern เสริมสี, large font scale

---

## 5. Architecture

**Clean-ish layered (pragmatic, ไม่ over-engineer)**

```
UI (React components / shadcn)          ← เห็น, กด
  ↓ อ่าน/สั่ง
State (Zustand stores)                  ← game machine, settings, stats
  ↓ เรียก
Domain (pure TS: game rules, role, win) ← ทดสอบได้ ไม่พึ่ง React
  ↓ ใช้
Data (word db JSON, IndexedDB repo)     ← persistence
```

หลักการ:
- **Domain layer เป็น pure functions** — สุ่ม role, ตัดสิน win, สุ่มคำไม่ซ้ำ, สุ่มลำดับเทิร์น. ทดสอบด้วย unit test ง่าย ไม่ต้อง render
- **State machine ชัดเจน** สำหรับ game phase (ดูข้อ 7)
- **Repository pattern บาง ๆ** สำหรับ history/stats (สลับ storage backend ได้ถ้าอนาคตทำ multiplayer)
- **ไม่มี backend** — ทุกอย่าง client-side, offline-first
- ponytail: ไม่ทำ interface/DI container. layer = การจัดโฟลเดอร์ + pure function ไม่ใช่ abstraction เกินจำเป็น

---

## 6. Folder Structure

```
fake-artist/
├── app/
│   ├── layout.tsx              # root, font, theme provider, PWA meta
│   ├── page.tsx                # single entry — mount <GameShell/>
│   ├── manifest.ts             # PWA manifest
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn generated
│   │   ├── screens/            # 1 ไฟล์ต่อ phase
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── PlayerSetupScreen.tsx
│   │   │   ├── GameSettingScreen.tsx
│   │   │   ├── RoleRevealScreen.tsx      # pass + reveal + hide
│   │   │   ├── DrawScreen.tsx
│   │   │   ├── VotingScreen.tsx
│   │   │   ├── RevealScreen.tsx
│   │   │   ├── ReplayScreen.tsx
│   │   │   └── StatisticsScreen.tsx
│   │   ├── game/
│   │   │   ├── Canvas/                    # วาด + replay renderer
│   │   │   ├── PassScreen.tsx             # handoff กันแอบมอง
│   │   │   ├── TurnProgress.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── BrushControls.tsx
│   │   │   └── PlayerBadge.tsx
│   │   ├── motion/             # reusable animation wrappers
│   │   │   ├── PageTransition.tsx
│   │   │   ├── CardFlip.tsx
│   │   │   ├── Ripple.tsx
│   │   │   ├── Confetti.tsx
│   │   │   └── Glow.tsx
│   │   └── common/             # Button, Dialog wrappers, PaperBackground
│   ├── domain/                 # PURE — no React
│   │   ├── role.ts             # assignRoles(players, fakerCount)
│   │   ├── word.ts             # pickWord(history, difficulty)
│   │   ├── turn.ts             # turnOrder, nextTurn
│   │   ├── scoring.ts          # resolveWin(votes, faker, guess)
│   │   └── types.ts
│   ├── stores/
│   │   ├── gameStore.ts        # phase machine + game state
│   │   ├── settingsStore.ts    # persisted settings
│   │   └── statsStore.ts       # persisted lifetime stats
│   ├── data/
│   │   ├── words/              # word packs JSON (แยกไฟล์ต่อ pack)
│   │   │   ├── core-th.json
│   │   │   └── index.ts        # loader + type
│   │   └── repository/
│   │       ├── historyRepo.ts  # idb-keyval, cap 50
│   │       └── statsRepo.ts
│   ├── lib/
│   │   ├── export/             # gif.ts (worker), video.ts (MediaRecorder)
│   │   ├── canvas/             # stroke model, drawStroke, hitTest
│   │   ├── haptics.ts
│   │   ├── sound.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── usePointerDraw.ts
│       ├── useTimer.ts
│       ├── useReplay.ts
│       └── useTheme.ts
├── public/
│   ├── icons/                  # PWA icons (maskable + apple)
│   ├── sounds/
│   └── sw.js                   # generated by Serwist
├── workers/
│   └── gif.worker.ts
├── tests/                      # domain unit tests
├── PLAN todo files...
└── README.md
```

---

## 7. State Management

**Game phase = explicit state machine** (union type, ไม่ใช่ boolean flags กระจัดกระจาย)

```ts
type Phase =
  | 'home' | 'playerSetup' | 'gameSetting'
  | 'roleReveal'   // sub: passing | revealing | hidden
  | 'draw'         // sub: passing | drawing
  | 'voting'
  | 'fakerGuess'   // ถ้าโดนจับ
  | 'reveal'
  | 'replay' | 'statistics'
```

**3 stores (Zustand):**

1. **gameStore** (ephemeral, persist ชั่วคราวกัน crash) — phase, players[], word, roles map, strokes[], currentTurnIndex, votes, timer state. มี actions: `start()`, `nextTurn()`, `commitStroke()`, `castVote()`, `resolve()`
2. **settingsStore** (persist localStorage) — theme, timer config, brush, strokeLimit, difficulty, fakerCount, sound, haptic, animationSpeed, a11y flags, paperBackground
3. **statsStore** (persist localStorage/IDB) — lifetime: games, strokes, timesFaker, wins, losses, playTime

History (50 เกม, vector) → **IndexedDB repo แยก** ไม่ยัดใน store (ใหญ่)

---

## 8. Data Flow

```
Setup → domain.assignRoles() + domain.pickCluster() → สุ่มคำจริง+คำหลอก → gameStore
RoleReveal → อ่าน role+คำ ต่อ player (pass-gated)   → Normal เห็นคำจริง / Faker เห็นคำหลอก+"คุณคือตัวปลอม" → mark seen → ครบ → draw
Draw → usePointerDraw จับ points → commitStroke() → strokes[] (vector + playerId + t)
        nextTurn() วนจน turns ครบ                  → voting
Voting → castVote() ต่อคน (pass-gated)            → resolveWin() → reveal
Reveal → domain.scoring ตัดสิน → confetti/firework → statsStore.record() + historyRepo.save()
Replay → useReplay อ่าน strokes[] เล่นตาม t/step  → export GIF/video จาก renderer เดียวกัน
```

**จุดสำคัญ**: stroke เก็บ `{ playerId, color, size, points:[{x,y,pressure,t}], committedAt }`. renderer เดียวใช้ได้ทั้ง live-draw, replay, และ export → DRY

---

## 9. Component Inventory (หลัก)

**Screens (10)**: Home, PlayerSetup, GameSetting, RoleReveal, Draw, Voting, FakerGuess, Reveal, Replay, Statistics

**Game (8)**: Canvas, PassScreen, TurnProgress, Timer, BrushControls (size/undo/clear), PlayerBadge, VoteCard, ResultCard

**Motion (7)**: PageTransition, CardFlip, Ripple, ConfettiLayer, FireworkLayer, GlowWrap, SpringPresets (shared config)

**Common (8)**: AppButton (ripple+haptic), ConfirmDialog, PaperBackground (6 แบบ), ThemeToggle, PlayerColorPicker, Stepper (player count), SegmentedControl, Sheet/Drawer

**Providers**: ThemeProvider, MotionConfigProvider (reduce-motion + speed), SoundProvider

---

## 10-11. Todo แตกเป็น Phase (หยิบไป implement ได้ทันที)

### Phase 0 — Foundation (P0)
- [ ] init Next.js 15 App Router + TS strict + Tailwind
- [ ] ติดตั้ง shadcn/ui, Framer Motion, zustand, idb-keyval, canvas-confetti, gifenc, @serwist/next
- [ ] font ไทย (LINE Seed / Noto Sans Thai) + tailwind config
- [ ] design tokens: สี, spacing, radius, shadow, motion durations (ตาม Linear/Arc/Raycast)
- [ ] theme provider (dark/light/system) + CSS vars
- [ ] `domain/types.ts` — Player, Role, Stroke, GameState, Settings, Word
- [ ] โครง folder ตามข้อ 6

### Phase 1 — Core Game Loop (P0) — เล่นจบเกมได้แบบไม่มีลูกเล่น
- [ ] `domain/role.ts` assignRoles + clamp faker (≤n-2) + faker เห็นกัน + unit test
- [ ] `domain/word.ts` pickCluster ไม่ซ้ำ (อ่าน history) + สุ่มคำจริง/คำหลอกจาก cluster + unit test
- [ ] `domain/turn.ts` สุ่มคนเริ่ม + วนลำดับ + unit test
- [ ] `domain/scoring.ts` resolveWin (vote majority + faker guess + teamMode ทีม/เดี่ยว) + unit test
- [ ] gameStore state machine + actions
- [ ] HomeScreen (minimal)
- [ ] PlayerSetupScreen — add/remove, ชื่อ, สี default สุ่ม, validation ชื่อว่าง/ซ้ำ/สีซ้ำ
- [ ] GameSettingScreen — faker count (clamp ≤n-2), teamMode (ทีม/เดี่ยว), difficulty, timer on/off
- [ ] RoleRevealScreen + PassScreen + hold-to-reveal
- [ ] DrawScreen + Canvas (วาดได้ commit ได้) + TurnProgress
- [ ] VotingScreen (pass-gated vote)
- [ ] RevealScreen (เฉลย + ตัดสิน)
- [ ] StatisticsScreen (สรุปเกมนี้) + Play Again
- [ ] Confirm dialog "จบเกม"
> milestone: เล่นจบ 1 เกมได้ end-to-end

### Phase 2 — Canvas & Draw ครบ (P0/P1)
- [ ] `usePointerDraw` — touch/mouse/Apple Pencil (pressure via PointerEvent)
- [ ] stroke vector model + renderer (rAF, DPR-aware)
- [ ] Brush size + preview
- [ ] Undo (เส้นตัวเองในเทิร์น) + Clear (confirm)
- [ ] Single-stroke mode (true/false)
- [ ] Timer component + config (10/20/30/45/60/90/120) — visual only, **ไม่ auto-commit** (ผู้เล่นกดเสร็จเอง)
- [ ] Paper backgrounds ×6 (white/grid/notebook/dot/black/kraft)
- [ ] Canvas optimization (offscreen layer, ไม่ re-render ทั้งจอต่อจุด)

### Phase 3 — Motion & Polish (P1)
- [ ] PageTransition (spring, ทุก phase)
- [ ] CardFlip (role reveal + faker reveal)
- [ ] Ripple บนปุ่ม + micro-interactions
- [ ] Glow / fade / spring presets shared
- [ ] Confetti (คนปกติชนะ) + Firework (drama reveal)
- [ ] Particle layer + reduce-motion guard
- [ ] Sound (Web Audio) + Haptic (Vibration API) ทุก interaction
- [ ] animation speed setting เชื่อม MotionConfig

### Phase 4 — Persistence & Stats (P1)
- [ ] settingsStore persist
- [ ] statsStore persist (games/strokes/faker/win/lose/playtime)
- [ ] historyRepo IndexedDB cap 50 (FIFO)
- [ ] Resume game (persist gameStore + "เล่นต่อ?" dialog)
- [ ] StatisticsScreen เต็ม (lifetime + charts เบา ๆ)

### Phase 5 — Replay & Export (P2)
- [ ] useReplay — เล่นทีละเส้น / ตามเวลา, pause/play, speed x1/x2/x4
- [ ] ReplayScreen UI + timeline scrubber
- [ ] spectator reveal (สีต่อคน + ใครวาดเส้นไหน)
- [ ] Export GIF (gifenc ใน worker) + progress
- [ ] Export Video (MediaRecorder → WebM) + progress
- [ ] Share ภาพผลเกม

### Phase 6 — PWA & A11y & Perf (P1/P2)
- [ ] Serwist SW + offline (precache app shell + word db)
- [ ] manifest + icons (maskable, apple-touch, favicon) + splash
- [ ] Add to Home Screen prompt (custom, ไม่รบกวน)
- [ ] Offline fallback UI
- [ ] A11y: large font, reduce-motion, color-blind pattern, high-contrast
- [ ] Perf: dynamic import replay/export, lazy word packs, memo canvas
- [ ] Lighthouse ≥ 90 ทุกหมวด บนมือถือ

### Phase 7 — Content & Ship (P1)
- [ ] Word DB 1500 คำ (ดูข้อ 20) + schema validation script
- [ ] Word pack loader + custom words
- [ ] Onboarding / how-to-play cards
- [ ] README ครบ (setup, arch, gameplay, contributing, add word pack)
- [ ] QA pass ทุก device (iPhone Safari, Android Chrome, Desktop)
- [ ] Deploy Vercel + preview

---

## 12. Priority

| Priority | คือ | Phase |
|---|---|---|
| **P0** must-have เล่นได้จริง | foundation + core loop + canvas + PWA พื้นฐาน | 0,1,2 |
| **P1** premium feel + retention | motion, sound/haptic, stats, resume, a11y, content | 3,4,6,7 |
| **P2** ว้าว + shareable | replay, export GIF/video, share, rounds, word pack UI | 5 |

ลำดับส่ง: **Phase 0→1→2** (playable) → **3** (premium feel, นี่คือ differentiator) → **4,6,7** → **5**.

---

## 13. ความเสี่ยง

| ความเสี่ยง | ผลกระทบ | บรรเทา |
|---|---|---|
| Export GIF/video บนมือถือช้า/หน่วง memory | ฟีเจอร์ว้าวพัง | encode ใน worker, cap resolution/fps, progress UI, ทำ P2 หลังสุด |
| iOS Safari PWA จำกัด (SW, storage, no vibrate) | offline/haptic ไม่ครบ | ทดสอบ iOS จริงเร็ว, feature-detect, graceful degrade |
| Apple Pencil pressure ไม่รองรับทุก browser | brush ไม่ไล่น้ำหนัก | PointerEvent.pressure fallback = ค่าคงที่ |
| ความลับรั่วจาก Pass&Play | เกมพัง | pass-screen + hold-to-reveal บังคับ (P0) |
| 60fps บน canvas มือถือเก่า | กระตุก | เก็บ committed strokes เป็น bitmap layer, วาดสดแค่ current stroke |
| Word DB 1500 คำคุณภาพ/ลิขสิทธิ์ | เกมน่าเบื่อ/กำกวม | gen + human review, ทีละหมวด, schema validate |
| Scope ใหญ่ (ทุก feature) | ไม่จบ | ยึด priority, P2 optional, ship playable ก่อน |

---

## 14. Performance

- **Canvas**: 2 layer — committed (bitmap cache) + active stroke (vector, rAF). ไม่ redraw ทุกเส้นต่อ pointermove
- **DPR-aware** แต่ cap ที่ 2-3x กัน canvas ใหญ่เกิน
- **Code split**: replay + export = `dynamic()` โหลดเมื่อเข้าถึง. word packs lazy
- **Memo**: PlayerBadge, TurnProgress, static UI
- **Framer Motion**: ใช้ `transform`/`opacity` เท่านั้น (GPU), `layout` เท่าที่จำเป็น
- **Bundle**: ตรวจ `@next/bundle-analyzer`, gifenc/confetti lazy
- Target: TTI < 2s mid-range mobile, interaction < 100ms, draw 60fps

---

## 15. UX Analysis

- **Cognitive load ต่ำ**: 1 action หลักต่อหน้า, ปุ่ม primary ชัด
- **Feedback ทันที**: haptic+sound+visual ทุกกด
- **กันพลาด**: confirm destructive, undo ทุกที่ที่ทำได้
- **ความยุติธรรม pass&play**: gate ทุกการเปิดข้อมูลลับ
- **Delight ตอนจบ**: reveal คือ climax — ลงทุน motion ที่นี่มากสุด
- **Onboarding สั้น**: อธิบายกติกา hidden-role ใน 3 การ์ด skip ได้

---

## 16. Responsive

- **Mobile-first** (target หลัก). ปุ่มหลักครึ่งล่างจอ, ถือมือเดียว
- Canvas เต็ม viewport ลบ safe-area (iOS notch/home indicator via `env(safe-area-inset-*)`)
- Tablet/iPad: canvas ใหญ่ขึ้น, controls ข้าง
- Desktop: center max-width container (เกมยังคือ pass-and-play, desktop = เล่นรวมจอเดียว), mouse วาดได้
- ทดสอบ: 360px → 1440px, portrait หลัก + landscape lock warning หรือ support

---

## 17. PWA

- **Serwist**: precache app shell + word db (offline เล่นได้เต็ม)
- **manifest**: name, short_name, theme_color, bg, display=standalone, orientation
- **icons**: 192/512 + maskable + apple-touch-icon + favicon
- **splash**: iOS ต้อง meta หลายขนาด (generate)
- **Add to Home Screen**: custom prompt (beforeinstallprompt android; iOS = สอน manual)
- **Offline**: ทั้งเกมทำงาน offline (ไม่มี backend อยู่แล้ว) — SW แค่ cache assets
- **Storage**: settings/stats localStorage, history IndexedDB — persist ข้าม session

---

## 18. Animation

| Animation | ใช้ที่ | เทคนิค |
|---|---|---|
| Page transition | ทุก phase | Framer AnimatePresence + spring |
| Card flip | role reveal, faker reveal | rotateY 3D + backface |
| Ripple | ปุ่ม | motion span จาก pointer origin |
| Spring | ทุก enter/exit | preset config กลาง |
| Fade/Glow | badge, hint | opacity + box-shadow animate |
| Particle | pass screen, idle | canvas particles (reduce-motion off) |
| Confetti | คนปกติชนะ | canvas-confetti |
| Firework | drama reveal | canvas-confetti fireworks preset |
| Micro | toggle, stepper, vote | scale/spring บน tap |

หลัก: **60fps native feel**, `transform`+`opacity` เท่านั้น, `prefers-reduced-motion` + animation-speed setting ปิด/ลดได้, ทุก animation interruptible

---

## 19. Export GIF / Video

**แหล่งข้อมูลเดียว**: replay renderer วาดลง offscreen canvas ตาม frame

- **GIF**: `gifenc` encode ใน Web Worker (กัน block UI). loop frames จาก renderer → gifenc → blob → download. cap ~10-15fps, resolution ≤ 720px, progress bar
- **Video**: `canvas.captureStream(fps)` → `MediaRecorder` (WebM/vp9) → blob → download. native, ไม่มี dependency. เล่น replay จริงแล้วอัด
- **ข้อควรระวัง**: memory มือถือ — จำกัดขนาด/ความยาว, cleanup blob url, ทำหลังสุด (P2), มี fallback "ไม่รองรับ" ถ้า browser ไม่มี MediaRecorder
- ponytail: ไม่ทำ ffmpeg.wasm (หนักมาก) เว้นแต่ต้อง mp4 การันตีจริง — WebM พอสำหรับ share

---

## 20. Word Database — **Cluster model** (คำคล้ายกัน)

กลไกใหม่: Normal ได้ **คำจริง**, Faker ได้ **คำหลอกคล้ายกัน**. เก็บเป็น **cluster** = กลุ่มคำที่วาดออกมาใกล้เคียง/สับสนกันได้.

**Schema**
```json
{
  "id": "animal-cat-0001",
  "category": "สัตว์",
  "difficulty": "easy",
  "words": ["แมว", "เสือ", "สิงโต"]
}
```
- แต่ละ cluster มี **2-5 คำคล้ายกัน** (วาดแล้วอาจสับสน). สุ่ม 1 คำ = คำจริง (Normal ทุกคน), สุ่มอีก 1 คำต่าง = คำหลอก (Faker แต่ละคน)
- **difficulty = ความใกล้ของคำในกลุ่ม**: easy = ต่างชัด (แมว/ปลา), medium = ใกล้มาก (เสือ/สิงโต) → Faker เนียนยากขึ้น
- คำนามไทย, วาดง่าย, รูปธรรม, ไม่กำกวม
- แบ่งไฟล์ต่อ pack (`core-th.json`) รองรับเพิ่ม pack + custom
- หมวด ≥15: สัตว์ อาหาร ผลไม้ ของใช้ สถานที่ เครื่องดนตรี กีฬา อาชีพ ธรรมชาติ ต้นไม้ ดอกไม้ เสื้อผ้า เครื่องใช้ไฟฟ้า ยานพาหนะ ของเล่น (+ เพิ่มได้)
- **ไม่แสดง category** ให้ผู้เล่น (category ใช้ภายในสำหรับจัดกลุ่ม/สุ่มเท่านั้น)
- **สุ่มไม่ซ้ำ (anti-repeat)**: pickCluster **ต้องไม่ซ้ำ cluster ในช่วง 10 เกมล่าสุด** (การันตี window=10). เก็บ recent cluster ids (ring buffer 10), สุ่มจาก pool ที่ตัด 10 ตัวล่าสุดออก, refill เมื่อ pool ไม่พอ. History เต็มยังเก็บ 50 เกมสำหรับ stats
- **เป้าหมายจำนวน**: ~1500 คำ = ประมาณ **400-500 cluster** (เฉลี่ย 3 คำ/cluster)

**การผลิตคำ (คุณภาพสำคัญสุด)**:
1. gen ทีละหมวด เป็น cluster (คำที่วาดแล้วสับสนกันได้จริง)
2. **human review**: คำในกลุ่มต้อง "ใกล้พอให้เนียน แต่ต่างพอให้จับได้", ตัดคำนามธรรม/วาดยาก
3. script validate: unique id, คำใน cluster ≥2 และไม่ซ้ำ, difficulty ถูก, category valid, ไม่มีคำโดดเดี่ยว
4. เริ่ม ~100-150 cluster คุณภาพก่อน (พอเล่น) แล้วขยายถึง ~500
> ponytail: cluster ดี > จำนวนเยอะ. คำที่ไม่คล้ายใครเลยใช้ไม่ได้กับกลไกนี้ — ต้องรีวิว "ความใกล้" ทุกกลุ่ม
> ponytail: ไม่ต้องมี field แยก real/decoy ใน data — สุ่มเอาตอน runtime จาก words[] ยืดหยุ่นกว่า

---

## ข้อเสนอทำให้ดีกว่า req เดิม (สรุป)

1. **เพิ่ม vote + win logic** — ไม่งั้นเกมเล่นไม่จบ (บังคับ)
2. **vector strokes** — ปลดล็อก replay + export ฟรี (สถาปัตยกรรม)
3. **pass-screen + hold-to-reveal** — กันความลับรั่ว หัวใจ pass&play
4. **resume game** — กันเสียเซสชันตอนสลับแอป
5. **rounds + scoring** — party game เล่นต่อเนื่อง สนุกกว่าเกมเดียวจบ
6. **Faker เดาคำ** — เพิ่ม depth กลยุทธ์ตามกติกาต้นฉบับ
7. **ship playable ก่อน polish** — ลด risk scope ใหญ่

---

## Open Questions — เคาะแล้ว ✓

| คำถาม | คำตอบ | ผลต่อดีไซน์ |
|---|---|---|
| Faker หลายคนรู้จักกันไหม? | **รู้จักกัน** | reveal ให้ Faker เห็นว่าใครเป็น Faker ด้วยกัน (ตอน role reveal) |
| win ทีมหรือเดี่ยว? | **setting เลือกได้** (ทีม / เดี่ยว) | teamMode flag ใน scoring — ทีม: Faker ชนะพร้อมกัน / เดี่ยว: ตัดสินรายคน |
| จำนวนรอบวาด | **1 รอบ** (แต่ละคนวาด 1 เส้น จบ) | ตัด rounds setting ออกจาก P0, จบเทิร์นเมื่อครบทุกคน 1 รอบ |
| Timer หมดเวลา = ? | **ไม่ auto-commit** — ผู้เล่นกด "เสร็จ" เองเสมอ | Timer = visual/pressure เท่านั้น (นับขึ้นหรือลง) ไม่บังคับจบเทิร์น |
| บอกหมวดให้ Faker? | **บอก** | Faker เห็น category เสมอ (ไม่เห็นคำ) — ไม่ต้องมี toggle |

พร้อมลง **Phase 0** ได้เลย.
