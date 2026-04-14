import Cobrador from "../models/Cobrador.js"
import bcrypt from "bcryptjs"

export const crearCobrador = async (req, res) => {
  try {
    const nombre = req.body.nombre.trim()
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password.trim()

    const hashedPassword = await bcrypt.hash(password, 10)

    const nuevoCobrador = new Cobrador({
      nombre,
      email,
      password: hashedPassword
    })

    await nuevoCobrador.save()

    res.status(201).json(nuevoCobrador)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const listarCobradores = async (req, res) => {
  try {
    const cobradores = await Cobrador.find()
    res.json(cobradores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
