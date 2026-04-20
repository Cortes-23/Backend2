import TelegramBot from "node-telegram-bot-api"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
})

const API = process.env.API_URL || "http://localhost:3000"

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

// 🔹 COMANDOS
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bienvenido al sistema de cobranzas 💰")
  menu(msg.chat.id)
})

bot.onText(/\/menu/, (msg) => menu(msg.chat.id))

bot.onText(/\/cancelar/, (msg) => {
  delete userState[msg.chat.id]
  bot.sendMessage(msg.chat.id, "❌ Operación cancelada")
  menu(msg.chat.id)
})

// 🔒 PROTECCIÓN GLOBAL
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
      const res = await axios.post(`${API}/api/auth/login`, {
        email: state.email,
        password: text
      })

      userSessions[chatId] = {
        token: res.data.token,
        user: res.data.user
      }

      bot.sendMessage(chatId, "✅ Sesión iniciada correctamente")
    } catch (error) {
      console.log(error.response?.data || error.message)
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
    } catch {
      bot.sendMessage(chatId, "❌ Error al consultar")
    }
  }

  // ========================
  // 💰 CREAR PRÉSTAMO (20%)
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
      `💰 Monto: ${monto}\n📈 Interés: ${interes}\n📊 Total: ${total}\n\nEscribe SI`
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
    } catch {
      bot.sendMessage(chatId, "❌ Error préstamo")
    }

    delete userState[chatId]
    return menu(chatId)
  }

  // ========================
  // 📊 VER DEUDAS
  // ========================
  if (text === "📊 Ver deudas") {
    const session = userSessions[chatId]

    try {
      const res = await axios.get(`${API}/api/creditos`, {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      })

      let msg = "📊 Deudas:\n\n"

      res.data.forEach((c) => {
        msg += `👤 ${c.cliente}\n💰 ${c.total}\n📉 ${c.saldo}\n\n`
      })

      bot.sendMessage(chatId, msg)
    } catch {
      bot.sendMessage(chatId, "❌ Error")
    }
  }

  // ========================
  // 💵 PAGAR CUOTA
  // ========================
  if (text === "💵 Pagar cuota") {
    userState[chatId] = { step: "pago_id" }
    return bot.sendMessage(chatId, "🆔 ID crédito:")
  }

  if (state?.step === "pago_id") {
    state.credito = text
    state.step = "pago_valor"
    return bot.sendMessage(chatId, "💰 Valor a pagar:")
  }

  if (state?.step === "pago_valor") {
    const session = userSessions[chatId]

    try {
      await axios.post(
        `${API}/api/creditos/pagar`,
        {
          creditoId: state.credito,
          valor: text
        },
        {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        }
      )

      bot.sendMessage(chatId, "✅ Pago registrado")
    } catch {
      bot.sendMessage(chatId, "❌ Error en pago")
    }

    delete userState[chatId]
    return menu(chatId)
  }

  // ========================
  // 📉 VER SALDO
  // ========================
  if (text === "📉 Ver saldo") {
    userState[chatId] = { step: "saldo_id" }
    return bot.sendMessage(chatId, "🆔 ID crédito:")
  }

  if (state?.step === "saldo_id") {
    const session = userSessions[chatId]

    try {
      const res = await axios.get(`${API}/api/creditos/${text}`, {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      })

      const c = res.data

      bot.sendMessage(
        chatId,
        `📊 Total: ${c.total}\n📉 Saldo: ${c.saldo}`
      )
    } catch {
      bot.sendMessage(chatId, "❌ No encontrado")
    }

    delete userState[chatId]
    return menu(chatId)
  }
})

console.log("🤖 Bot listo y funcionando...")