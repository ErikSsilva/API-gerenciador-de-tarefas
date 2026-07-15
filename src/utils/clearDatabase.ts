import { prisma } from "@/database/prisma"

export async function clearDatabase() {
  await prisma.taskHistory.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.task.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
}