import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

// 🔹 Configurar variables de entorno
dotenv.config()

// 🔹 Importar rutas
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/userRoutes.js"
import clienteRoutes from "./routes/cliente.routes.js"
import creditoRoutes from "./routes/credito.routes.js"
import officeRoutes from "./routes/oficina.routes.js"
import superadminRoutes from "./routes/Superadmin.routes.js"

const app = express()

// 🔹 Middlewares
app.use(cors())
app.use(express.json())

// 🔹 Ruta de prueba (health check)
app.get("/", (req, res) => {
  res.send("🚀 API funcionando correctamente")
})

// 🔹 Rutas API
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/clientes", clienteRoutes)
app.use("/api/creditos", creditoRoutes)
app.use("/api/oficinas", officeRoutes)
app.use("/api/superadmin", superadminRoutes)

// 🔹 Puerto dinámico (Render)
const PORT = process.env.PORT || 3000

// 🔹 Conexión a MongoDB + levantar servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB")

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("❌ Error al conectar con MongoDB:", error)
  })