module.exports = {
    name: 'توفي', // غيرنا الاسم من تسديد الى توفي (أرهم)
    description: 'سدد ديونك وخلص من المشاكل',
    async execute(message, db, config) {
        const userId = message.author.id;
        let currentBalance = await db.get(`balance_${userId}`) || 0;

        const outstandingLoan = await db.get(`loan_${userId}`);
        if (!outstandingLoan || outstandingLoan <= 0) {
            return message.reply('أنت نظيف! ✨\nما مطلوب لأحد، لا يضل بالك (نام مرتاح).');
        }

        if (currentBalance < outstandingLoan) {
            return message.reply(`منين توفي؟ 🌚\nأنت مطلوب **${outstandingLoan.toLocaleString()}** 🥫 وجيبك ما بيه كفاية.\nروح جدي وجمع المبلغ وتعال لا يجونك الديانة!`);
        }

        // خصم المبلغ ومسح الدين
        currentBalance -= outstandingLoan;
        await db.set(`balance_${userId}`, currentBalance);
        await db.delete(`loan_${userId}`);

        message.reply(`💸 **عفية زلمة/معدلة!**\nوفيت دينك وخلصت من طلابة "أبو المولدة" والديانة 🚪.\n\nانخصم من عندك **${outstandingLoan.toLocaleString()}** 🥫.\nبقى بجيبك **${currentBalance.toLocaleString()}** 🥫.`);
    }
};
