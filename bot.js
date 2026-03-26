const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Привет 👋'));

bot.on('text', (ctx) => {
    ctx.reply('Ты написал: ' + ctx.message.text);
});

bot.launch();

console.log('Bot started...');