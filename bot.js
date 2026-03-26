const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Главное меню
function mainMenu(ctx) {
    ctx.reply(
        'Привет! Я бот бонусной программы Pick me. Выбери интересующий тебя пункт:',
        Markup.keyboard([
            ['Подключиться к бонусной программе'],
            ['Скачать бонусную карту на телефон']
        ])
        .resize()
    );
}

// Команда /start
bot.start((ctx) => {
    mainMenu(ctx);
});

// Кнопка 1
bot.hears('Подключиться к бонусной программе', (ctx) => {
    ctx.reply(
        'Для регистрации в бонусной программе заполни анкету:\nhttps://card.evobonus.ru/form/74e48448-1975-4bca-a455-92ec9a4bbf76',
        Markup.keyboard([
            ['На главный экран']
        ])
        .resize()
    );
});

// Кнопка назад
bot.hears('На главный экран', (ctx) => {
    mainMenu(ctx);
});

// Кнопка 2 (пока заглушка)
bot.hears('Скачать бонусную карту на телефон', (ctx) => {
    ctx.reply('Ссылка для скачивания карты скоро появится');
});

bot.launch();

console.log('Bot started...');