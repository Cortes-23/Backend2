import express from "express"
import {
  crearCredito,
  obtenerCreditosPorCliente,
  obtenerCreditosDelCobrador,
  abonarCredito,
  marcarComoPagado,
  obtenerCreditosPorCobrador
} from "../controllers/credito.controller.js"

import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", verifyToken, crearCredito)

router.get("/cliente/:clienteId", verifyToken, obtenerCreditosPorCliente)

router.get("/cobrador/:cobradorId", verifyToken, obtenerCreditosPorCobrador)

router.get("/", verifyToken, obtenerCreditosDelCobrador)

router.post("/abonar/:id", verifyToken, abonarCredito)

router.put("/:id/pagar", verifyToken, marcarComoPagado)

export default router