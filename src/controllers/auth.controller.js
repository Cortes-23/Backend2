import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Office from "../models/Office.js"

/* LOGIN ADMIN (WEB) */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password, slug } = req.body

    // Verificar oficina si viene el slug
    let officeFilter = {}
    if (slug) {
      const office = await Office.findOne({ slug })
      if (!office) return res.status(404).json({ message: "Oficina no encontrada" })
      officeFilter = { officeId: office._id }
    }

    const user = await User.findOne({ email, ...officeFilter })

    if (!user || user.rol !== "ADMIN") {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      { userId: user._id, rol: user.rol, officeId: user.officeId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.json({ token })

  } catch (error) {
    res.status(500).json({ message: "Error en login admin" })
  }
}

/* LOGIN COBRADOR (MOBILE) */
export const loginCobrador = async (req, res) => {
  try {
    const { email, password, slug } = req.body

    // Verificar oficina si viene el slug
    let officeFilter = {}
    if (slug) {
      const office = await Office.findOne({ slug })
      if (!office) return res.status(404).json({ message: "Oficina no encontrada" })
      officeFilter = { officeId: office._id }
    }

    const user = await User.findOne({ email, ...officeFilter })

    if (!user || user.rol !== "COBRADOR") {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    if (!user.habilitado) {
      return res.status(403).json({ message: "Este cobrador está deshabilitado" })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      { userId: user._id, rol: user.rol, officeId: user.officeId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.json({ token })

  } catch (error) {
    res.status(500).json({ message: "Error en login cobrador" })
  }
}

/* ─────────────────────────────────────────
   LOGIN SUPERADMIN
   Sin slug, sin oficina
───────────────────────────────────────── */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email, rol: "SUPERADMIN" })

    if (!user) return res.status(401).json({ message: "Credenciales incorrectas" })

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ message: "Credenciales incorrectas" })

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    )

    res.json({ token })

  } catch (error) {
    res.status(500).json({ message: "Error en login superadmin" })
  }
}