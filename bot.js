const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Главное меню
function mainMenu(ctx) {
    return ctx.reply(
        'Привет! Я бот бонусной программы Pick me. Выбери интересующий тебя пункт:',
        Markup.keyboard([
            ['Подключиться к бонусной программе'],
            ['Скачать бонусную карту на телефон']
        ]).resize()
    );
}

// /start
bot.start((ctx) => {
    return mainMenu(ctx);
});

// Кнопка 1
bot.hears('Подключиться к бонусной программе', (ctx) => {
    return ctx.reply(
        'Для регистрации в бонусной программе заполни <a href="https://card.evobonus.ru/form/74e48448-1975-4bca-a455-92ec9a4bbf76">анкету</a>',
        {
            parse_mode: 'HTML',
            ...Markup.keyboard([['На главный экран']]).resize()
        }
    );
});

// Кнопка 2
bot.hears('Скачать бонусную карту на телефон', (ctx) => {
    return ctx.reply(
        'Нажми кнопку ниже, чтобы отправить свой контакт:',
        Markup.keyboard([
            [Markup.button.contactRequest('Отправить контакт')],
            ['На главный экран']
        ]).resize()
    );
});

// Получение контакта
bot.on('contact', (ctx) => {
    const contact = ctx.message.contact;

    return ctx.reply(
        `Контакт получен:\nИмя: ${contact.first_name || '-'}\nТелефон: ${contact.phone_number || '-'}`,
        Markup.keyboard([['На главный экран']]).resize()
    );
});

// Возврат в меню
bot.hears('На главный экран', (ctx) => {
    return mainMenu(ctx);
});

bot.launch();
console.log('Bot started...');