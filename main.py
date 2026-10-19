
import os
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OWNER_ID = int(os.getenv("OWNER_ID", "0"))

phrase = "سلام"


async def authorized(update: Update) -> bool:
    return (
        update.effective_user is not None
        and update.effective_user.id == OWNER_ID
    )


async def set_phrase(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    global phrase

    if not await authorized(update):
        return

    if not context.args:
        await update.effective_message.reply_text(
            "استفاده: /set عبارت دلخواه"
        )
        return

    phrase = " ".join(context.args)
    await update.effective_message.reply_text(
        f"عبارت تنظیم شد: {phrase}"
    )


async def on_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    if not await authorized(update):
        return

    await update.effective_message.reply_text(
        "بات روشن شد؛ نسخه فعلی آزمایشی است."
    )


async def off_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):
    if not await authorized(update):
        return

    await update.effective_message.reply_text(
        "بات خاموش شد."
    )


async def main():
    if not TOKEN:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN تنظیم نشده است."
        )

    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("set", set_phrase))
    app.add_handler(CommandHandler("on", on_command))
    app.add_handler(CommandHandler("off", off_command))

    await app.initialize()
    await app.start()
    await app.updater.start_polling()

    print("Bot is running")

    import asyncio
    try:
        await asyncio.Event().wait()
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
  
