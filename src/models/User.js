import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    cedula: { type: String, required: true },
    celular: { type: String, required: true },
    direccion: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: { type: String, required: true },
    rol: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN", "COBRADOR"],  
      required: true
    },
    habilitado: {
      type: Boolean,
      default: true
    },
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      default: null   //
    }
  },
  { timestamps: true }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

export default mongoose.model("User", userSchema)