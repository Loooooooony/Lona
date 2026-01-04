module.exports = {
    name: 'يومي',
    description: 'استلم الحصة التموينية (توزيعات المنظمات)',
    async execute(message, db, config) {
        try {
            const userId = message.author.id;
            const cooldownKey = `cooldown_daily_${userId}`;
            const lastUsed = await db.get(cooldownKey);
            const now = Date.now();

            // التحقق من الوقت (التبريد)
            if (lastUsed && (now - lastUsed) < config.cooldowns['يومي']) {
                const remainingTime = config.cooldowns['يومي'] - (now - lastUsed);
                const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                return message.reply(`ماكو توزيعات هسه! 🛑\nالمنظمة الخيرية تجي باجر.\nتعال راجعنا بعد **${hours} ساعة و ${minutes} دقيقة**.`);
            }

            // مبلغ الهدية (من 20 إلى 50 قوطية - تقشف)
            const giftAmount = Math.floor(Math.random() * 30) + 20; 
            
            let userBalance = await db.get(`balance_${userId}`) || 0;
            userBalance += giftAmount;

            await db.set(`balance_${userId}`, userBalance);
            await db.set(cooldownKey, now);

            message.reply(`🎁 **توزيعات!**\nاجت سيارة المساعدات للمخيم وحصلت "كرتونة" بيها **${giftAmount.toLocaleString()}** 🥫.\n💰 **صار بجيبك:** ${userBalance.toLocaleString()} 🥫.\n(ضمها لليوم الأسود!).`);
        } catch (error) {
            console.error('Error executing يومي command:', error);
            message.reply('السيارة عطلت بالطريق! ما وصلتك الهدية، حاول بعدين.');
        }
    }
};
