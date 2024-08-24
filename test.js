const jwt = require("jsonwebtoken")
const JWT = process.env.JWT || "shhh"

const main = async () => {
  const token = await jwt.sign({id: "1234"}, JWT)
  console.log(token)
  const payload = await jwt.verify(token, JWT)
  console.log(payload)
}

main()