# Inno Team Calendar - Project Context

This is the Innovation Team Calendar webapp.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui components
- Prisma ORM (SQLite, migration-ready for PostgreSQL)
- Lucide React icons
- Server Actions for all CRUD operations

## Team Members
- Izzat, Shikin, Ghash, Haneeda, Farhana, Thanesh, Hazim, Fahad, Hakim
- Each member has a unique soft pastel color for calendar indicators.

## Key Rules
- WFH is limited to 2 days per member per week.
- Weekly plan banner shows the `WEEKLY_PLAN` event for the current week at the top.
- Public holidays mute the entire day cell background.
- Design is minimal and soft pastel.

## Database
- Prisma schema is at `prisma/schema.prisma`
- Seed data is in `prisma/seed.ts`
- `.env` contains `DATABASE_URL`

## Common Commands
```bash
npm run dev              # Start dev server
npx prisma db seed       # Seed initial team members & plan
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma client after schema changes
npx prisma studio       # Open db GUI
```

## Deployment
- GitHub Actions workflow: `.github/workflows/deploy-azure.yml`
- Targets Azure Web App.
- SQLite is used locally; for production on Azure, mount an Azure File Share or migrate to PostgreSQL.
