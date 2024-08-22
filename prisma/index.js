const bcrypt = require("bcrypt")

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const express = require("express")
const { authenticate } = require("./db")
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(require("morgan")("dev"))


// Get All Items
app.get("/api/items", async (req, res, next) => {
  try {
    const response = await prisma.item.findMany({
      include:{
        reviews: true
      }
    })
    res.send(response[0])
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

// Get One Item
app.get("/api/items/:item_id", async (req, res, next) => {
  try {
    const { item_id } = req.params
    let response = await prisma.item.findMany({
      include: {
        reviews: true
      },
      where:{
        id: item_id
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

// Create New User
app.post("/api/users", async (req, res, next) => {
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

app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body))
    await prisma.$disconnect()
  } catch (error) {
    next(error)
  }
})

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