# Design Guide

Feel: calm, clinical, professional. Flat surfaces, soft corners, generous spacing.

## Hard constraints
- No gradients, no neon, no glow, no glassmorphism, no decorative animation.
- Solid colors only. One primary color. Status colors only for status.
- Reuse components; no one-off styles. No redundant UI (no duplicate buttons/labels/sections).

## Tokens
| Token | Value |
|---|---|
| Font | Inter (self-hosted via `@fontsource-variable/inter`) |
| Page bg | slate-50 `#F8FAFC` |
| Card bg | white, 1px border slate-200, shadow-sm |
| Text | slate-900 / secondary slate-500 |
| Primary | teal-700 `#0F766E` (hover teal-800) |
| Radius | cards `rounded-xl` (12px) · inputs/buttons `rounded-lg` (8px) · pills `rounded-full` |
| Spacing | 4px scale; card padding 20px; grid gap 16px |
| Type | title 24/600 · card title 16/600 · body 14/400 · caption 12/500 |

## Card layout (reference style, not a copy)
- Responsive grid: 1 col (<640) · 2 cols (≥768) · 3 cols (≥1280).
- Card = header (title + optional action) → body → footer pills.
- **Patient card:** initials avatar, name, pills: `age · gender`, `phone`.
- **Appointment card:** time pill, patient name, doctor + specialization, status pill, primary action.
- **Consultation history card:** date pill, vitals pills (BP, Temp), notes text.

## Pills (soft tint bg + same-hue text, small icon, `rounded-full`, 12px/500)
| Use | Style |
|---|---|
| Status SCHEDULED | blue-50 bg / blue-700 text |
| Status COMPLETED | green-50 bg / green-700 text |
| Info (age, gender, phone, time, vitals) | slate-100 bg / slate-700 text |
Icons: Lucide, 14px.

## Toasts (Spartan sonner)
- Position: top-right (bottom-center on mobile). Auto-dismiss 4s; errors 6s.
- Success: every create/save/login/register/complete action.
- Error: every failed API call (message from `ApiError.message`), network failure, session expiry.
- Never show raw server/stack text. Validation errors also inline under the field.

## Forms
Label above input, helper/error text 12px below (red-600), primary action right-aligned, buttons show loading and disable while submitting.

## States
Every list/screen has: loading (skeleton cards), empty (icon + one line + primary action), error (retry).

## Layout
- Desktop: left sidebar (Patients, Appointments) + top bar (user, logout).
- Mobile: top bar with drawer. Dialogs become full-width sheets on small screens.
- Auth pages: centered single card, max-width 400px.

## Accessibility
Visible focus ring, 4.5:1 contrast, labels on all inputs, semantic landmarks, unique ids on interactive elements.
