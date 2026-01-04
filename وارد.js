const companies = require('./companiesData');
const { isInCooldown, setCooldown, getRemainingCooldown } = require('../utils/cooldown.js');

module.exports = {
    name: 'وارد',
    description: 'لم الغلة (الأرباح) من البسطيات والمنامات',
    async execute(message, db, config) {
        try {
            const userId = message.author.id;

            // 1. نشيك الوقت
            const cooldownTime = config.cooldowns['وارد'] || 3600000;

            if (isInCooldown('وارد', userId, config)) {
                const remainingTime = getRemainingCooldown('وارد', userId, config);
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                return message.reply(`🛑 **على كيفك!**\nتوج لميت الغلة! ارجع لم الفلوس بعد **${minutes} دقيقة**.`);
            }

            let totalIncome = 0;
            let incomeSources = [];

            // --- أولاً: حساب أرباح البسطيات ---
            const userCompanies = await db.get(`user_${userId}_companies`) || [];
            for (const companyId of userCompanies) {
                const company = companies.find(c => c.id === companyId);
                if (company) {
                    totalIncome += company.rent;
                    incomeSources.push(`🛒 بسطية: ${company.rent}`);
                }
            }

            // --- ثانياً: حساب أرباح المنامات (المنازل) ---
            for (let i = 1; i <= 5; i++) {
                const houseData = await db.get(`house_${i}`);
                if (houseData && houseData.owner === userId) {
                    totalIncome += houseData.income;
                    incomeSources.push(`⛺ منامة #${i}: ${houseData.income}`);
                }
            }

            if (totalIncome === 0) {
                return message.reply('ما عندك لا بسطية ولا مكان تنام بيه يجيب فلوس! 🏚️\n(روح اشتري بـ `!شراء_بسطية` أو `!حجز`).');
            }

            // 2. إضافة الفلوس للرصيد
            let currentBalance = await db.get(`balance_${userId}`) || 0;
            const newBalance = currentBalance + totalIncome;
            await db.set(`balance_${userId}`, newBalance);

            // 3. تفعيل وقت الانتظار
            setCooldown('وارد', userId, cooldownTime);

            message.reply(`💰 **عفية! لميت الغلة:**\n\n${incomeSources.join('\n')}\n\n💵 **المجموع:** ${totalIncome.toLocaleString()} 🥫\n🎒 **صار بجيبك:** ${newBalance.toLocaleString()} 🥫`);

        } catch (error) {
            console.error('Error executing وارد command:', error);
            message.reply('صار عركة عالفلوس وما كدرت تلم الوارد!');
        }
    }
};
