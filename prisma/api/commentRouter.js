const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const commentRouter = express.Router({ mergeParams: true })
const { isLoggedIn } = require("../db")

// Create a comment
commentRouter.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const { userId } = req.params
    const { body, reviewId } = req.body
    const response = await prisma.comment.create({
      data: {
        body: body,
        user: {
          connect: {
            id: userId
          }
        },
        review: {
          connect: {
            id: reviewId
          }
        }
      }
    })
    res.send(response)
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

// Fetch all comments of logged in user
commentRouter.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const { userId } = req.params
    const response = await prisma.comment.findMany({
      where: {
        userId: userId
      },
      include: {
        review: true
      }
    })
    res.send(response)
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

// Delete a comment of logged in user
commentRouter.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, id } = req.params
    const response = await prisma.comment.delete({
      where: {
        id: id,
        userId: userId
      }
    })
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

// Update a comment of logged in user
commentRouter.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, id } = req.params
    const { body } = req.body
    const response = await prisma.comment.update({
      where: {
        id: id,
        userId: userId
      },
      data: {
        body: body
      }
    })
    res.send(response)
  } catch (error) {
    next(error)
  }
})

module.exports = commentRouter