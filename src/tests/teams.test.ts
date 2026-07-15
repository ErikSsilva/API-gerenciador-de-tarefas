import { app } from "../app"
import request from "supertest"
import { createAndAuthenticateUser } from "./factories/userFactory"
import { prisma } from "@/database/prisma"
import { clearDatabase } from "@/utils/clearDatabase"
import { randomUUID } from "crypto";

describe("Team", () => {
  let adminToken: string;
  let memberToken: string;

  let adminId: string;
  let memberId: string;

  beforeEach(async () => {

    await clearDatabase()

    const admin = await createAndAuthenticateUser({ role: "ADMIN" })
    const member = await createAndAuthenticateUser({ role: "MEMBER" })

    adminToken = admin.token
    memberToken = member.token

    adminId = admin.user.id
    memberId = member.user.id

  })

  afterEach(async () => {
    await clearDatabase()
  })

  it("should create a new TEAM with ADMIN token", async () => {
    const response = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "name": "Test team"
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should not allow a MEMBER create a team", async () => {
    const response = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        "name": "Test team wrong"
      })

    expect(response.statusCode).toBe(403)
  })

  it("should allow a ADMIN add a MEMBER to a team", async () => {
    const team = await prisma.team.create({
      data: {
        "name": "Test Team factory"
      }
    })

    const teamId = team.id

    const response = await request(app)
      .post(`/teams/${teamId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "usersIds": [memberId]
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.added.length).toBeGreaterThan(0)

  })

  it("should not allow create a TEAM without name property", async() => {
    const response = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "description": "Wrong description"
      })
    
    expect(response.statusCode).toBe(400)
  })

  it("should allow a ADMIN to edit a team", async () => {
    const team = await prisma.team.create({
      data: {
        "name": "Test Team factory"
      }
    })

    const teamId = team.id

    const response = await request(app)
      .patch(`/teams/${teamId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "name": "New name"
      })
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty("updatedTeam")

  })

  it("should not allow editing a non-existing team", async () => {

    const fakeId = randomUUID();

    const response = await request(app)
      .patch(`/teams/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New name"
      })

    expect(response.statusCode).toBe(400)
  })

  it("should not add non-existing users", async () => {
    const team = await prisma.team.create({
      data: { name: "Test Team" }
    })

    const fakeId = randomUUID();

    const response = await request(app)
      .post(`/teams/${team.id}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        usersIds: [fakeId]
      })

    expect(response.statusCode).toBe(404)
  })
})