# AlexTV

Web-based media platform that turns personal photos and videos into a premium TV viewing experience. Upload media, organize it into collections, and play them in a TV-optimized slideshow with background music.

## Features

- **Admin Panel** — Upload photos/videos, create collections, manage media
- **TV Player** — Fullscreen slideshow with smooth fade transitions
- **Browse & Slideshow Modes** — Grid view or auto-playing slideshow
- **Keyboard/Remote Navigation** — Arrow keys, Enter, Space, Escape
- **PIN Protection** — Private collections with 4-8 digit PIN
- **YouTube Background Music** — Ambient audio from YouTube playlists
- **Vertical Image Handling** — Blurred background for portrait photos
- **Dark Premium UI** — Designed for living room screens

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB (Atlas free tier)
- **Auth:** Custom JWT with jose (Edge-compatible)
- **Hosting:** Vercel (free tier)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public landing — shows public collections |
| `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/media` | Media library (upload, manage) |
| `/admin/collections` | Collections list |
| `/admin/collections/new` | Create collection |
| `/admin/collections/[slug]` | Edit collection + manage media |
| `/play/[slug]` | TV player |

## Setup

### 1. Clone and install

```bash
git clone git@github.com:taquion/AlexTV.git
cd AlexTV
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-random-64-char-secret
ADMIN_EMAIL=admin@alextv.local
ADMIN_PASSWORD=your-secure-password
```

### 3. Seed admin user

```bash
npm run seed
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel

```bash
npx vercel
```

Set environment variables in the Vercel dashboard.

## Player Controls

| Key | Action |
|-----|--------|
| Arrow Right | Next |
| Arrow Left | Previous |
| Space | Play/Pause |
| Enter | Start slideshow from selected |
| Escape | Back to grid |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password (used by seed) |

## Roadmap

- [ ] Google Drive integration (15GB free storage)
- [ ] Auto-upload from Android
- [ ] Drag & drop reorder in admin
- [ ] Ken Burns effect for images
- [ ] AI auto-tagging
- [ ] Face detection
- [ ] Shuffle mode
- [ ] Multi-user support
