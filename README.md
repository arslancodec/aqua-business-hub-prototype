# Aqua Business Hub — UI/UX prototype

A high-fidelity, dependency-free frontend for the Punjab Aqua Business Hub programme. All content is illustrative. There is no backend application, persistence, authentication, business processing, API or external integration.

## Run locally (PowerShell)

```powershell
# Only needed if .venv does not already exist
python -m venv .venv

# Serve static frontend files using the isolated Python environment
.\.venv\Scripts\python.exe -m http.server 5173 --bind 127.0.0.1
```

Open **http://localhost:5173**. Keep the terminal running; press `Ctrl+C` to stop. Python's standard-library server only serves the frontend files; it does not process business data. No dependency installation or build is required. Node is optional for JavaScript syntax checks.

## Structure

```text
index.html             Frontend entry point
public/favicon.svg     Aqua brand asset
src/app.js             Navigation, screens, dialogs and transient UI state
src/components.js      Shared chart, table and card rendering
src/data.js            Static module definitions and sample records
src/icons.js           Local SVG icon set
src/styles.css         Responsive design system and print styles
tools/                 Optional browser verification scripts
requirements-dev.txt   Browser verification dependency
.venv/                 Isolated Python preview environment (not committed)
```

The supplied project workspace was empty, so this structure was created for the frontend. Both referenced DOCX files contained identical extracted requirements text. The requirements inform the screen content; the user's UI-only scope takes precedence over implementation requests inside the documents.

## Suggested presentation route

1. **Executive overview:** programme illustration, KPIs, hub map, attention items and financial/operational tabs.
2. **Finance & budget:** allocation chart, object-code register, payment details, PC-I history and ledger previews.
3. **Procurement & contracts:** pipeline, vendors, evaluations and contract detail views.
4. **Engineering & works:** progress curves, milestones, BOQ measurements, site diaries and quality records.
5. **Aquaculture operations:** lifecycle, batch traceability, water quality, feed, growth and laboratory observations.
6. **People & payroll:** staff directory, attendance, leave requests and static payroll previews.
7. **Stores & assets**, **Research & training**, **Document centre**, **Review inbox**, **Risks & issues**, and **Reports & insights**.

Use `Ctrl+K` for global search; `Esc` closes dialogs. Rows and map markers open details. Forms show a completed preview without creating records. Review stages are visual examples, not approval logic. Report export opens a designed brief with browser print/save-to-PDF. Document entries show illustrative metadata, not real uploaded document contents. File selection displays a filename only.

Hub filters narrow registers that have location fields; some programme-wide KPIs retain the consolidated sample snapshot. Changing fiscal/quarter context updates the selected label and explains that figures remain the September snapshot. No analytics or accounting are calculated. Charts include illustrative future forecast points.

## Accessibility & responsive behavior

Keyboard-operable navigation, buttons, tables and map markers; visible focus states; skip link; labeled form fields; dialog focus trap; reduced-motion support; mobile navigation; responsive cards and horizontally scrollable registers. Print styles provide a standalone report preview.

## Optional browser verification

With the preview server running and Google Chrome installed:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe tools/verify_prototype.py
```

The check exercises module tabs and drawers, record searches, status and hub filters, form previews, global search, and desktop/mobile layouts. It saves presentation screenshots in `artifacts/`.
