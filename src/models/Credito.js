import mongoose from "mongoose"

const abonoSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    default: Date.now
  }
})

const creditoSchema = new mongoose.Schema({

  estado: {
    type: String,
    enum: ["PENDIENTE", "PAGADO"],
    default: "PENDIENTE"
  },

  fechaOrigen: {
    type: Date,
    default: Date.now
  },

  fechaPago: {
    type: Date,
    required: true
  },

  montoPrestamo: {
    type: Number,
    required: true,
    min: 0
  },

  montoAPagar: {
    type: Number,
    required: true,
    min: 0
  },

  saldoPendiente: {
    type: Number,
    required: true,
    min: 0
  },

  abonos: [abonoSchema],

  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },

  cobradorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",         
    required: true
  },

  officeId: {             
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true
  }

}, { timestamps: true })

export default mongoose.model("Credito", creditoSchema)