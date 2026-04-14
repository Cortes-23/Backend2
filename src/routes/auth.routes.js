import { Router } from "express"
import { loginAdmin, loginCobrador, loginSuperAdmin } from "../controllers/auth.controller.js"

const router = Router()

router.post("/login-admin", loginAdmin)
router.post("/login-cobrador", loginCobrador)
router.post("/login-superadmin", loginSuperAdmin)

export default router