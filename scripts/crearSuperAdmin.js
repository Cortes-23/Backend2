import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import User from "../src/models/User.js"

// 🔥 Resolver ruta absoluta del .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, "../.env")
})

// 🔍 DEBUG
console.log("RUTA .env:", path.resolve(__dirname, "../.env"))
console.log("MONGO_URI:", process.env.MONGO_URI)

// 🚀 Conexión
await mongoose.connect(process.env.MONGO_URI)

const existe = await User.findOne({ rol: "SUPERADMIN" })

if (existe) {
  console.log("⚠️ Ya existe un SUPERADMIN")
  process.exit(0)
}

await User.create({
  nombre: "Super Admin",
  cedula: "000000000",
  celular: "000000000",
  direccion: "Sistema",
  email: "steven12.com",
  password: "123456",
  rol: "SUPERADMIN",
  officeId: null,
  habilitado: true
})

console.log("✅ SUPERADMIN creado correctamente")
process.exit(0)