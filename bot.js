const { Telegraf, Markup } = require('telegraf');
const XLSX = require('xlsx');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Путь к Excel-файлу
const EXCEL_FILE_PATH = path.join(__dirname, 'CLIENT_EXPORT.xlsx');

// Нормализация телефона:
// оставляем только цифры
// 8XXXXXXXXXX -> 7XXXXXXXXXX
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

    // Получаем строки как массив массивов
    // header: 1 => первая строка не считается заголовком объекта
    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ''
    });

    // E = индекс 4
    // P = индекс 15
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const excelPhone = normalizePhone(row[4]);
        const cardLink = row[15];

        if (excelPhone && excelPhone === normalizedPhone) {
            return String(cardLink).trim();
        }
    }

    return null;
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
        const phone = contact.phone_number;

        // Сначала показываем номер в чат
        await ctx.reply(
            `Контакт получен:\nИмя: ${contact.first_name || '-'}\nТелефон: ${phone || '-'}`,
            Markup.keyboard([['На главный экран']]).resize()
        );

        const cardLink = findCardLinkByPhone(phone);

        if (cardLink) {
            await ctx.reply(`Держи ссылку для скачивания бонусной карты - ${cardLink}`);
        } else {
            await ctx.reply('К сожалению, номер не найден в клиентской базе.');
        }
    } catch (error) {
        console.error('Ошибка при обработке контакта:', error);
        await ctx.reply('Произошла ошибка при поиске бонусной карты.');
    }
});

// Возврат в меню
bot.hears('На главный экран', (ctx) => {
    return mainMenu(ctx);
});

bot.launch();
console.log('Bot started...');