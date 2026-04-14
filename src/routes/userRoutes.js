import express from "express"
import { crearUsuario } from "../controllers/user.controller.js"
import User from "../models/User.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Crear usuario (officeId se asigna en el controller desde el token)
router.post("/", verifyToken, crearUsuario)

// Obtener cobradores SOLO de la oficina del admin autenticado
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ officeId: req.user.officeId })  // ← filtro multitenant
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios" })
  }
})

// Habilitar / deshabilitar cobrador (solo si pertenece a la misma oficina)
router.put("/habilitar/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { habilitado } = req.body

    // Verificar que el cobrador pertenece a la oficina del admin
    const user = await User.findOneAndUpdate(
      { _id: id, officeId: req.user.officeId },  // ← filtro multitenant
      { habilitado },
      { new: true }
    )

    if (!user) return res.status(404).json({ message: "Usuario no encontrado en esta oficina" })

    res.json(user)

  } catch (error) {
    res.status(500).json({ message: "Error actualizando usuario" })
  }
})

export default router