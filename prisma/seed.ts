import { PrismaClient } from '@prisma/client'
import Holidays from 'date-holidays'

const prisma = new PrismaClient()

async function main() {
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())

  // Team members with bumped pastel colors (more saturated for visibility)
  const members = [
    { name: 'Izzat', color: '#7EB5C4' },
    { name: 'Shikin', color: '#FF8A80' },
    { name: 'Ghash', color: '#80CBC4' },
    { name: 'Haneeda', color: '#B39DDB' },
    { name: 'Farhana', color: '#FFAB91' },
    { name: 'Thanesh', color: '#FFF176' },
    { name: 'Hazim', color: '#FF7043' },
    { name: 'Fahad', color: '#64B5F6' },
    { name: 'Hakim', color: '#AED581' },
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
    where: {
      id: 'seed-weekly-plan-1',
    },
    update: {},
    create: {
      id: 'seed-weekly-plan-1',
      date: formattedWeekDate,
      type: 'EVENT',
      title: 'Sprint Planning & Architecture Review',
      description: 'Focus on Q2 roadmap planning and system design reviews',
    },
  })

  // Seed some example events
  const teamMembers = await prisma.teamMember.findMany()
  
  // Automatically seed Malaysia (Selangor) public holidays for the current year
  const hd = new Holidays('MY', '10')
  const currentYear = today.getFullYear()
  const myHolidays = hd.getHolidays(currentYear)

  // Clear existing public holidays for the current year to prevent stale entries
  await prisma.event.deleteMany({
    where: {
      type: 'PUBLIC_HOLIDAY',
      date: {
        startsWith: String(currentYear)
      }
    }
  })

  for (const holiday of myHolidays) {
    if (holiday.type === 'public') {
      const holidayDate = holiday.date.split(' ')[0] // e.g. "2026-05-01"
      await prisma.event.upsert({
        where: { id: `holiday-${holidayDate}-${holiday.name.replace(/\s+/g, '-')}` },
        update: {},
        create: {
          id: `holiday-${holidayDate}-${holiday.name.replace(/\s+/g, '-')}`,
          date: holidayDate,
          type: 'PUBLIC_HOLIDAY',
          title: holiday.name,
        },
      })
    }
  }

  // Add some example WFH days — stable IDs make this idempotent on re-runs
  const wfhMembers = teamMembers.slice(0, 3)
  for (let i = 0; i < wfhMembers.length; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
