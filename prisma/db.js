const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const JWT = process.env.JWT || "shhh"

const authenticate = async ({username, password}) => {
  const response = await prisma.user.findMany({
    where: {
      username:username
    }
  })
  if(!response.length || (await bcrypt.compare(password, response[0].password)) === false){
    const error = Error('not authorized')
    error.status = 401
    throw error
  }
  const token = await jwt.sign({ id: response[0].id}, JWT)
  return {token:token}
}





module.exports = { authenticate }