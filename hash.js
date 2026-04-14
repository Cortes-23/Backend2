import bcrypt from "bcryptjs"

const password = "Gotas123"

const hash = await bcrypt.hash(password, 10)

console.log("HASH:", hash)