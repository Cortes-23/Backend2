import mongoose from "mongoose"

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },

  cedula: {
    type: String,
    required: true,
    trim: true
  },

  telefono: {
    type: String,
    trim: true
  },

  direccion: {
    type: String,
    trim: true
  },

  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  officeId: {                                   // ← nuevo: aísla clientes por tenant
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true
  }

}, {
  timestamps: true
})

// Cédula única POR oficina (no global)
clienteSchema.index({ cedula: 1, officeId: 1 }, { unique: true })

export default mongoose.model("Cliente", clienteSchema)