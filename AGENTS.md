# FreeSong.in — Agent Engineering Rules & Guidelines

## 1. Project Overview
FreeSong.in is a high-performance, AMOLED-first modern music streaming web application built with React, Vite, and an Express backend powered by `ytmusic-api`. It features a YouTube Music-inspired user experience with centralized design tokens, strict responsive design, and modular multi-page architecture.

## 2. Technology Stack
- **Frontend**: React 19, React Router 7, Lucide Icons, Vite
- **Styling**: Centralized CSS Design Tokens (`variables.css`, `global.css`, `typography.css`, `components.css`), Component & Page-specific CSS
- **Backend / API**: Node.js, Express, `ytmusic-api`
- **Audio Engine**: Centralized audio playback with seamless background YouTube IFrame playback engine & PlayerContext
- **Icons**: `lucide-react`

## 3. Directory Structure
```text
freesong.in/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── freesonglogowebp.webp    <-- Official FreeSong.in logo asset (reused everywhere)
├── server/
│   └── server.js                    <-- Express API with ytmusic-api
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navigation/              <-- Sidebar, Header, MobileNav
│   │   ├── Player/                  <-- GlobalPlayer, FullScreenPlayer, QueueDrawer
│   │   ├── Cards/                   <-- CommunityCard, SongCard, AlbumCard, ArtistCard
│   │   └── Common/                  <-- Button, Modal, Loader, EmptyState
│   ├── context/
│   │   ├── PlayerContext.jsx        <-- Single centralized player state
│   │   └── LibraryContext.jsx       <-- Liked songs, custom playlists, recent history
│   ├── layouts/
│   │   ├── MainLayout.jsx           <-- Sidebar + Header + Content + GlobalPlayer
│   │   └── AuthLayout.jsx
│   ├── pages/                       <-- Each major feature has dedicated .jsx & .css
│   │   ├── Home/
│   │   ├── Explore/
│   │   ├── Library/
│   │   ├── Search/
│   │   ├── Songs/
│   │   ├── Artists/
│   │   ├── ArtistDetail/
│   │   ├── Albums/
│   │   ├── AlbumDetail/
│   │   ├── Playlists/
│   │   ├── PlaylistDetail/
│   │   ├── Favorites/
│   │   ├── History/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   ├── Login/
│   │   └── Register/
│   ├── services/
│   │   ├── api.js                   <-- API client interacting with /api/*
│   │   └── storage.js               <-- Safe localStorage persistence
│   ├── styles/
│   │   ├── variables.css            <-- Central AMOLED color tokens & dimensions
│   │   ├── typography.css           <-- Global typography hierarchy
│   │   ├── components.css           <-- Reusable UI button & badge styles
│   │   └── global.css               <-- CSS reset, scrollbars, focus rings
│   ├── App.jsx
│   └── main.jsx
├── AGENTS.md
└── package.json
```

## 4. Brand Identity & Official Color Palette
Use these CSS variables exclusively across all styles:
- **Primary Brand Green**: `#00C853` (`--color-primary`)
- **Bright Green Hover**: `#00E676` (`--color-primary-hover`)
- **Lime Accent**: `#76FF03` (`--color-accent`)
- **Pure White**: `#FFFFFF` (`--color-white`, `--color-text-primary`)
- **Main Background**: `#000000` (`--color-bg-main`) — True AMOLED black
- **Secondary Black**: `#080808` (`--color-bg-secondary`)
- **Card Background**: `#111111` (`--color-card`)
- **Card Hover**: `#181818` (`--color-card-hover`)
- **Border**: `#222222` (`--color-border`)
- **Secondary Text**: `#AFAFAF` (`--color-text-secondary`)
- **Muted Text**: `#707070` (`--color-text-muted`)

## 5. UI/UX Rules (YouTube Music Aesthetic)
- **Home Layout**: Dynamic algorithmic shelves with personalized artist specials, quick picks, latest releases, latest hits, and mood shelves.
- **Left Sidebar**: Home, Explore, Library links + `+ New playlist` button + Liked music and custom playlists list. **No "Upgrade" button** in sidebar.
- **Header**: Hamburger menu, FreeSong logo (`/images/freesonglogowebp.webp`), center pill search input, profile icons.
- **Persistent Player**: Bottom player bar never resets on page navigation; full-screen player available on mobile & desktop expand with segmented mode switcher (`Song`, `Lyrics`, `Up Next`).
- **Mobile First**: Fluid responsiveness across phones (375px+), tablets (768px+), and desktops (1024px+).

## 6. Album & Soundtrack Handling
- **Single & Sparse Album Enrichment**: Whenever an album fetched from `ytmusic-api` contains only 1–2 tracks (such as singles or movie soundtrack singles like `(From "Lupt")`), the server pipeline automatically enriches the release with the full movie soundtrack and related tracks by the artist. In `AlbumDetail`, releases with 1–2 original tracks are designated as `SINGLE / SOUNDTRACK` with full soundtrack collections so users are never left with a 1-song dead end.

## 7. Onboarding & Validation Rules
- **Mandatory Selection**: During onboarding taste personalization, users must select **at least 1 genre** to proceed to artists, and **at least 1 artist** to complete setup.
- **Error Feedback**: If a user attempts to continue or finish without selecting the minimum requirements, display an error toast using `useToast().showToast(message, 'error')`.

## 8. Centralized UI Systems
- **Unified Toast Engine**: Reusable `<Toast />` component mounted in `MainLayout` and accessed via `useToast()` from `ContextMenuContext.jsx`. Must be used consistently application-wide for success, info, and error notifications.
- **Global Context Menu**: Universal context menu with desktop popover and mobile slide-up bottom sheet, accessible via right-click (`onContextMenu`) and three-dots (`...`) across all cards and player components.

## 9. Security & Engineering Rules
- **No Push Without Explicit Approval**: Never run `git push`, never push to remote branches, never create remote PRs without explicit confirmation from the user.
- **Strict Input Validation**: Sanitize all search queries, playlist IDs, and user inputs before passing to `ytmusic-api`.
- **Never Expose Secrets**: Keep environment variables safe; never commit API keys or credentials.
- **Error Handling**: Provide graceful empty, error, and loading states for every network request.
- **Single Audio Player Instance**: Centralized state management via `PlayerContext` to avoid multiple concurrent playing instances.
- **Logo Preservation**: Always reuse `/images/freesonglogowebp.webp`. Never regenerate or duplicate the logo.
