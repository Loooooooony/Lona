module.exports = {
    name: 'يانصيب', // غيرنا الاسم من حظ الى يانصيب
    description: 'جرب حظك، يا تصيب يا تخيب',
    async execute(message, db, config) {
        try {
            const userId = message.author.id;
            let currentBalance = await db.get(`balance_${userId}`) || 0;

            // حساب المبلغ العشوائي
            const luckAmount = Math.floor(Math.random() * config.luckMaxAmount) + config.luckMinAmount;
            const newBalance = currentBalance + luckAmount;
            await db.set(`balance_${userId}`, newBalance);

            // رسالة الرد (تحشيش)
            message.reply(`🎟️ **يا هلا! لعبت يانصيب (أو لكيت شي بالكاع)!**\n\n🎁 **الرزقة:** ${luckAmount.toLocaleString()} 🥫\n💰 **صار بجيبك:** ${newBalance.toLocaleString()} 🥫`);
        } catch (error) {
            console.error('Error executing يانصيب command:', error);
            message.reply('الورقة انشقت! صار خطأ بالحظ، جرب بعدين.');
        }
    }
};
