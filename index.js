const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const phrases = new Map();
const active = new Set();

bot.command("set", (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!text) return ctx.reply("مثال: /set سلام");
  phrases.set(ctx.chat.id, text);
  return ctx.reply("متن ذخیره شد.");
});

bot.command("on", async (ctx) => {
  const id = ctx.chat.id;
  if (active.has(id)) return ctx.reply("بات روشن است.");

  active.add(id);
  await ctx.reply("بات روشن شد.");

  try {
    await ctx.reply(phrases.get(id) || "سلام");
  } catch (e) {
    console.error(e.message);
    active.delete(id);
  }
});

bot.command("off", (ctx) => {
  active.delete(ctx.chat.id);
  return ctx.reply("بات خاموش شد.");
});

bot.launch().then(() => console.log("Bot started"));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
