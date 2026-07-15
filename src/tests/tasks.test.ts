import { app } from "../app"
import request from "supertest"
import { createAndAuthenticateUser } from "./factories/userFactory"
import { prisma } from "@/database/prisma"
import { clearDatabase } from "@/utils/clearDatabase"
import { randomUUID } from "crypto";


describe("Task", () => {
  let adminToken: string;
  let memberToken: string;

  let adminId: string;
  let memberId: string;

  let teamId: string

  beforeEach(async () => {

    await clearDatabase()

    const admin = await createAndAuthenticateUser({ role: "ADMIN" })
    const member = await createAndAuthenticateUser({ role: "MEMBER" })

    adminToken = admin.token
    memberToken = member.token

    adminId = admin.user.id
    memberId = member.user.id

    const team = await prisma.team.create({
      data: {
        "name": "Test team tasks"
      }
    })

    teamId = team.id

  })

  afterAll(async () => {
    await clearDatabase()
  })

  it("should create a Task", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "title": "Test task",
        "teamId": teamId
      })

    expect(response.statusCode).toBe(201)
  })

  it("should allow a ADMIN assign a task to a MEMBER if MEMBER is on the TEAM", async () => {
    await prisma.teamMember.create({
      data:{
        "userId": memberId,
        "teamId": teamId
      }
    })

    const task = await prisma.task.create({
      data:{
        "title": "New Task",
        "teamId": teamId
      }
    })

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        "userId": memberId
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.assignedTo).toBe(memberId)
  })

  it("should allow a MEMBER list only the tasks assigned to him", async () => {
    await prisma.teamMember.create({
      data:{
        "userId": memberId,
        "teamId": teamId
      }
    })

    await prisma.task.create({
      data:{
        "title": "New Task",
        "teamId": teamId,
        "assignedTo": memberId
      }
    })

    const response = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${memberToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0].assignedTo).toBe(memberId)
  })

  it("should not allow a MEMBER update a task that not assigned to him", async () => {
    await prisma.teamMember.create({
      data:{
        "userId": memberId,
        "teamId": teamId
      }
    })

    const task = await prisma.task.create({
      data:{
        "title": "New Task",
        "teamId": teamId,
      }
    })

    const response = await request(app)
      .patch(`/tasks/${task.id}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        "title": "New Title"
      })

    expect(response.statusCode).toBe(403)
  })

  it("should allow a MEMBER update a task assigned to him", async () => {
    const title = "New title"

    await prisma.teamMember.create({
      data:{
        "userId": memberId,
        "teamId": teamId
      }
    })

    const task = await prisma.task.create({
      data:{
        "title": "New Task",
        "teamId": teamId,
        "assignedTo": memberId
      }
    })

    const response = await request(app)
      .patch(`/tasks/${task.id}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        "title": title
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.title).toBe(title)
  })

})