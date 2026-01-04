module.exports = {
    name: 'سوق', // غيرنا الاسم من تداول الى سوق_مريدي
    description: 'بيع واشتري خردة بالسوك (مخاطرة عالية)',
    async execute(message, db, config, args) {
        try {
            const userId = message.author.id;
            let currentBalance = await db.get(`balance_${userId}`) || 0;

            if (currentBalance <= 0) {
                return message.reply('جيبك فارغ! ما عندك قواطي تتاجر بيها بالسوك 🥫.');
            }

            let tradingType = args[0];
            let tradingAmount;

            // تحديد المبلغ
            switch (tradingType) {
                case 'نص':
                    tradingAmount = Math.round(currentBalance / 2);
                    break;
                case 'ربع':
                    tradingAmount = Math.round(currentBalance / 4);
                    break;
                case 'كل':
                default:
                    tradingAmount = currentBalance;
                    break;
            }

            // نسبة الفوز 40% (لأن سوق مريدي خطر)
            const isWin = Math.random() < 0.4;
            let multiplier = isWin ? (1 + Math.random() * 0.5) : 1 - Math.random() * 0.5; // زيدت الربح شوية لان المخاطرة عالية

            if (isNaN(multiplier)) {
                multiplier = 1;
            }

            const resultAmount = Math.round(tradingAmount * multiplier);
            const newBalance = currentBalance - tradingAmount + resultAmount;

            await db.set(`balance_${userId}`, newBalance);

            let messageContent;
            if (isWin) {
                // رسالة الربح
                messageContent = `🚜 **صفقة لقطة!**\nاشتريت دريل عطلان وصلحته وبعته بالسوك! ربحت بنسبة **${Math.round((multiplier - 1) * 100)}%**\n\n💰 **الربح:** ${resultAmount.toLocaleString()} 🥫\n📉 **رصيدك القديم:** ${currentBalance.toLocaleString()} 🥫\n📈 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
            } else {
                // رسالة الخسارة
                messageContent = `🚓 **كبسة!**\nاشتريت أيفون 15 طلع بداخله صابونة ركي! 🧼 خسرت بنسبة **${Math.round((1 - multiplier) * 100)}%**\n\n💸 **الخسارة:** ${Math.abs(resultAmount).toLocaleString()} 🥫\n📉 **رصيدك القديم:** ${currentBalance.toLocaleString()} 🥫\n📉 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
            }

            message.reply({
                content: messageContent,
                allowedMentions: { repliedUser: false }
            });

            console.log('Trading Amount:', tradingAmount);
            console.log('Multiplier:', multiplier);
            console.log('Result Amount:', resultAmount);
            console.log('New Balance:', newBalance);
        } catch (error) {
            console.error('Error executing trade command:', error);
            message.reply('صار عركة بالسوك وتفركشت البيعة! حاول مرة ثانية.');
        }
    }
};