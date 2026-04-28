import { PrismaClient } from '@prisma/client'
import Holidays from 'date-holidays'

const prisma = new PrismaClient()

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// When a public holiday falls on a weekend, Malaysian practice is to observe
// a substitute on the next available working day (Mon or Tue if Mon is taken).
function getSubstituteDays(
  holidays: { date: string; title: string }[]
): { date: string; title: string }[] {
  const taken = new Set(holidays.map((h) => h.date))
  const substitutes: { date: string; title: string }[] = []

  for (const h of holidays) {
    const [y, m, d] = h.date.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const dow = dt.getDay() // 0=Sun, 6=Sat

    if (dow === 0 || dow === 6) {
      // Find next Monday (or Tuesday if Monday is taken)
      let sub = new Date(dt)
      sub.setDate(sub.getDate() + (dow === 0 ? 1 : 2)) // Sun→+1 Mon, Sat→+2 Mon
      let subStr = toDateStr(sub)

      // Bump forward if that day is already a holiday or substitute
      const allTaken = new Set([...taken, ...substitutes.map((s) => s.date)])
      while (allTaken.has(subStr)) {
        sub.setDate(sub.getDate() + 1)
        subStr = toDateStr(sub)
      }

      substitutes.push({ date: subStr, title: `${h.title} (Ganti Rugi)` })
      taken.add(subStr)
    }
  }

  return substitutes
}

async function main() {
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())

  const members = [
    { name: 'Izzat',   color: '#7EB5C4' },
    { name: 'Shikin',  color: '#FF8A80' },
    { name: 'Ghash',   color: '#80CBC4' },
    { name: 'Haneeda', color: '#B39DDB' },
    { name: 'Farhana', color: '#FFAB91' },
    { name: 'Thanesh', color: '#FFF176' },
    { name: 'Hazim',   color: '#FF7043' },
    { name: 'Fahad',   color: '#64B5F6' },
    { name: 'Hakim',   color: '#AED581' },
  ]

  for (const member of members) {
    await prisma.teamMember.upsert({
      where: { name: member.name },
      update: {},
      create: member,
    })
  }

  // Create a weekly plan for current week
  const formattedWeekDate = currentWeekStart.toISOString().split('T')[0]
  await prisma.event.upsert({
    where: { id: 'seed-weekly-plan-1' },
    update: {},
    create: {
      id: 'seed-weekly-plan-1',
      date: formattedWeekDate,
      type: 'EVENT',
      title: 'Sprint Planning & Architecture Review',
      description: 'Focus on Q2 roadmap planning and system design reviews',
    },
  })

  const teamMembers = await prisma.teamMember.findMany()

  // Malaysia (Selangor, state code 10) public holidays
  const hd = new Holidays('MY', '10')
  const currentYear = today.getFullYear()
  const myHolidays = hd.getHolidays(currentYear)

  const HOLIDAY_NAME_OVERRIDES: Record<string, string> = {
    'Vesak Day': 'Wesak Day',
  }

  // Build the base holiday list
  const baseHolidays: { date: string; title: string }[] = []
  for (const h of myHolidays) {
    if (h.type === 'public') {
      const date = h.date.split(' ')[0]
      const title = HOLIDAY_NAME_OVERRIDES[h.name] ?? h.name
      baseHolidays.push({ date, title })
    }
  }

  // Add substitute days for holidays that fall on weekends
  const substitutes = getSubstituteDays(baseHolidays)
  const allHolidays = [...baseHolidays, ...substitutes]

  // Clear existing public holidays for the current year before re-seeding
  await prisma.event.deleteMany({
    where: { type: 'PUBLIC_HOLIDAY', date: { startsWith: String(currentYear) } },
  })

  for (const h of allHolidays) {
    const idSlug = h.title.replace(/\s+/g, '-').replace(/[()]/g, '')
    await prisma.event.upsert({
      where: { id: `holiday-${h.date}-${idSlug}` },
      update: { title: h.title },
      create: {
        id: `holiday-${h.date}-${idSlug}`,
        date: h.date,
        type: 'PUBLIC_HOLIDAY',
        title: h.title,
      },
    })
  }

  console.log(`Seeded ${baseHolidays.length} public holidays + ${substitutes.length} substitute days for Selangor ${currentYear}`)

  // Add some example WFH days
  const wfhMembers = teamMembers.slice(0, 3)
  for (let i = 0; i < wfhMembers.length; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    const dateStr = toDateStr(date)
    await prisma.event.upsert({
      where: { id: `seed-wfh-${i}` },
      update: {},
      create: {
        id: `seed-wfh-${i}`,
        date: dateStr,
        type: 'WFH',
        session: i === 0 ? 'AM' : 'FULL_DAY',
        title: 'Work From Home',
        teamMemberId: wfhMembers[i].id,
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
