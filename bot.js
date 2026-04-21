import TelegramBot from "node-telegram-bot-api"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

// 🔐 TOKEN
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
})

// 🌐 API (OBLIGATORIO)
const API = process.env.API_URL

if (!API) {
  console.error("❌ API_URL no está definida en .env")
  process.exit(1)
}

// 🧠 Estados y sesiones
const userState = {}
const userSessions = {}

// 🔹 MENÚ
function menu(chatId) {
  bot.sendMessage(chatId, "📌 Menú del cobrador:", {
    reply_markup: {
      keyboard: [
        ["🔐 Iniciar sesión"],
        ["👤 Crear cliente", "📋 Ver clientes"],
        ["💰 Crear préstamo", "📊 Ver deudas"],
        ["💵 Pagar cuota", "📉 Ver saldo"],
        ["❌ Cancelar"]
      ],
      resize_keyboard: true
    }
  })
}

// 🔹 INICIO
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bienvenido al sistema de cobranzas 💰")
  menu(msg.chat.id)
})

// 🔹 CANCELAR
bot.onText(/\/cancelar/, (msg) => {
  delete userState[msg.chat.id]
  bot.sendMessage(msg.chat.id, "❌ Operación cancelada")
  menu(msg.chat.id)
})

// 🔒 ACCIONES QUE REQUIEREN LOGIN
const accionesProtegidas = [
  "👤 Crear cliente",
  "📋 Ver clientes",
  "💰 Crear préstamo",
  "📊 Ver deudas",
  "💵 Pagar cuota",
  "📉 Ver saldo"
]

// 🔹 LÓGICA PRINCIPAL
bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  if (!text || text.startsWith("/")) return

  const state = userState[chatId]

  // 🔒 Validar sesión
  if (accionesProtegidas.includes(text) && !userSessions[chatId]) {
    return bot.sendMessage(chatId, "🔐 Debes iniciar sesión primero")
  }

  // ========================
  // 🔐 LOGIN COBRADOR
  // ========================
  if (text === "🔐 Iniciar sesión") {
    userState[chatId] = { step: "login_email" }
    return bot.sendMessage(chatId, "📧 Ingresa tu correo:")
  }

  if (state?.step === "login_email") {
    state.email = text
    state.step = "login_password"
    return bot.sendMessage(chatId, "🔑 Ingresa tu contraseña:")
  }

  if (state?.step === "login_password") {
    try {
      const res = await axios.post(`${API}/api/auth/login-cobrador`, {
        email: state.email,
        password: text
      })

      userSessions[chatId] = {
        token: res.data.token,
        user: res.data.user
      }

      console.log("✅ LOGIN OK:", res.data.user)

      bot.sendMessage(chatId, "✅ Sesión iniciada correctamente")
    } catch (error) {
      console.log("❌ ERROR LOGIN:", error.response?.data || error.message)
      bot.sendMessage(chatId, "❌ Credenciales incorrectas")
    }

    delete userState[chatId]
    return menu(chatId)
  }

  // ========================
  // 👤 CREAR CLIENTE
  // ========================
  if (text === "👤 Crear cliente") {
    userState[chatId] = { step: "nombre" }
    return bot.sendMessage(chatId, "👤 Nombre del cliente:")
  }

  if (state?.step === "nombre") {
    state.nombre = text
    state.step = "cedula"
    return bot.sendMessage(chatId, "🆔 Cédula:")
  }

  if (state?.step === "cedula") {
    state.cedula = text
    state.step = "telefono"
    return bot.sendMessage(chatId, "📞 Teléfono:")
  }

  if (state?.step === "telefono") {
    state.telefono = text
    state.step = "direccion"
    return bot.sendMessage(chatId, "📍 Dirección:")
  }

  if (state?.step === "direccion") {
    const session = userSessions[chatId]

    try {
      await axios.post(
        `${API}/api/clientes`,
        {
          nombre: state.nombre,
          cedula: state.cedula,
          telefono: state.telefono,
          direccion: state.direccion
        },
        {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        }
      )

      bot.sendMessage(chatId, "✅ Cliente creado")
    } catch (error) {
      console.log("❌ ERROR CLIENTE:", error.response?.data)
      bot.sendMessage(chatId, "❌ Error al crear cliente")
    }

    delete userState[chatId]
    return menu(chatId)
  }

  // ========================
  // 📋 VER CLIENTES
  // ========================
  if (text === "📋 Ver clientes") {
    const session = userSessions[chatId]

    try {
      const res = await axios.get(`${API}/api/clientes`, {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      })

      if (!res.data.length) {
        return bot.sendMessage(chatId, "No hay clientes")
      }

      let msg = "👤 Clientes:\n\n"
      res.data.slice(0, 10).forEach((c) => {
        msg += `🧾 ${c.nombre} - ${c.cedula}\n`
      })

      bot.sendMessage(chatId, msg)
    } catch (error) {
      console.log("❌ ERROR LISTAR:", error.response?.data)
      bot.sendMessage(chatId, "❌ Error al consultar")
    }
  }

  // ========================
  // 💰 CREAR PRÉSTAMO
  // ========================
  if (text === "💰 Crear préstamo") {
    userState[chatId] = { step: "prestamo_cliente" }
    return bot.sendMessage(chatId, "🆔 ID del cliente:")
  }

  if (state?.step === "prestamo_cliente") {
    state.cliente = text
    state.step = "prestamo_monto"
    return bot.sendMessage(chatId, "💰 Monto:")
  }

  if (state?.step === "prestamo_monto") {
    const monto = Number(text)

    if (isNaN(monto)) {
      return bot.sendMessage(chatId, "❌ Número inválido")
    }

    const interes = monto * 0.2
    const total = monto + interes

    state.monto = monto
    state.total = total
    state.step = "confirmar"

    return bot.sendMessage(
      chatId,
      `💰 Monto: ${monto}\n📈 Interés: ${interes}\n📊 Total: ${total}\n\nEscribe SI para confirmar`
    )
  }

  if (state?.step === "confirmar") {
    if (text.toLowerCase() !== "si") {
      delete userState[chatId]
      return bot.sendMessage(chatId, "❌ Cancelado")
    }

    const session = userSessions[chatId]

    try {
      await axios.post(
        `${API}/api/creditos`,
        {
          cliente: state.cliente,
          monto: state.monto,
          total: state.total,
          saldo: state.total
        },
        {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        }
      )

      bot.sendMessage(chatId, "✅ Préstamo creado")
    } catch (error) {
      console.log("❌ ERROR PRESTAMO:", error.response?.data)
      bot.sendMessage(chatId, "❌ Error al crear préstamo")
    }

    delete userState[chatId]
    return menu(chatId)
  }

})

console.log("🤖 Bot listo y conectado a:", API)