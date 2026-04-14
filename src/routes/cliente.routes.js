import express from "express"
import {
  crearCliente,
  obtenerMisClientes,
  obtenerClientesPorCobrador
} from "../controllers/cliente.controller.js"

import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Crear cliente (admin lo crea y le asigna cobrador)
router.post("/", verifyToken, crearCliente)

// Obtener clientes del usuario logueado
router.get("/", verifyToken, obtenerMisClientes)

// Obtener clientes por cobrador (admin)
router.get("/cobrador/:cobradorId", verifyToken, obtenerClientesPorCobrador)

export default router