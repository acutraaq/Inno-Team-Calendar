# Calendar Development Skill

Use this skill when working on the Innovation Team Calendar webapp.

## Domain Knowledge
- **Team Members**: Izzat, Shikin, Ghash, Haneeda, Farhana, Thanesh, Hazim, Fahad, Hakim
- **Colors** (soft pastel hex): #AEC6CF, #FFB7B2, #B5EAD7, #C3B1E1, #FFDAC1, #FFFFB5, #FF9AA2, #A2D2FF, #C1E1C1
- **Event Types**: HOLIDAY, MEDICAL_LEAVE, WFH, PUBLIC_HOLIDAY, WEEKLY_PLAN
- **WFH Rule**: Max 2 per member per ISO week.

## Quick Commands
- Start dev server: `npm run dev`
- Seed DB: `npx prisma db seed`
- Generate Prisma: `npx prisma generate`
- Open Prisma Studio: `npx prisma studio`

## Common Patterns
- All CRUD is done via Server Actions in `src/lib/actions.ts`
- WFH validation uses ISO week boundaries.
- Week starts on Sunday.
- `lucide-react` is installed for icons.
- Styling uses Tailwind CSS and `cn()` helper from `src/lib/utils.ts`.

## Troubleshooting
- If `lucide-react` errors, reinstall: `npm install lucide-react@0.468.0`
- If Prisma client is stale, run `npx prisma generate`.
