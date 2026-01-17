# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**PMBTU AI Operations Dashboard** - A React frontend for Press Metal Bintulu's aluminium smelting facility. This dashboard provides:

1. **Pot Health Prediction** - Heatmap visualization of ~900 pots, risk monitoring, and alert management
2. **Production Planning v1** - Multi-page workflow for order queue, tapping arrangements, and scheduling
3. **Production Planning v2** - Single-page "Daily Tapping Planner" with AI auto-fill and real-time chemistry calculations

## Tech Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **React Router v6** (routing)
- **Zustand** (state management)
- **Recharts** (trend charts)
- **Lucide React** (icons)

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (button, card, dialog, etc.)
│   ├── layout/          # AppLayout, Sidebar, PageHeader
│   ├── shared/          # StatusBadge, MetricCard, RiskGauge, TrendChart
│   ├── pot-health/      # PotCell, PotHeatmap, PotDetailPanel
│   └── production-v2/   # CrucibleCard, OrderSummaryCards, PotSelectorModal
├── pages/               # Route pages (Dashboard, PotlineOverview, etc.)
├── data/
│   ├── generators/      # Mock data generation functions
│   ├── mock/            # Pre-generated mock data exports
│   └── constants.ts     # Risk thresholds, colors, grade constraints
├── stores/              # Zustand stores (filterStore, plannerStore)
├── types/               # TypeScript interfaces
└── lib/                 # Utility functions (cn for class merging)
```

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview with health score, alerts, production summary |
| `/pot-health` | PotlineOverview | Heatmap of all pots with filtering |
| `/pot-health/alerts` | AlertManagement | Alert table with bulk actions |
| `/production` | OrderQueue | Today's orders and fulfillment status |
| `/production/arrangement` | TappingArrangement | AI-optimized crucible assignments |
| `/production/select-pots` | PotSelector | Manual pot selection interface |
| `/production/schedule` | ScheduleCalendar | Weekly shift schedule grid |
| `/production-v2` | DailyTappingPlanner | Single-page v2 planner |

## Domain Knowledge

**Risk Thresholds**:
| Level | Iron (Fe) | Silicon (Si) | Color |
|-------|-----------|--------------|-------|
| Critical | ≥ 0.18 | ≥ 0.07 | Red |
| High | 0.14-0.18 | 0.06-0.07 | Orange |
| Moderate | 0.10-0.14 | 0.05-0.06 | Yellow |
| Normal | < 0.10 | < 0.05 | Green |

**Product Grade Constraints**:
| Grade | Max Fe | Max Si |
|-------|--------|--------|
| PFA-NT | 0.075 | 0.05 |
| Wire Rod H-EC | 0.100 | 0.05 |
| Billet | 0.100 | 0.10 |
| P1020 | 0.100 | 0.10 |

**Crucible Constraints**:
- Min pots: 2, Max pots: 6
- Max weight: 10.5 MT

## Key Files for Editing

- `src/data/constants.ts` - Risk thresholds, color schemes, grade constraints
- `src/data/generators/index.ts` - Mock data generation logic
- `src/stores/plannerStore.ts` - Production v2 state management
- `src/stores/filterStore.ts` - Pot health filtering state
- `src/types/index.ts` - All TypeScript interfaces

## Important Notes

1. **Path aliases**: Use `@/` prefix for imports (configured in `vite.config.ts` and `tsconfig.json`)
2. **Type imports**: Use `import type { ... }` for type-only imports (required by `verbatimModuleSyntax`)
3. **Tailwind v4**: Uses `@tailwindcss/postcss` plugin instead of direct PostCSS integration
4. **shadcn/ui**: Components are in `src/components/ui/`, following Radix UI patterns
5. **Mock data**: Generated with seeded random for consistent development experience
