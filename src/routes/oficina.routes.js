import express from "express"
import { createOffice, getOffices, getOfficeBySlug } from "../controllers/office.controller.js"

const router = express.Router()

router.post("/", createOffice)
router.get("/", getOffices)
router.get("/:slug", getOfficeBySlug)

export default router