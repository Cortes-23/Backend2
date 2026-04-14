import User from "../models/User.js"

/* ─────────────────────────────────────────
   CREAR USUARIO (ADMIN crea cobradores)
   officeId viene del token JWT del admin
───────────────────────────────────────── */
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, cedula, celular, direccion, email, password, rol } = req.body

    if (!nombre || !cedula || !celular || !direccion || !email || !password || !rol) {
      return res.status(400).json({ message: "Faltan campos obligatorios" })
    }

    // ADMIN solo puede crear COBRADOR en su propia oficina
    if (req.user.rol === "ADMIN" && rol !== "COBRADOR") {
      return res.status(403).json({ message: "Solo puede crear cobradores" })
    }

    const emailNormalizado = email.trim().toLowerCase()
    const existe = await User.findOne({ email: emailNormalizado })
    if (existe) return res.status(400).json({ message: "El usuario ya existe" })

    const nuevoUsuario = new User({
      nombre,
      cedula,
      celular,
      direccion,
      email: emailNormalizado,
      password,
      rol,
      officeId: req.user.officeId   // ← hereda la oficina del admin que lo crea
    })

    await nuevoUsuario.save()

    res.status(201).json({ message: "Usuario creado correctamente" })

  } catch (error) {
    console.error("ERROR CREAR USUARIO:", error)
    res.status(500).json({ message: error.message })
  }
}

/* ─────────────────────────────────────────
   LISTAR COBRADORES DE LA OFICINA
───────────────────────────────────────── */
export const listarCobradores = async (req, res) => {
  try {
    const cobradores = await User.find({
      officeId: req.user.officeId,
      rol: "COBRADOR"
    }).select("-password")

    res.json(cobradores)

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo cobradores" })
  }
}

/* ─────────────────────────────────────────
   HABILITAR / DESHABILITAR COBRADOR
───────────────────────────────────────── */
export const toggleHabilitado = async (req, res) => {
  try {
    const { id } = req.params
    const cobrador = await User.findOne({ _id: id, officeId: req.user.officeId })

    if (!cobrador) return res.status(404).json({ message: "Cobrador no encontrado" })

    cobrador.habilitado = !cobrador.habilitado
    await cobrador.save()

    res.json({ message: `Cobrador ${cobrador.habilitado ? "habilitado" : "deshabilitado"}` })

  } catch (error) {
    res.status(500).json({ message: "Error actualizando cobrador" })
  }
}