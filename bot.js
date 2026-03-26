const { Telegraf, Markup } = require('telegraf');

// Ваш токен
const bot = new Telegraf(process.env.BOT_TOKEN);

// ID администратора
const ADMIN_ID = 758972533;

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

// Старт
bot.start((ctx) => mainMenu(ctx));

// Кнопка 1 - подключение к бонусной программе
bot.hears('Подключиться к бонусной программе', (ctx) => {
    ctx.reply(
        'Для регистрации в бонусной программе заполни <a href="https://card.evobonus.ru/form/74e48448-1975-4bca-a455-92ec9a4bbf76">анкету</a>',
        {
            parse_mode: 'HTML',
            ...Markup.keyboard([['На главный экран']]).resize()
        }
    );
});

// Кнопка 2 - скачать бонусную карту
bot.hears('Скачать бонусную карту на телефон', async (ctx) => {
    // Проверяем, есть ли у пользователя номер телефона
    const phone = ctx.message.contact ? ctx.message.contact.phone_number : null;

    if (!phone) {
        // Номер не привязан
        ctx.reply(
            'К вашему аккаунту ТГ не привязан номер телефона, идентификация в бонусной программе невозможна. Отправить запрос Админу?',
            Markup.keyboard([['Отправить'], ['На главный экран']]).resize()
        );
    } else {
        // Если номер есть (редкий случай)
        ctx.reply(`Ваш номер: ${phone}`);
    }
});

// Кнопка "На главный экран"
bot.hears('На главный экран', (ctx) => mainMenu(ctx));

// Кнопка "Отправить" (если телефон не привязан)
bot.hears('Отправить', (ctx) => {
    ctx.reply(
        'Напишите номер телефона, к которому привязана бонусная карта:',
        Markup.keyboard([['На главный экран']]).resize()
    );

    // Сохраняем состояние, что пользователь сейчас отправляет номер
    ctx.session = { waitingPhone: true };
});

// Обработка текстового сообщения (для ввода номера)
bot.on('text', (ctx) => {
    // Если пользователь вводит телефон
    if (ctx.session && ctx.session.waitingPhone) {
        const phone = ctx.message.text;

        // Отправляем админу
        bot.telegram.sendMessage(
            ADMIN_ID,
            `Пользователь: @${ctx.from.username || ctx.from.first_name}\nID: ${ctx.from.id}\nНомер телефона: ${phone}`
        );

        // Пользователю сообщение
        ctx.reply(
            'Ожидайте, с вами свяжется админ.',
            Markup.keyboard([['На главный экран']]).resize()
        );

        // Сбрасываем состояние
        ctx.session.waitingPhone = false;
    }
});

// Оставляем заглушку для кнопки "Скачать бонусную карту" когда контакт есть
bot.on('contact', (ctx) => {
    ctx.reply(`Спасибо, ваш номер: ${ctx.message.contact.phone_number}`, Markup.keyboard([['На главный экран']]).resize());
});

bot.launch();

console.log('Bot started...');