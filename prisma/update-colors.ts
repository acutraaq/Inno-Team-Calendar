import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const colorMap: Record<string, string> = {
  Izzat: '#7EB5C4',
  Shikin: '#FF8A80',
  Ghash: '#80CBC4',
  Haneeda: '#B39DDB',
  Farhana: '#FFAB91',
  Thanesh: '#FFF176',
  Hazim: '#FF7043',
  Fahad: '#64B5F6',
  Hakim: '#AED581',
}

async function main() {
  for (const [name, color] of Object.entries(colorMap)) {
    await prisma.teamMember.updateMany({
      where: { name },
      data: { color },
    })
  }
  console.log('Team member colors updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
