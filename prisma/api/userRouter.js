const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const userRouter = express.Router()
const { authenticate } = require("../db")
const bcrypt = require("bcrypt")


// Create new user
userRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = req.body
    const response = await prisma.user.create({
      data:{
        username: username,
        password: await bcrypt.hash(password, 5)
      }
    })
    res.send(response)
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})


// Login and recieve JWT token
userRouter.post("/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body))
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

module.exports = userRouter