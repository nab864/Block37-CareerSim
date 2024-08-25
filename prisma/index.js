const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const { faker } = require("@faker-js/faker")
const app = express()
const bcrypt = require("bcrypt")

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

  const users = []
  for (let i=0; i<=10; i++) {
    const user = await prisma.user.create({
      data: {
        username: await faker.internet.userName(), password: await bcrypt.hash(await faker.internet.password(), 5)
      }
    })
    users.push(user)
  }

  const types = await prisma.type.createManyAndReturn({
    data: [
      {name: "store"},
      {name: "restaurant"},
      {name: "product"},
      {name: "book"}
    ]
  })

  const items = []
  for (let i=0; i<=10; i++) {
    const item = await prisma.item.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        type: {
          connect: {
            id: types[Math.floor(Math.random() * 4)].id
          }
        }
      }
    })
    items.push(item)
  }

  const reviews = []
  for (let i=0; i<=10; i++) {
    const review = await prisma.review.create({
      data: {
        body: faker.lorem.paragraph(),
        score: Math.floor(Math.random() * 11),
        user: {
          connect: {
            id: users[i].id
          }
        },
        item: {
          connect: {
            id: items[Math.floor(Math.random() * 10)].id
          }
        }
      }
    })
    reviews.push(review)
  }

  for (let i=0; i<=10; i++) {
    await prisma.comment.create({
      data: {
        body: faker.lorem.paragraph(),
        user: {
          connect: {
            id: users[i].id
          }
        },
        review: {
          connect: {
            id: reviews[Math.floor(Math.random() * 10)].id
          }
        }
      }
    })

  }

  await prisma.$disconnect()
  console.log("Database Seeded")
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}
init()



module.exports = { prisma }