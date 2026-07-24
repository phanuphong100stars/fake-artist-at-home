# SPEC — ศิลปินจอมปลอม (Fake Artist) · รอบปรับปรุง UX/สี/วาด

> Local-first PWA เกมทายศิลปินจอมปลอม เล่นบนเครื่องเดียว ส่งต่อกันวาด
> รอบนี้: แก้ bug, บังคับ/รองรับแนวนอน, ขยายพื้นที่วาด, ระบบสี+picker,
> palm rejection, เปลี่ยนคำ, ประวัติ, แก้ภาพ/วิดีโอบีบ, export เหลือแค่วิดีโอ

---

## 1. Objective

ผู้เล่น: กลุ่มเพื่อน 3–16 คน เล่นบน tablet/มือถือเครื่องเดียว (โดยเฉพาะ tablet + ปากกา)

เป้าหมายรอบนี้: ยกระดับ UX ตอนเล่นจริงบน tablet — วาดลื่น ไม่มีเส้นจากฝ่ามือ,
พื้นที่วาดใหญ่, แนวนอนใช้งานได้ดี, การ์ดบทบาทอ่านง่าย/ชัด, จัดการคำ/ประวัติได้คล่อง

**Non-goals**: ไม่ทำ multiplayer online, ไม่ทำ backend, ไม่เพิ่ม dependency ใหม่ถ้าไม่จำเป็น

---

## 2. Features + Acceptance Criteria

### F1 — แก้ bug drag เรียงลำดับผู้เล่น
`PlayerSetupScreen` ใช้ `motion` `Reorder` + `dragControls`.
- [ ] ลากที่ handle ⠿ สลับลำดับได้ทั้ง touch และ mouse ไม่ค้าง ไม่กระตุก ไม่เด้งกลับ
- [ ] ลำดับหลังลาก persist (ใช้เป็น turn order จริงตอนวาด)
- [ ] เปิด color picker ของแถว (layout animation) ไม่รบกวนการลาก
- [ ] ลากได้แม้ตอนมีหลายแถว scroll

Note: สงสัย root cause = pointer-capture/layout-animation ชนกัน — debug ตาม systematic-debugging

### F2 — แนวนอน (landscape) + ขยายพื้นที่วาด
เว็บ lock rotation จริงไม่ได้ทุก browser → ใช้ **prompt หมุนเครื่อง + layout landscape**
- [ ] เข้า `draw` phase ถ้าเครื่องเป็น portrait: overlay "กรุณาหมุนเครื่องเป็นแนวนอน" (ไม่บังวาด, ถือได้)
- [ ] Layout แนวนอน: canvas กินพื้นที่หลัก, controls (brush/undo/done/timer) ย้ายเป็น rail ข้าง/แถบบางแทนกินพื้นที่แนวตั้ง
- [ ] พื้นที่วาดใหญ่ขึ้นชัดเจนเทียบของเดิม (ลด chrome: header คอมแพกต์, legend ยุบได้)
- [ ] Portrait ยังวาดได้ (ไม่บล็อกตาย) แต่ default แนะนำแนวนอน

### F3 — Faker เห็นคำ / ไม่เห็นคำ (ตั้งค่าได้)
เพิ่ม setting `fakerSeesWord: boolean` (default `true` = พฤติกรรมเดิม decoy word)
- [ ] `true`: faker เห็น "คำหลอก" เหมือนเดิม
- [ ] `false`: faker ไม่เห็นคำเลย — การ์ดบอกชัด "คุณคือตัวปลอม ไม่มีคำ เนียนให้ได้"
- [ ] มี toggle ใน `GameSettingScreen`/`SettingsScreen`

### F4 — การ์ด Faker ใหม่ (เด่น อ่านออก)
Redesign การ์ด reveal ฝั่ง faker ใน `RoleRevealScreen`
- [ ] ต่างจากการ์ด normal ชัดเจน (สี/ไอคอน/badge) — เห็นแวบเดียวรู้ว่าปลอม
- [ ] รองรับทั้งกรณีมีคำหลอก (F3=true) และไม่มีคำ (F3=false)
- [ ] อ่านง่ายในที่แสงจ้า (contrast พอ), รองรับ largeFont

### F5 — ระบบสี + color picker (ขยาย preset)
คงระบบ token `p1..pN` (ผูก storage/replay/colorblind) — **ไม่ใช้ hex อิสระ**
- [ ] ขยาย preset จาก 12 → ~18–24 สี ใน `globals.css` (`--color-pN`) + `PLAYER_HEX` + `ALL_COLORS` ให้ครบทุกที่ ตรงกัน
- [ ] Color picker = grid เลือกสี preset ที่ใช้ง่าย (ปรับจาก swatch เดิมให้ดีขึ้น), กันเลือกสีซ้ำกับผู้เล่นอื่น
- [ ] สีใหม่แยกแยะได้ (ไม่ใกล้กันจนสับสน), ผ่าน colorblind flag เดิม

### F6 — Palm rejection (tablet + ปากกา)
Auto-detect ปากกา + toggle บังคับ ใน `DrawCanvas`
- [ ] เมื่อพบ pointer `pointerType === 'pen'` → เข้าโหมด pen-only: `onPointerDown/Move` ที่ `pointerType === 'touch'` ถูก ignore (ฝ่ามือวางไม่เกิดเส้น/จุด)
- [ ] Setting `palmRejection` toggle: บังคับ pen/mouse-only แม้ยังไม่เคยเจอ pen
- [ ] mouse ยังวาดได้ปกติ; เครื่องไม่มีปากกา (touch อย่างเดียว) ต้องวาดได้ตามเดิมเมื่อ toggle ปิด

### F7 — เปลี่ยนคำ / เริ่มรอบใหม่ (คำยากเกิน)
- [ ] ใน `RoleRevealScreen` (ก่อนเริ่มวาด) มีปุ่ม "เปลี่ยนคำ" → re-deal cluster ใหม่ + reset reveal pass
- [ ] คงผู้เล่น + settings + faker count เดิม
- [ ] ยืนยันก่อน (กันกดพลาด) เพราะ reset การเปิดการ์ดที่ดูไปแล้ว

### F8 — เมนูประวัติ (ต่อยอด `HistoryScreen`)
- [ ] เข้าจาก `HomeScreen` ชัดเจน (ปุ่ม/เมนูเห็นง่าย)
- [ ] เปิด replay ย้อนหลังได้ (มีอยู่ — verify ทำงาน + ไม่บีบ ดู F9)
- [ ] ลบรายเกม (เพิ่ม `deleteGame(id)` ใน `historyRepo`) + ล้างทั้งหมด (มีแล้ว)
- [ ] สรุปสถิติเข้าถึงได้จากประวัติ (ลิงก์ไป `StatisticsScreen`)

### F9 — แก้ภาพ/รีเพลย์บีบ (aspect ratio)
Root cause: strokes เก็บ normalized 0..1 แต่ render ตาม aspect ของ container ที่ต่างกัน
- [ ] กำหนด **canonical aspect ratio** ของพื้นที่วาด (เช่น 4:3 landscape) ใช้ที่เดียวกันทุกจอ
- [ ] `DrawCanvas`, `ReplayScreen`, `StaticCanvas`, thumbnail, export ทั้งหมด letterbox/คุม aspect ให้ตรง → ไม่ยืด/บีบ
- [ ] เก็บ aspect ใน `GameRecord` (field ใหม่, default = canonical) เผื่อ record เก่า
- [ ] เกมเก่าใน history แสดงไม่เพี้ยน (fallback aspect)

### F10 — Export เหลือแค่วิดีโอ
- [ ] ลบปุ่ม/flow GIF ออกจาก `ReplayScreen`
- [ ] คงปุ่มวิดีโอ (WebM), แก้ให้ export ตาม aspect F9 (ไม่ใช่ 720×720 square)
- [ ] ลบ/ตัด `lib/export/gif.ts` + dep `gifenc` ถ้าไม่มีที่อื่นใช้แล้ว (ponytail: ลบดีกว่าเก็บ dead)

### F11 — UX polish รวม
- [ ] touch target ≥ 44px (ส่วนใหญ่มีแล้ว — verify), flow ลื่น ปุ่มหลักเด่น
- [ ] ไม่ทำ regression กับ pass-gate reveal, sequential turn order, resume game

### F12 — ปุ่ม back เครื่องจริง (Android/browser) ย้อนใน web
ตอนนี้ nav = phase ใน `gameStore` ไม่ใช่ router → hardware/browser back ปิดแอปทันที
- [ ] ใช้ History API: `pushState` เมื่อเปลี่ยน phase, ฟัง `popstate` → ย้อน phase แทนออกแอป
- [ ] back จากจอลึก (draw/reveal) → กลับจอก่อนหน้าตาม flow ไม่หลุดออก
- [ ] อยู่ `home` แล้วกด back = ออกได้ตามปกติ (ไม่ trap)
- [ ] ระวังชนกับ resume game / persisted phase (sync state ↔ history ให้ตรง)

### F14 — UI ฟีลศิลปิน (paint/abstract) — pass แรกเสร็จ
- [x] brush-swipe accent ใต้ชื่อบน home (hand-painted, animate draw-in)
- [x] brush picker preview เป็น canvas จริง (paint texture โชว์สด)
- [ ] (ถัดไปถ้าอยากดันต่อ) brushy accents/divider ทั่วแอป, texture พื้นหลัง

### F15 — เลือกชนิดแปรงตอนเริ่มเกม — เสร็จ
- [x] `BrushType = marker | highlighter | crayon | pencil`, setting `brushType`
- [x] `paintStroke` render แต่ละแปรง (multi-pass + deterministic jitter → replay/export ตรง)
- [x] `brush?` optional ใน Stroke → record เก่า fallback = marker (ไม่ต้อง migrate)
- [x] BrushPicker ใน ตั้งค่าเกม (preview canvas จริง)

### F13 — Default theme = dark
- [ ] `DEFAULT_SETTINGS.theme` = `"dark"` (จากเดิม `"system"`)
- [ ] ผู้ใช้เดิมที่เคยตั้งค่าไว้แล้วไม่ถูก override (persist มี value อยู่แล้ว)
- [ ] dark verified ทุกจอ (มี test `tests/visual/dark.mjs` เดิม)

---

## รอบใหม่ (2026-07-24): ระบบโหวต + จำนวนรอบวาด

domain พร้อมแล้ว — `scoring.ts` (`tallyVotes`/`resolveWin`) + `Votes`/`GameResult`
มีอยู่และมี unit test ใน `tests/domain.test.ts` ครบ. งานรอบนี้ = wiring store + UI เท่านั้น.
faker-guess phase **defer** (resolveWin ส่ง `fakerGuessCorrect=false`).

### F16 — ระบบโหวตในแอป (in-app voting) — เสร็จ
setting `votingEnabled: boolean` (default `true`). เพิ่ม phase `"vote"` คั่นระหว่าง `draw` → `reveal`.
**โมเดล: กลุ่มโหวตร่วมกัน** — จอเดียว list ทุกคน คุยกันจริงแล้วจิ้มเลือก 1 คน (ไม่วนส่งมือถือ).
- [x] toggle `votingEnabled` ใน `GameSettingScreen` (default เปิด)
- [x] `votingEnabled=true`: วาดครบ → เข้า phase `vote` (ไม่ใช่ reveal ตรง)
- [x] `VoteScreen` list ผู้เล่นทุกคน → เลือก 1 คน → กด "เฉลย"
- [x] `accuse(suspectId)` → `resolveWin(fakerIds, { verdict: suspectId }, fakerWinMode, realWord, false)` → set `winner` → `reveal`
- [x] `reveal` โชว์ผู้ชนะ + "กลุ่มโหวตให้ [ชื่อ] — จับถูก/ไม่ใช่ตัวปลอม"; ซ่อนปุ่มเลือกผู้ชนะเอง
- [x] `votingEnabled=false`: flow เดิมทุกอย่าง (ปุ่ม "ใครชนะ?" เลือกเอง) — fallback (`!winner && !voted`)
- [x] stats + history record `winner` เหมือนเดิม (accuse เรียก `declareWinner` เดิม)
- [x] persist: `accusedId` อยู่ใน partialize

### F17 — ตั้งจำนวนรอบวาดได้ (configurable draw rounds) — เสร็จ
setting `rounds: 1 | 2 | 3` (default `2` = กติกามาตรฐาน; เดิมพฤติกรรม = 1 รอบ).
`order` = `drawOrder(players, rounds)` = base turn order ซ้ำ `rounds` ครั้ง — logic `commitTurn`/`isLast` เดิมใช้ `order.length` ได้เลย.
- [x] stepper `rounds` (1–3) ใน `GameSettingScreen`
- [x] `rounds=2` → `order.length === players.length * 2`, แต่ละคนได้วาด 2 ตา (unit test `drawOrder`)
- [x] ลำดับ: รอบ 1 ครบทุกคนก่อน แล้วรอบ 2 (turnOrder เดิมซ้ำ ไม่สุ่มใหม่)
- [x] `DrawScreen` โชว์ "รอบ r/R" (derive จาก `drawIndex / players.length`)
- [x] จบเกมเมื่อครบทุกตา (`players * rounds`); replay เรียงถูก (`committedAt = drawIndex` unique ต่อตา)
- [x] persisted settings เก่าไม่มี `rounds` → fallback `2` (zustand persist merge default)

---

## 3. Commands

```bash
npm run dev          # dev server (Next.js)
npm run build        # production build — ต้องผ่านก่อนถือว่าเสร็จ
npm run lint         # eslint — ต้อง 0 error
npm test             # vitest (domain + words)
node tests/visual/<name>.mjs   # playwright visual check (ต้องมี dev/preview รันอยู่)
```

Definition of done ต่อ feature: `lint` + `test` + `build` ผ่าน และ visual check จอที่แตะผ่าน

---

## 4. Project Structure (ที่จะแตะ)

```
src/
  domain/types.ts            # + fakerSeesWord, palmRejection, aspect; ขยาย PlayerColor
  stores/settingsStore.ts    # + fakerSeesWord, palmRejection defaults
  stores/gameStore.ts        # ALL_COLORS ขยาย; changeWord/re-deal action
  lib/colors.ts              # PLAYER_HEX ขยาย
  app/globals.css            # --color-pN ขยาย
  components/game/
    DrawCanvas.tsx           # palm rejection, canonical aspect
    StaticCanvas.tsx         # aspect
  components/screens/
    PlayerSetupScreen.tsx    # F1 drag fix, F5 picker
    RoleRevealScreen.tsx     # F3 no-word, F4 faker card, F7 เปลี่ยนคำ
    DrawScreen.tsx           # F2 landscape layout + ขยายพื้นที่วาด
    ReplayScreen.tsx         # F9 aspect, F10 ลบ GIF
    HistoryScreen.tsx        # F8 delete/stats link
    HomeScreen.tsx           # F8 entry
    GameSettingScreen.tsx / SettingsScreen.tsx  # toggles F3/F6
  lib/export/video.ts        # F9 aspect
  lib/export/gif.ts          # F10 ลบถ้าไม่ใช้
  data/repository/historyRepo.ts  # + deleteGame(id), aspect field
```

โครงเดิม: หน้าจอ = phase ใน `gameStore` (ไม่ใช้ router), state ผ่าน zustand + persist,
domain แยก pure logic, canvas render แยก `lib/canvas`

---

## 5. Code Style

- อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด Next (ตาม AGENTS.md — เวอร์ชันนี้มี breaking changes)
- TypeScript strict, ไม่มี `any` ลอย; domain layer = pure, ไม่มี side-effect/React
- Canvas อ่าน CSS var ไม่ได้ → mirror hex ใน `PLAYER_HEX` (คงกติกาเดิม)
- Comment เท่าที่โค้ดรอบข้างมี; UI ข้อความภาษาไทย, โค้ด/identifier ภาษาอังกฤษ
- ไม่ over-engineer: ขยาย pattern เดิม > สร้าง abstraction ใหม่; ลบ > เพิ่ม (GIF, dead dep)
- SSR-safe: ห้าม `Math.random`/`Date.now` ใน seed/initial render (ดู comment ใน gameStore)

---

## 6. Testing Strategy

- **Unit (vitest)**: domain เดิมต้องผ่าน; ถ้าแตะ role/word/turn logic เพิ่ม test
- **Palm rejection**: unit/self-check ว่า touch event ถูก ignore เมื่ออยู่ pen mode (logic แยกออกจาก React ได้)
- **Aspect (F9)**: check ว่า normalized point map กลับเป็น pixel ตาม canonical aspect เท่ากันทุก renderer (visual + 1 assert)
- **Visual (playwright `tests/visual/*.mjs`)**: จอที่แตะ — setup(drag), reveal(faker card), draw(landscape), replay(no-squish, no-GIF), history
- ไม่ตั้ง framework ใหม่/fixture เกินจำเป็น (ponytail)

---

## 7. Boundaries

**Always**
- คงเล่นได้ offline / local-first, PWA install ได้
- คง backward-compat: persisted state + history records เก่าต้องไม่พัง (migration/fallback)
- `lint` + `test` + `build` ผ่านก่อน commit
- UI ไทย, a11y เดิม (colorblind, largeFont, reduceMotion, highContrast) ต้องไม่เสีย

**Ask first**
- เปลี่ยน schema ที่ทำ persisted state/history เก่าพัง (ต้องมี migration plan)
- เพิ่ม dependency ใหม่ (พยายามใช้ที่มี: motion, lucide, zustand, idb-keyval)
- เปลี่ยนกติกาเกม/flow ที่กระทบการเล่น (นอกเหนือ F3 ที่ตกลงแล้ว)

**Never**
- ไม่ทำ backend/online, ไม่ส่งข้อมูลออกนอกเครื่อง
- ไม่ hardcode hex ลง stroke (คง token system) — F5 ตกลงใช้ preset
- ไม่ลบ GIF จนกว่าจะยืนยันไม่มีที่อื่นเรียก
- ไม่ commit/push จนกว่าผู้ใช้สั่ง

---

## Open decisions (ยืนยันแล้ว)
- สี: **ขยาย preset + picker เลือกจาก preset** (คง token)
- แนวนอน: **prompt หมุนเครื่อง + layout landscape** (ไม่ fullscreen-lock)
- palm: **auto-detect pen + toggle**
- ประวัติ: **entry จาก home + replay ย้อนหลัง + ลบ/เคลียร์ + ลิงก์สถิติ**
