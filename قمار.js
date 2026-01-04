module.exports = {
    name: 'رهان', // غيرنا الاسم من قمار الى رهان
    description: 'راهن بقواطيك على مصارعة ديچة 🐓 (يا تصيب يا تخيب)',
    async execute(message, db, config, args) {
        try {
            const userId = message.author.id;
            let currentBalance = await db.get(`balance_${userId}`) || 0;

            if (currentBalance <= 0) {
                return message.reply('جيبك فارغ! روح جدي وتعال راهن 🥫.');
            }

            let betAmount;
            let gambleType = args[0];

            // تحديد المبلغ (رقم أو نص/ربع/كل)
            if (!isNaN(gambleType)) {
                betAmount = parseInt(gambleType, 10);
                if (betAmount > currentBalance) {
                    return message.reply('على كيفك! ما عندك هيج مبلغ، لا تهايط.');
                }
            } else {
                switch (gambleType) {
                    case 'نص':
                        betAmount = Math.round(currentBalance / 2);
                        break;
                    case 'ربع':
                        betAmount = Math.round(currentBalance / 4);
                        break;
                    case 'كل':
                        betAmount = currentBalance;
                        break;
                    default:
                        return message.reply('شكد تريد تذب؟ (اكتب رقم، أو: كل، نص، ربع).');
                }
            }

            // اللعبة (50% فوز أو خسارة)
            const isWin = Math.random() < 0.5;
            const multiplier = isWin ? config.gambleMultiplier : 1 - Math.random() * 0.3;
            const resultAmount = Math.round(betAmount * multiplier);
            
            // معادلة الرصيد الجديد
            const newBalance = isWin ? currentBalance + (resultAmount - betAmount) : currentBalance - (betAmount - resultAmount);

            await db.set(`balance_${userId}`, newBalance);

            let messageContent;
            if (isWin) {
                // رسالة الفوز (الديچ فاز)
                messageContent = `🐓 **عفية بالذيب!**\nراهنت على الديچ "أبو خريزة" وكسر راس خصمه! 🔥\n\n💰 **الربح:** ${resultAmount.toLocaleString()} 🥫\n📈 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
            } else {
                // رسالة الخسارة (الديچ شرد)
                messageContent = `🐔 **يا فشلة!**\nالديچ مالتك طلع دجاجة وشرد من الحلبة! 🏃‍♂️\n\n💸 **خسرت:** ${Math.abs(betAmount - resultAmount).toLocaleString()} 🥫\n📉 **رصيدك الجديد:** ${newBalance.toLocaleString()} 🥫`;
            }

            message.reply({
                content: messageContent,
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('Error executing gamble command:', error);
            message.reply('الشرطة طبوا للحلبة! تفركش الرهان.');
        }
    }
};
