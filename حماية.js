module.exports = {
    name: 'كلب', // غيرنا الاسم من حماية إلى كلب
    description: 'أجر كلب ضال يحميك من السرقة (القفط)',
    async execute(message, db, config, args) {
        try {
            const userId = message.author.id;

            if (args.length < 1 || isNaN(args[0])) {
                return message.reply(`حدد كم ساعة تريد تأجر الكلب؟ 🐕\n(أقصى حد ${config.shieldMaxHours} ساعات لأن يتعب).`);
            }

            const shieldHours = parseInt(args[0]);

            if (shieldHours < 1 || shieldHours > config.shieldMaxHours) {
                return message.reply(`ما يصير! تكدر تأجر الكلب من ساعة وحدة إلى ${config.shieldMaxHours} ساعات بس.`);
            }

            const shieldCost = shieldHours * config.shieldCostPerHour;
            let userBalance = await db.get(`balance_${userId}`) || 0;

            if (userBalance < shieldCost) {
                return message.reply(`جيبك فارغ! 🐾\nما عندك قواطي تكفي لإيجار الكلب لمدة ${shieldHours} ساعات.\nيرادلك **${shieldCost.toLocaleString()}** 🥫.`);
            }

            // خصم المبلغ وتفعيل الحماية
            userBalance -= shieldCost;
            await db.set(`balance_${userId}`, userBalance);

            // حساب وقت انتهاء الحماية
            const shieldExpiry = Date.now() + shieldHours * 60 * 60 * 1000;
            await db.set(`shield_${userId}`, shieldExpiry);

            message.reply(`🐕 **عفية!**\nأجرت "جلـب شرس" لمدة **${shieldHours}** ساعات! 🛡️\nهسة أي واحد يقرب منك يريد يبوكك (يقفطك) الكلب يعضه من رجله!\n\n💰 **الباقي بجيبك:** ${userBalance.toLocaleString()} 🥫.`);
        } catch (error) {
            console.error('Error executing كلب command:', error);
            message.reply('الكلب شرد! صار خطأ بالموضوع.');
        }
    }
};
