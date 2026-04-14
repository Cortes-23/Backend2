import TelegramBot from "node-telegram-bot-api"

// ⚠️ IMPORTANTE: cambia este token después (lo expusiste)
const token = "8735796615:AAFML5YQzN8FhqOuTGz21tmIOnrXpj6Nkds"

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
})

// comando inicio
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bienvenido al sistema de préstamos 💰")
})

// comando préstamo
bot.onText(/\/prestamo/, (msg) => {
  bot.sendMessage(msg.chat.id, "Ingresa el monto del préstamo:")
})

// escuchar mensajes normales
bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  if (!isNaN(text)) {
    bot.sendMessage(chatId, `Registrando préstamo por: ${text}`)
  }
})