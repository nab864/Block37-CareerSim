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
  console.log(response[0].id)
  return {token:token}
}

const findUserWithToken = async(token)=> {
  let id
  // req.headers.authorization from postman returns the token as `Bearer ${token}` 
  // so I split it to match just the token
  const tokenSplit = token.split(" ")
  console.log(token)
  try {
    const payload = await jwt.verify(tokenSplit[1], JWT)
    id = payload.id
  } catch (e) {
    const error = Error("not authorized1")
    error.status = 401
    throw error
  }
  const response = await prisma.user.findMany({
    where: {
      id:id
    }
  })
  if(!response.length){
    const error = Error('not authorized2')
    error.status = 401
    throw error
  }
  return response;
}

// Verify user is logged in with a jsonwebtoken
const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization)
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = { authenticate, findUserWithToken, isLoggedIn }