# CivicConnect: AI Crowd Safety & Resilient Civic Infrastructure

CivicConnect unifies legal verified public events, computer-vision crowd safety, and resilient offline communication in one bespoke platform.

## Architecture

The platform is strictly structured into **two portals**:

```
/            Portal Chooser ("I'm a Citizen" / "I'm an Admin")
/app/*       Public Portal (Citizens & Organizers, mobile-first, 5 tabs)
             - Home (Nearby verified events, Protest Hub map, announcements)
             - Events (Discovery, guidelines, verification status timeline)
             - Communities (Forums, participatory polls, organizers)
             - Connect (Broadcasts, Bluetooth/Wi-Fi Direct offline mesh mode)
             - Safety (2-second SOS hold, 2D crowd level, triage & evacuation)
/admin/*     Admin Console (Authorities & Platform Team, desktop-first, 5 sidebar items)
             - Live Room (Center-stage 3D depth surface, real YOLO detections)
             - Event Review (Pending queue, NOC viewer, approval checklist)
             - Moderation (Flagged misinformation, duplicate route sentinel)
             - Alerts & Broadcast (Emergency alerts, SOS inbox)
             - Reports (Attendance, crowd levels, public transparency audit)
```

---

## Asset Pipeline (`scripts/make_assets.py`)

The asset pipeline extracts frame-synced depth video, ByteTrack YOLOv8 person tracking, and spatial metadata from video feeds.

### Command
One command per clip:
```bash
python scripts/make_assets.py public/drone.mp4 drone
python scripts/make_assets.py public/cctv.mp4 cctv
```

### Pipeline Operations
1. **Depth Estimation**:
   - Uses `Depth-Anything-V2-Small` (via Hugging Face `transformers`).
   - Per-frame normalization with running min/max window to prevent luminance flickering.
   - Temporal smoothing ($0.7 \times \text{previous} + 0.3 \times \text{current}$).
   - Light bilateral filter ($d=5, \sigma_{\text{color}}=0.1, \sigma_{\text{space}}=5$) to keep sharp silhouette boundaries without melting.
   - Outputs grayscale H.264 video (`yuv420p`) at the identical resolution and frame rate.
2. **YOLOv8 Detection & Tracking**:
   - Uses `ultralytics` YOLOv8 with built-in ByteTrack (`tracker="bytetrack.yaml"`).
   - Filtered strictly to `class 0` (person) with `imgsz=960` for aerial high-angle footage.
   - Writes `public/<prefix>_detections.json` with frame index, timestamp $t$, and bounding boxes `[{ id, x, y, w, h, conf }]`.
3. **Metadata**:
   - Generates `public/<prefix>_meta.json` containing resolution, fps, frame count, duration, and depth distribution statistics.

---

## Design System & Readability Rules

- **Typography**:
  - Display: `Fraunces` (headlines only)
  - UI: `Geist` (clean sans-serif)
  - Data / Numbers: `Geist Mono` (tabular numerals)
- **Strict Readability**:
  - Body text: 15–16px minimum
  - Labels: 13px minimum
  - No all-caps mono text longer than 3 words
  - Plain language: "Crowd level: Safe / Busy / Dangerous" (no academic jargon)
  - Zero text placed on top of 3D canvas or video viewports
- **Palette**:
  - Public Portal: Warm paper (`#F4F1EA`), ink `#14141C`, indigo `#2E1F73`, vermilion `#FF4B1F` (SOS only), verified green `#1F9D6B` (seal only).
  - Admin Console: Dark slate (`#0E0E14` background, `#16161F` panels, 1px hairline rules).
  - Radii: 8–12px, soft layered shadows.
