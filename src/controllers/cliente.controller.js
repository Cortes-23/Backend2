import Cliente from "../models/Cliente.js"

/* ─────────────────────────────────────────
   CREAR CLIENTE
   officeId viene del token JWT
───────────────────────────────────────── */
export const crearCliente = async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion, cobrador } = req.body

    if (!nombre || !cedula) {
      return res.status(400).json({ message: "Nombre y cédula son obligatorios" })
    }

    const nuevoCliente = await Cliente.create({
      nombre,
      cedula,
      telefono,
      direccion,
      cobrador: cobrador || req.user.userId,
      officeId: req.user.officeId   // ← aísla el cliente a esta oficina
    })

    return res.status(201).json(nuevoCliente)

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya existe un cliente con esa cédula en esta oficina" })
    }
    return res.status(500).json({ message: "Error creando cliente" })
  }
}

/* ─────────────────────────────────────────
   OBTENER CLIENTES SEGÚN ROL
   COBRADOR: solo los suyos
   ADMIN: todos los de la oficina
───────────────────────────────────────── */
export const obtenerMisClientes = async (req, res) => {
  try {
    const filtro = { officeId: req.user.officeId }   // ← siempre filtra por oficina

    if (req.user.rol === "COBRADOR") {
      filtro.cobrador = req.user.userId
    }

    const clientes = await Cliente.find(filtro).populate("cobrador", "nombre email")

    return res.json(clientes)

  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo clientes" })
  }
}

/* ─────────────────────────────────────────
   OBTENER CLIENTES POR COBRADOR (ADMIN)
───────────────────────────────────────── */
export const obtenerClientesPorCobrador = async (req, res) => {
  try {
    const { cobradorId } = req.params

    const clientes = await Cliente.find({
      cobrador: cobradorId,
      officeId: req.user.officeId   // ← solo de esta oficina
    }).populate("cobrador", "nombre email")

    res.json(clientes)

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo clientes" })
  }
}