import Office from "../models/Office.js"
import User from "../models/User.js"

/* ─────────────────────────────────────────
   CREAR OFICINA (SUPERADMIN)
───────────────────────────────────────── */
export const createOffice = async (req, res) => {
  try {
    const { name, address, phone, slug } = req.body

    const existing = await Office.findOne({ slug })
    if (existing) return res.status(400).json({ message: "El slug ya está en uso" })

    const office = await Office.create({ name, address, phone, slug, active: true })

    res.status(201).json(office)

  } catch (error) {
    res.status(500).json({ message: "Error creando oficina" })
  }
}

/* ─────────────────────────────────────────
   LISTAR OFICINAS (SUPERADMIN)
───────────────────────────────────────── */
export const getOffices = async (req, res) => {
  try {
    const offices = await Office.find().select("-__v").sort({ createdAt: -1 })
    res.json(offices)
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo oficinas" })
  }
}

/* ─────────────────────────────────────────
   OBTENER OFICINA POR SLUG (público)
   Usado por el front para validar el tenant
───────────────────────────────────────── */
export const getOfficeBySlug = async (req, res) => {
  try {
    const office = await Office.findOne({ slug: req.params.slug, active: true }).select("-__v")
    if (!office) return res.status(404).json({ message: "Oficina no encontrada" })
    res.json(office)
  } catch (error) {
    res.status(500).json({ message: "Error buscando oficina" })
  }
}

/* ─────────────────────────────────────────
   ACTIVAR / DESACTIVAR OFICINA (SUPERADMIN)
───────────────────────────────────────── */
export const toggleOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id)
    if (!office) return res.status(404).json({ message: "Oficina no encontrada" })

    office.active = !office.active
    await office.save()

    res.json({ message: `Oficina ${office.active ? "activada" : "desactivada"}`, office })

  } catch (error) {
    res.status(500).json({ message: "Error actualizando oficina" })
  }
}

/* ─────────────────────────────────────────
   CREAR ADMIN PARA UNA OFICINA (SUPERADMIN)
───────────────────────────────────────── */
export const crearAdminOficina = async (req, res) => {
  try {
    const { officeId } = req.params
    const { nombre, cedula, celular, direccion, email, password } = req.body

    const office = await Office.findById(officeId)
    if (!office) return res.status(404).json({ message: "Oficina no encontrada" })

    const existe = await User.findOne({ email: email.trim().toLowerCase() })
    if (existe) return res.status(400).json({ message: "El email ya está en uso" })

    const admin = await User.create({
      nombre,
      cedula,
      celular,
      direccion,
      email: email.trim().toLowerCase(),
      password,
      rol: "ADMIN",
      officeId,
      habilitado: true
    })

    res.status(201).json({ message: "Admin creado correctamente", userId: admin._id })

  } catch (error) {
    res.status(500).json({ message: "Error creando admin" })
  }
}