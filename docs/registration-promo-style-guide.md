# Grand Reopening Registration Promo — Style Guide

## Purpose
- Present a professional, high‑conversion promotion for the Grand Reopening.
- Communicate the automatic $10 welcome bonus (1,000 points) clearly and credibly.
- Maintain accessibility and responsive quality across devices.

## Color Palette
- Background gradient: #080808 → #000000
- Surface: rgba(255,255,255,0.05) to rgba(255,255,255,0.10)
- Borders: rgba(255,255,255,0.10–0.20)
- Primary brand: Red 600 #dc2626, Red 700 #b91c1c
- Accent success: Green 500 #22c55e
- Text
  - Primary: #FAFAFA
  - Secondary: #9CA3AF
  - Muted: #6B7280

## Typography
- Headings: weight 800–900
- Body: Inter (system fallbacks)
- Sizes
  - H1: 32–40 px
  - H2: 24–28 px
  - Stat: 32–40 px
  - Body: 14–16 px
  - Meta: 12–13 px

## Layout & Spacing
- Card radius: 16 px
- Card padding: 24 px
- Gaps: 8, 12, 16, 24 px
- Grid
  - Mobile: single column
  - Tablet: 2 columns
  - Desktop: 3 columns

## Components
- Promo Shell
  - Title row: “Grand Reopening” + Limited Time badge
  - Three cards:
    1) Bonus stat ($10, 1,000 points)
    2) Points explanation (100 pts = $1 + full progress bar to 1,000)
    3) Urgency copy (limited event to first 50k members)
- Buttons: radius 12 px, gradient background, bold label
- Focus: 2 px red outline offset 2 px on interactive elements

## Accessibility
- All text on dark surfaces ≥ 4.5:1 contrast
- Keyboard focus visible on all interactive elements
- Avoid long lines; use semantic headings

## Content
- Headline: Grand Reopening
- Subheadline: Limited Time
- Bonus statement: $10 Welcome Bonus (1,000 points) when you sign up
- Points conversion: 100 pts = $1
- Urgency: Event live for our first 50,000 members

## A/B Testing
- Experiment: register_promo_v1
- Variants
  - A: Legacy rewards panel
  - B: This design
- Events
  - impression on page load
  - conversion on successful register
- Endpoint: POST /api/analytics/ab { experiment, variant, event }

## Implementation Notes
- Component lives inside the registration page; no external icon library used.
- All contrast and focus styles reinforced by global CSS.
