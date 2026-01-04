const { isInCooldown, setCooldown } = require('../utils/cooldown.js');

module.exports = {
    name: 'تشغيل', // غيرنا الاسم من استثمار الى تشغيل
    description: 'شغل قواطيك بالسوق (مخاطرة)',
    async execute(message, db, config, args) {
        const userId = message.author.id;
        let currentBalance = await db.get(`balance_${userId}`) || 0;

        if (currentBalance <= 0) {
            return message.reply('جيبك فارغ! ما عندك قواطي تشغلها، روح جدي بالأول 🥫.');
        }

        let investmentType = args[0];
        let investmentAmount;

        // تحديد المبلغ (نص، ربع، كل)
        switch (investmentType) {
            case 'نص':
                investmentAmount = Math.round(currentBalance / 2);
                break;
            case 'ربع':
                investmentAmount = Math.round(currentBalance / 4);
                break;
            case 'كل':
            default:
                investmentAmount = currentBalance;
                break;
        }

        const isWin = Math.random() < 0.5; // نسبة الربح والخسارة 50%
        const multiplier = isWin ? config.investmentMultiplier : 1 - Math.random() * 0.3;
        const resultAmount = Math.round(investmentAmount * multiplier);
        
        // حساب الرصيد الجديد
        const newBalance = isWin ? currentBalance - investmentAmount + resultAmount : currentBalance - investmentAmount + resultAmount;

        await db.set(`balance_${userId}`, newBalance);

        let messageContent;
        if (isWin) {
            // رسالة الربح (تحشيش)
            messageContent = `🎉 **طكت وياك!**\nانطيت قواطيك لواحد يبيع لبلبي وربحك منهن نسبة **${Math.round((multiplier - 1) * 100)}%**\n\n💰 **الربح:** ${resultAmount.toLocaleString()} 🥫\n📉 **رصيدك القديم:** ${currentBalance.toLocaleString()} 🥫\n📈 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
        } else {
            // رسالة الخسارة (تحشيش)
            messageContent = `😢 **أكلتها!**\nشريكك انكمش من البلدية وصادروا البسطية، راحت عليك نسبة **${Math.round((1 - multiplier) * 100)}%**\n\n💸 **الخسارة:** ${Math.abs(resultAmount).toLocaleString()} 🥫\n📉 **رصيدك القديم:** ${currentBalance.toLocaleString()} 🥫\n📉 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
        }

        message.reply({
            content: messageContent,
            allowedMentions: { repliedUser: false }
        });
    }
};
