# Frontend Design Skill for Inno Team Calendar

Use this skill when modifying UI/UX of the Innovation Team Calendar.

## Design Language: Minimal & Soft Pastel
- Colors should feel soft and desaturated.
- Use rounded corners (e.g., `rounded-lg`, `rounded-xl`).
- Generous whitespace (`p-4`, `gap-4` or larger).
- Light mode preferred; no harsh colors.
- Lucide icons for all iconography.

## Calendar Grid Tokens
- Day cells: subtle border (`border-stone-100`), light hover (`hover:bg-stone-50`).
- Today: ring highlight (`ring-2 ring-stone-300`).
- Weekends: slightly different background (`bg-stone-50/50`).

## Event Dots
- Use the team member's assigned color.
- Render as small circles (e.g., `w-2 h-2 rounded-full`).
- Stack vertically in the day cell, max 3 visible before ellipsis.

## Public Holiday Styling
- Entire day cell gets a muted gray background (`bg-stone-100/60`).
- Use a small badge or text label indicating the holiday.

## Sidebar
- White background (`bg-white`), clean list of team members.
- Swatch next to each name using their color.
- Weekly Plan banner: sticky top, soft colored background, bold text.

## Fonts
- Use `font-sans` (Geist from Next.js).
- Bold for numbers, normal for event text.
