# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start local dev server (Next.js)
- `npm run build` — Production build (use to verify changes compile)
- `npm run lint` — Run ESLint via Next.js
- No test suite configured

## Architecture

Next.js 14 Pages Router app (not App Router). Deployed on Vercel. Content is managed in Notion and fetched at build time via ISR.

### Content Pipeline

- **Notion is the CMS.** All essays, clippings, and about page content come from Notion databases/pages via `@notionhq/client`.
- `lib/notion.js` — Core Notion API client. Fetches essays, clippings, and about page content. Handles property extraction (rich text, dates, selects, URLs) and recursive block fetching.
- `lib/notion-renderer.js` — Converts Notion blocks to HTML (including inline databases as tables).
- `lib/clippings.js` — Wrapper around Notion fetches with hardcoded local fallback data if Notion is unavailable.
- `lib/markdown.js` — Legacy remark-based markdown renderer (used by local markdown essays in `content/essays/`).

### Pages

- `pages/index.js` — Home page. Shows recent essays + clippings with hover/tap preview summaries. Has both `.item-summary` (essays) and `.item-why` (clippings) preview styles that should stay visually aligned.
- `pages/essays/index.js` — Full essay listing with `.essay-summary` previews. Styles should match home page `.item-summary`.
- `pages/essays/[slug].js` — Individual essay page. Content rendered as HTML from Notion.
- `pages/clippings.js` — Full clippings listing.
- `pages/about.js` — About page, structured sections parsed from Notion heading hierarchy.
- `pages/portfolio.js` — Portfolio/projects page.
- `pages/search.js` — Client-side search across essays.
- `pages/api/revalidate.js` — ISR on-demand revalidation endpoint.
- `pages/api/search.js` — Server-side search API.

### Styling

- **No CSS modules or Tailwind.** All styling uses `styled-jsx` (`<style jsx>`) scoped to each page/component.
- Global CSS variables defined in `styles/globals.css` — light mode in `:root`, dark mode in `.dark` class.
- Theme switching via `next-themes` with `class` strategy (adds `.dark` to `<html>`).
- Key CSS variables: `--text-color`, `--nav-text`, `--hover-bg`, `--border-color`, `--accent-color`, `--background-color`.

### Layout & Interactions

- Single shared `components/Layout.js` wraps all pages. Contains header, nav, footer, theme toggle, and full keyboard navigation system (arrow keys + spatial focus).
- Touch interactions use a two-tap pattern for essays: first tap reveals summary, second tap navigates. Uses `@media (hover: hover)` to separate hover and touch behaviors.
- Max content width: 960px.

### Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NOTION_API_KEY`
- `NOTION_ESSAYS_DATABASE_ID`
- `NOTION_CLIPPINGS_DATABASE_ID`
- `NOTION_ABOUT_PAGE_ID`

### Notion Database Schemas

**Essays DB:** Title, Slug (rich_text), Date, Summary (rich_text), Type (select), Published (checkbox)

**Clippings DB:** Title, URL, Date, Type (select), Why (rich_text), Published (checkbox)
