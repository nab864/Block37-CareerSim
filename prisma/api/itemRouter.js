const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const itemRouter = express.Router()

// Fetch all items
itemRouter.get("/", async (req, res, next) => {
  try {
    const response = await prisma.item.findMany({
      include:{
        reviews: true
      }
    })
    res.send(response)
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

// Fetch one item
itemRouter.get("/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params
    let response = await prisma.item.findMany({
      include: {
        reviews: true
      },
      where:{
        id: itemId
      }
    })
    const aggregations = await prisma.review.aggregate({
      _avg: {
        score: true
      }
    })
    response = response[0]
    response["averageScore"] = aggregations._avg.score
    res.send(response)
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

module.exports = itemRouter 