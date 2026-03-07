# Rename "Interesting" to "Clippings" — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the "Interesting" section to "Clippings" across the entire codebase and Notion.

**Architecture:** Find-and-replace rename across 7 source files, rename 2 files, update 1 env var, and rename the Notion database via API.

**Tech Stack:** Next.js Pages Router, styled-jsx, Notion API

---

## Context

The "Interesting" section collects articles, tools, podcasts, and resources worth recommending. "Clippings" better captures the curation intent.

---

### Task 1: Rename lib file

**Files:**
- Rename: `lib/interesting.js` -> `lib/clippings.js`

**Step 1:** Rename file and update all identifiers:
- `getAllInterestingItems` -> `getAllClippings`
- `getInterestingItemById` -> `getClippingById`
- `getLocalInterestingItems` -> `getLocalClippings`
- `localInterestingItems` -> `localClippings`
- All comments/strings referencing "interesting"

**Step 2:** Verify no syntax errors: `node -c lib/clippings.js`

---

### Task 2: Rename Notion API functions

**Files:**
- Modify: `lib/notion.js` (lines 9, 143-181)

**Step 1:** Rename:
- `INTERESTING_DB_ID` -> `CLIPPINGS_DB_ID`
- `process.env.NOTION_INTERESTING_DATABASE_ID` -> `process.env.NOTION_CLIPPINGS_DATABASE_ID`
- `getInterestingItemsFromNotion` -> `getClippingsFromNotion`
- `getInterestingItemByIdFromNotion` -> `getClippingByIdFromNotion`
- All comments/strings referencing "interesting"

---

### Task 3: Rename page file

**Files:**
- Rename: `pages/interesting.js` -> `pages/clippings.js`

**Step 1:** Rename file and update:
- Import: `from '../lib/interesting'` -> `from '../lib/clippings'`
- Function: `InterestingPage` -> `ClippingsPage`
- Props: `interestingItems` -> `clippings`
- Layout title: "Interesting Things" -> "Clippings"
- Layout description: update
- Intro copy: "A curated collection of articles, tools, and resources that caught my attention." -> "A curated collection of articles, tools, and resources worth saving."
- CSS classes: `.interesting-*` -> `.clippings-*`
- All other "interesting" references in the file

---

### Task 4: Update home page

**Files:**
- Modify: `pages/index.js`

**Step 1:** Update:
- Import: `from '../lib/interesting'` -> `from '../lib/clippings'`
- Prop: `interestingItems` -> `clippings`
- Section heading: "Interesting Things" -> "Clippings"
- Link: `/interesting` -> `/clippings`
- Link text: "all interesting things →" -> "all clippings →"
- `getAllInterestingItems` -> `getAllClippings`
- CSS classes: `.interesting-item` -> `.clippings-item`
- All other "interesting" references

---

### Task 5: Update Layout nav

**Files:**
- Modify: `components/Layout.js` (line 22)

**Step 1:** Change nav item:
- `{ label: 'Interesting', path: '/interesting' }` -> `{ label: 'Clippings', path: '/clippings' }`

---

### Task 6: Update revalidation API

**Files:**
- Modify: `pages/api/revalidate.js` (line 9)

**Step 1:** Change: `'/interesting'` -> `'/clippings'`

---

### Task 7: Update env var

**Files:**
- Modify: `.env.local.example` (if it has NOTION_INTERESTING_DATABASE_ID)
- Modify: `.env.local` (rename the var)

Note: `.env.local.example` currently doesn't list Notion vars. Skip if not present.
The actual `.env.local` needs `NOTION_INTERESTING_DATABASE_ID` renamed to `NOTION_CLIPPINGS_DATABASE_ID`.

---

### Task 8: Update documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Step 1:** Replace all "interesting" references with "clippings" equivalents.

---

### Task 9: Rename Notion database

**Step 1:** Use Notion API to rename the "Interesting" database to "Clippings".

---

### Task 10: Build verification

**Step 1:** Run `npm run build` to verify everything compiles.

**Step 2:** Run `npm run dev` and verify in browser:
- `/clippings` loads correctly
- Home page shows "Clippings" section
- Nav shows "Clippings"
- Old `/interesting` returns 404

---

### Task 11: Commit and push

**Step 1:** Commit all changes.
**Step 2:** Push to main.

**Manual follow-up:** Update `NOTION_CLIPPINGS_DATABASE_ID` env var in Vercel (rename from `NOTION_INTERESTING_DATABASE_ID`).
