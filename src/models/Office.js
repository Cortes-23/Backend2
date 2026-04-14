import mongoose from "mongoose"

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  address: { type: String },
  phone: { type: String },
  active: { type: Boolean, default: true },  
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model("Office", officeSchema)