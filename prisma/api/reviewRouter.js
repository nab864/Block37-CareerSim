const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const reviewRouter = express.Router({ mergeParams: true })
const { isLoggedIn } = require("../db")

// Create a review
reviewRouter.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const { userId } = req.params
    const { body, score, itemId } = req.body
    const response = await prisma.review.create({
      data: {
        body: body,
        score: score,
        user: {
          connect: {
            id: userId
          }
        },
        item: {
          connect: {
            id: itemId
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

// Fetch all reviews of logged in user
reviewRouter.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const { userId } = req.params
    const response = await prisma.review.findMany({
      include: {
        comments: true
      },
      where: {
        userId: userId
      }
    })
    res.send(response)
  } catch (error) {
    next(error)
  }
})

// Delete a review of logged in user
reviewRouter.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, id } = req.params
    const response = await prisma.review.delete({
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

// Update a review of logged in user
reviewRouter.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { userId, id } = req.params
    const { body, score } = req.body
    const response = await prisma.review.update({
      where: {
        id: id,
        userId: userId
      },
      data: {
        body: body,
        score: score
      }
    })
    res.send(response)
  } catch (error) {
    next(error)
  }
})


module.exports = reviewRouter
