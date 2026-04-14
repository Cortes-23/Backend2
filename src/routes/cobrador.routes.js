import express from "express"
import { crearCobrador, listarCobradores } from "../controllers/cobrador.controller.js"

const router = express.Router()

router.post("/", crearCobrador)
router.get("/", listarCobradores)

export default router
