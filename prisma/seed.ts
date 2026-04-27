import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())

  // Team members with soft pastel colors
  const members = [
    { name: 'Izzat', color: '#AEC6CF' },
    { name: 'Shikin', color: '#FFB7B2' },
    { name: 'Ghash', color: '#B5EAD7' },
    { name: 'Haneeda', color: '#C3B1E1' },
    { name: 'Farhana', color: '#FFDAC1' },
    { name: 'Thanesh', color: '#FFFFB5' },
    { name: 'Hazim', color: '#FF9AA2' },
    { name: 'Fahad', color: '#A2D2FF' },
    { name: 'Hakim', color: '#C1E1C1' },
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
      type: 'WEEKLY_PLAN',
      title: 'Sprint Planning & Architecture Review',
      description: 'Focus on Q2 roadmap planning and system design reviews',
    },
  })

  // Seed some example events
  const teamMembers = await prisma.teamMember.findMany()
  
  // Add a public holiday (example - adjust date)
  await prisma.event.upsert({
    where: { id: 'seed-public-holiday-1' },
    update: {},
    create: {
      id: 'seed-public-holiday-1',
      date: new Date(today.getFullYear(), 4, 1).toISOString().split('T')[0], // May 1 Labor Day
      type: 'PUBLIC_HOLIDAY',
      title: 'Labour Day',
    },
  })

  // Add some WFH days
  const wfhMembers = teamMembers.slice(0, 3)
  for (let i = 0; i < wfhMembers.length; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    await prisma.event.create({
      data: {
        date: date.toISOString().split('T')[0],
        type: 'WFH',
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
