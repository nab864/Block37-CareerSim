const bcrypt = require("bcrypt")

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const app = express()
const { authenticate, findUserWithToken } = require("./db")
const port = process.env.PORT || 3000

app.use(express.json())
app.use(require("morgan")("dev"))
app.use("/api/items", require("./api/itemRouter"))
app.use("/api/users", require("./api/userRouter"))
app.use("/api/users/:userId/reviews", require("./api/reviewRouter"))
app.use("/api/users/:userId/comments", require("./api/commentRouter"))


const init = async () => {
  await prisma.comment.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.item.deleteMany({})
  await prisma.type.deleteMany({})

  const users = await prisma.user.createManyAndReturn({
    data: [
      {username: "Kai", password: await bcrypt.hash("1234", 5)},
      {username: "Ryan", password: await bcrypt.hash("5678", 5)}
    ]
  })


  const types = await prisma.type.createManyAndReturn({
    data: [
      {name: "store"},
      {name: "restaurant"},
      {name: "product"},
      {name: "book"}
    ]
  })


  const items = await prisma.item.create({
    data: {
      name: "McDonalds",
      description: "Yummy Mcdonalds",
      type: {
        connect: {
          id: types[1].id
        }
      }
    }
  })

  const reviews = await prisma.review.create({
    data: {
      body: "This is phenomenal",
      score: 10,
      user: {
        connect: {
          id: users[1].id
        }
      },
      item: {
        connect: {
          id: items.id
        }
      }
    }
  })

  const comments = await prisma.comment.create({
    data: {
      body: "This review is trash",
      user: {
        connect: {
          id: users[1].id
        }
      },
      review: {
        connect: {
          id: reviews.id
        }
      }
    }
  })

  await prisma.$disconnect()
  console.log("Database Seeded")
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}
init()



module.exports = { prisma }