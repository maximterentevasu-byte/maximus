const { Telegraf, Markup } = require('telegraf');
const XLSX = require('xlsx');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

const ADMIN_ID = 758972533;
const EXCEL_FILE_PATH = path.join(__dirname, 'CLIENT_EXPORT.xlsx');

// Нормализация телефона
function normalizePhone(phone) {
    if (!phone) return '';

    let cleaned = String(phone).replace(/\D/g, '');

    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        cleaned = '7' + cleaned.slice(1);
    }

    return cleaned;
}

// Поиск ссылки карты по номеру телефона
function findCardLinkByPhone(phone) {
    const normalizedPhone = normalizePhone(phone);

    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ''
    });

    // E = индекс 4
    // P = индекс 15
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const excelPhone = normalizePhone(row[4]);
        const cardLink = String(row[15] || '').trim();

        if (excelPhone && excelPhone === normalizedPhone) {
            return cardLink;
        }
    }

    return null;
}

// Красивое имя пользователя для сообщений
function getUserDisplayName(user) {
    if (!user) return 'без имени';

    if (user.username) {
        return `@${user.username}`;
    }

    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : 'без имени';
}

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
bot.on('contact', async (ctx) => {
    try {
        const contact = ctx.message.contact;
        const phone = contact?.phone_number;
        const user = ctx.from;
        const userName = getUserDisplayName(user);

        // Если Telegram contact не передал номер телефона
        if (!phone) {
            await bot.telegram.sendMessage(
                ADMIN_ID,
                `Пользователь ${userName} не смог скачать электронную карту.`
            );

            await ctx.reply(
                'Невозможно идентифицировать карту по номеру телефона, мы отправили запрос администратору сервиса.',
                Markup.keyboard([['На главный экран']]).resize()
            );

            return;
        }

        await ctx.reply(
            `Контакт получен:\nИмя: ${contact.first_name || '-'}\nТелефон: ${phone}`,
            Markup.keyboard([['На главный экран']]).resize()
        );

        const cardLink = findCardLinkByPhone(phone);

        if (cardLink) {
            await ctx.reply(
                'Твоя бонусная карта готова 🎉\nНажми кнопку ниже, чтобы скачать:',
                Markup.inlineKeyboard([
                    [Markup.button.url('Скачать карту', cardLink)]
                ])
            );
        } else {
            await ctx.reply(
                'К сожалению, номер не найден в клиентской базе.',
                Markup.keyboard([['На главный экран']]).resize()
            );
        }
    } catch (error) {
        console.error('Ошибка при обработке контакта:', error);

        const userName = getUserDisplayName(ctx.from);

        try {
            await bot.telegram.sendMessage(
                ADMIN_ID,
                `Пользователь ${userName} не смог скачать электронную карту.`
            );
        } catch (adminError) {
            console.error('Ошибка отправки сообщения админу:', adminError);
        }

        await ctx.reply(
            'Невозможно идентифицировать карту по номеру телефона, мы отправили запрос администратору сервиса.',
            Markup.keyboard([['На главный экран']]).resize()
        );
    }
});

// Возврат в меню
bot.hears('На главный экран', (ctx) => {
    return mainMenu(ctx);
});

bot.launch();
console.log('Bot started...');