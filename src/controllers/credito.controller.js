import Credito from "../models/Credito.js"
import Cliente from "../models/Cliente.js"

// req.user viene del authMiddleware (ya no se decodifica el token manualmente)

/* ─────────────────────────────────────────
   CREAR CRÉDITO
───────────────────────────────────────── */
export const crearCredito = async (req, res) => {
  try {
    const { clienteId, montoPrestamo, montoAPagar, fechaPago } = req.body

    if (!clienteId || !montoPrestamo || !montoAPagar || !fechaPago) {
      return res.status(400).json({ message: "Datos incompletos" })
    }

    // Verificar que el cliente pertenece a esta oficina
    const cliente = await Cliente.findOne({ _id: clienteId, officeId: req.user.officeId })
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" })

    const creditoPendiente = await Credito.findOne({ clienteId, estado: "PENDIENTE" })
    if (creditoPendiente) {
      return res.status(400).json({
        message: "El cliente ya tiene un crédito pendiente"
      })
    }

    const nuevoCredito = await Credito.create({
      clienteId,
      cobradorId: req.user.userId,
      officeId: req.user.officeId,    // ← aísla el crédito a esta oficina
      montoPrestamo: Number(montoPrestamo),
      montoAPagar: Number(montoAPagar),
      saldoPendiente: Number(montoAPagar),
      fechaPago: new Date(fechaPago),
      abonos: []
    })

    res.status(201).json(nuevoCredito)

  } catch (error) {
    res.status(500).json({ message: "Error creando crédito" })
  }
}

/* ─────────────────────────────────────────
   CRÉDITOS POR CLIENTE
───────────────────────────────────────── */
export const obtenerCreditosPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params

    const creditos = await Credito.find({
      clienteId,
      officeId: req.user.officeId   // ← solo de esta oficina
    })
      .populate("clienteId", "nombre cedula")
      .sort({ createdAt: -1 })

    res.json(creditos)

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo créditos" })
  }
}

/* ─────────────────────────────────────────
   CRÉDITOS DEL COBRADOR AUTENTICADO
───────────────────────────────────────── */
export const obtenerCreditosDelCobrador = async (req, res) => {
  try {
    const creditos = await Credito.find({
      cobradorId: req.user.userId,
      officeId: req.user.officeId   // ← solo de esta oficina
    })
      .populate("clienteId", "nombre cedula")
      .sort({ createdAt: -1 })

    res.json(creditos)

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo créditos" })
  }
}

/* ─────────────────────────────────────────
   ABONAR A CRÉDITO
───────────────────────────────────────── */
export const abonarCredito = async (req, res) => {
  try {
    const { id } = req.params
    const { monto } = req.body

    if (!monto || Number(monto) <= 0) {
      return res.status(400).json({ message: "Monto inválido" })
    }

    const credito = await Credito.findOne({ _id: id, officeId: req.user.officeId })
    if (!credito) return res.status(404).json({ message: "Crédito no encontrado" })

    if (credito.cobradorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "No autorizado para este crédito" })
    }

    if (credito.estado === "PAGADO") {
      return res.status(400).json({ message: "El crédito ya está pagado" })
    }

    if (Number(monto) > credito.saldoPendiente) {
      return res.status(400).json({ message: "El abono no puede ser mayor al saldo pendiente" })
    }

    credito.saldoPendiente -= Number(monto)
    credito.abonos.push({ monto: Number(monto), fecha: new Date() })

    if (credito.saldoPendiente === 0) credito.estado = "PAGADO"

    await credito.save()

    res.json({ message: "Abono registrado correctamente", credito })

  } catch (error) {
    res.status(500).json({ message: "Error registrando abono" })
  }
}

/* ─────────────────────────────────────────
   MARCAR COMO PAGADO
───────────────────────────────────────── */
export const marcarComoPagado = async (req, res) => {
  try {
    const { id } = req.params

    const credito = await Credito.findOne({ _id: id, officeId: req.user.officeId })
    if (!credito) return res.status(404).json({ message: "Crédito no encontrado" })

    if (credito.cobradorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "No autorizado para este crédito" })
    }

    credito.estado = "PAGADO"
    credito.saldoPendiente = 0
    await credito.save()

    res.json({ message: "Crédito marcado como PAGADO" })

  } catch (error) {
    res.status(500).json({ message: "Error actualizando crédito" })
  }
}

/* ─────────────────────────────────────────
   CRÉDITOS POR COBRADOR (ADMIN)
───────────────────────────────────────── */
export const obtenerCreditosPorCobrador = async (req, res) => {
  try {
    const { cobradorId } = req.params

    const creditos = await Credito.find({
      cobradorId,
      officeId: req.user.officeId   // ← solo de esta oficina
    })
      .populate("clienteId", "nombre cedula")
      .sort({ createdAt: -1 })

    res.json(creditos)

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo créditos" })
  }
}