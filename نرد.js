const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'زار', // غيرنا الاسم من نرد الى زار
    description: 'العب زار عالحصيرة وية الجماعة (رهان)',
    async execute(message, db, config, args) {
        try {
            const userId = message.author.id;
            let currentBalance = await db.get(`balance_${userId}`) || 0;

            if (currentBalance <= 0) {
                return message.reply('جيبك فارغ! روح جدي وتعال العب زار 🥫.');
            }

            let diceType = args[0];
            let betAmount;

            // تحديد المبلغ
            switch (diceType) {
                case 'نص':
                    betAmount = Math.round(currentBalance / 2);
                    break;
                case 'ربع':
                    betAmount = Math.round(currentBalance / 4);
                    break;
                case 'كل':
                default:
                    betAmount = currentBalance;
                    break;
            }

            // رمي الزار (من 1 الى 100)
            const userChoice = Math.floor(Math.random() * 100) + 1;
            const botChoice = Math.floor(Math.random() * 100) + 1;

            let resultMessage;
            if (userChoice > botChoice) {
                const winnings = betAmount * 2; // الربح دبل
                currentBalance += winnings;
                resultMessage = `🎲 **طكت وياك!** (دوشيش)\n\n👤 **أنت ذبيت:** ${userChoice}\n🤖 **أني ذبيت:** ${botChoice}\n\n💰 **الربح:** ${winnings.toLocaleString()} 🥫\n📈 **رصيدك الجديد:** ${currentBalance.toLocaleString()} 🥫`;
            } else {
                const lossAmount = betAmount;
                currentBalance -= lossAmount;
                resultMessage = `🎲 **راحت عليك!** (يك)\n\n👤 **أنت ذبيت:** ${userChoice}\n🤖 **أني ذبيت:** ${botChoice}\n\n💸 **خسرت:** ${lossAmount.toLocaleString()} 🥫\n📉 **رصيدك الجديد:** ${currentBalance.toLocaleString()} 🥫`;
            }

            await db.set(`balance_${userId}`, currentBalance);

            message.reply({
                content: resultMessage,
                allowedMentions: { repliedUser: false },
                // ephemeral: true // شلت الاخفاء حتى الكل يشوف الفضيحة او الفوز 😂
            });
        } catch (error) {
            console.error('Error executing زار command:', error);
            message.reply('الزار ضاع! صار خطأ باللعبة.');
        }
    }
};
