
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, { polling: true });

let phrase = "سلام";
let activeChat = null;
let interval = null;
let stopTimeout = null;

function stopSending() {
  if (interval) clearInterval(interval);
  if (stopTimeout) clearTimeout(stopTimeout);

  interval = null;
  stopTimeout = null;
  activeChat = null;
}

bot.onText(/^\/set(?:@\w+)?(?:\s+([\s\S]+))?$/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = (match[1] || "").trim();

  if (!text) {
    return bot.sendMessage(chatId, "مثال: /set سلام دوستان");
  }

  phrase = text;
  bot.sendMessage(chatId, "عبارت ذخیره شد.");
});

bot.onText(/^\/on(?:@\w+)?$/, (msg) => {
  const chatId = msg.chat.id;

  if (activeChat !== null) {
    return bot.sendMessage(chatId, "ارسال از قبل فعال است.");
  }

  activeChat = chatId;

  bot.sendMessage(chatId, "ارسال فعال شد؛ هر ۳۰ ثانیه یک پیام.");

  interval = setInterval(() => {
    if (activeChat !== null) {
      bot.sendMessage(activeChat, phrase).catch(console.error);
    }
  }, 30000);

  stopTimeout = setTimeout(() => {
    const oldChat = activeChat;
    stopSending();

    if (oldChat !== null) {
      bot.sendMessage(
        oldChat,
        "ارسال پس از ۱۲ ساعت متوقف شد. برای ادامه /on را بفرستید."
      ).catch(console.error);
    }
  }, 12 * 60 * 60 * 1000);
});

bot.onText(/^\/off(?:@\w+)?$/, (msg) => {
  if (activeChat === null) {
    return bot.sendMessage(msg.chat.id, "ارسالی فعال نیست.");
  }

  stopSending();
  bot.sendMessage(msg.chat.id, "ارسال متوقف شد.");
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("Telegram bot started");
    
