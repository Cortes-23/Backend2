import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Office from "../models/Office.js"

/* LOGIN ADMIN (WEB) */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password, slug } = req.body

    console.log("📥 LOGIN:", { email, slug })

    const user = await User.findOne({ email })

    if (!user) {
      console.log("❌ Usuario no existe")
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    // 🔥 FIX: normalizar rol
    const rol = user.rol?.trim()?.toUpperCase()

    if (rol !== "ADMIN") {
      console.log("❌ Rol inválido:", user.rol)
      return res.status(403).json({ message: "No autorizado" })
    }

    const isValid = await bcrypt.compare(password, user.password)

    console.log("🔐 MATCH:", isValid)

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        rol: "ADMIN",
        officeId: user.officeId
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        rol: "ADMIN"
      }
    })

  } catch (error) {
    console.error("🔥 ERROR LOGIN ADMIN:", error)
    return res.status(500).json({ message: "Error en login admin" })
  }
}


/* LOGIN COBRADOR (MOBILE) */
export const loginCobrador = async (req, res) => {
  try {
    const { email, password, slug } = req.body

    let user = null

    if (slug) {
      const office = await Office.findOne({ slug })

      if (!office) {
        return res.status(404).json({ message: "Oficina no encontrada" })
      }

      user = await User.findOne({ email, officeId: office._id })
    } else {
      user = await User.findOne({ email })
    }

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

    res.json({
      token,
      user
    })

  } catch (error) {
    console.error("❌ ERROR LOGIN COBRADOR:", error)
    res.status(500).json({ message: "Error en login cobrador" })
  }
}


/* LOGIN SUPERADMIN */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email, rol: "SUPERADMIN" })

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    )

    res.json({
      token,
      user
    })

  } catch (error) {
    console.error("❌ ERROR LOGIN SUPERADMIN:", error)
    res.status(500).json({ message: "Error en login superadmin" })
  }
}