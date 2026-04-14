import { Router } from "express"
import { verifyToken } from "../middlewares/auth.middleware.js"
import {
  createOffice,
  getOffices,
  toggleOffice,
  crearAdminOficina
} from "../controllers/office.controller.js"

const router = Router()

// Middleware: solo SUPERADMIN puede acceder
const soloSuperAdmin = (req, res, next) => {
  if (req.user.rol !== "SUPERADMIN") {
    return res.status(403).json({ message: "Acceso denegado" })
  }
  next()
}

router.use(verifyToken, soloSuperAdmin)

router.get("/oficinas", getOffices)
router.post("/oficinas", createOffice)
router.patch("/oficinas/:id/toggle", toggleOffice)
router.post("/oficinas/:officeId/admin", crearAdminOficina)

export default router