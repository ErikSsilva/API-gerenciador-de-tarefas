import { prisma } from "@/database/prisma";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

type CreateUserRole = {
  role?: "ADMIN" | "MEMBER"
}

export async function createAndAuthenticateUser({ role }: CreateUserRole = {}){
  const password = await hash("123456", 8)

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: `test_${Date.now()}@example.com`,
      password,
      role,
    }
  })

  const token = sign(
    {role},
    process.env.JWT_SECRET!,
    {
      subject: user.id,
      expiresIn: "1d"
    }
  )

  return {user, token}
}