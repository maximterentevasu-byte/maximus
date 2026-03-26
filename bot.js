// Кнопка 2 - скачать бонусную карту
bot.hears('Скачать бонусную карту на телефон', (ctx) => {
    ctx.reply(
        'Для идентификации отправьте ваш номер телефона:',
        Markup.keyboard([
            Markup.button.contactRequest('Отправить номер телефона'),
            ['На главный экран']
        ]).resize()
    );
});

// Обработка контакта
bot.on('contact', (ctx) => {
    const phone = ctx.message.contact.phone_number;

    // Отправляем админу
    bot.telegram.sendMessage(
        ADMIN_ID,
        `Пользователь: @${ctx.from.username || ctx.from.first_name}\nID: ${ctx.from.id}\nНомер телефона: ${phone}`
    );

    // Пользователю сообщение
    ctx.reply(
        `Спасибо! Ваш номер ${phone} получен. Ожидайте, с вами свяжется админ.`,
        Markup.keyboard([['На главный экран']]).resize()
    );
});