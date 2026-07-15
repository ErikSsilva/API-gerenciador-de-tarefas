import { app } from "../app"
import request from "supertest"
import { prisma } from "@/database/prisma"
import { clearDatabase } from "@/utils/clearDatabase"
import { hash } from "bcrypt"


describe("User", () => {

  beforeEach(async () => {
    await clearDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  it("should create a new user", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      })
    expect(response.status).toBe(201)
  })

  it("should not create user with existing email", async () => {
    await prisma.user.create({ 
      data: {
        "name": "test",
        "email": "test@example.com",
        "password": await hash("123456", 8)
      } 
    })
    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      })
    expect(response.status).toBe(409)
  })

  it("should not create user with invalid email", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "invalid-email",
        password: "123456"
      })
    expect(response.status).toBe(400)
  })

  it("should login user and return a token", async () => {
    await prisma.user.create({ 
      data: {
        "name": "test",
        "email": "test@example.com",
        "password": await hash("123456", 8)
      } 
    })
    const response = await request(app)
      .post("/sessions")
      .send({
        email: "test@example.com",
        password: "123456"
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("token")
  })

  it("should not login with wrong credentials", async () => {
    const response = await request(app)
      .post("/sessions")
      .send({
        email: "wrong-email",
        password: "123456"
      })

    expect(response.status).toBe(400)
  })
})