module.exports = {
    name: 'جدي', // غيرنا الاسم من راتب الى جدي
    description: 'مد إيدك بالشارع واستلم المقسوم (الراتب)',

    async execute(message, db, config) {
        try {
            const userId = message.author.id;
            const currentJob = await db.get(`job_${userId}`);
            // اذا ما عنده راتب محدد، ياخذ الراتب الابتدائي (مال المساعدات)
            const currentSalary = await db.get(`salary_${userId}`) || config.startingSalary; 
            const currentBalance = await db.get(`balance_${userId}`) || 0;

            if (!currentJob) {
                return message.reply('أنت بعدك "عطال بطال" ما عندك كار (مهنة)! 🛑\nاستخدم أمر `مهنة` واختار شغلة تطلع منها قواطي (حتى لو شحاذ).');
            }

            // إضافة الراتب للرصيد
            const newBalance = currentBalance + currentSalary;
            await db.set(`balance_${userId}`, newBalance);

            message.reply(`🤲 **الله يرزقك!**\nنزلت للشارع واشتغلت **${currentJob}** وحصلت المقسوم: **${currentSalary.toLocaleString()}** 🥫.\n💰 **صار بجيبك:** ${newBalance.toLocaleString()} 🥫.`);
        } catch (error) {
            console.error('Error executing جدي command:', error);
            message.reply('الشرطة كبست عالمكان! ما كدرت تحصل ولا قوطية.');
        }
    }
};