const { isInCooldown, setCooldown } = require('../utils/cooldown.js');

module.exports = {
    name: 'قفط', // غيرنا الاسم من نهب الى قفط
    description: 'حاول تبوك (تخمط) قواطي من واحد ثاني',
    async execute(message, db, config, args) {
        const thiefId = message.author.id;

        // التحقق من الوقت (التعب)
        if (isInCooldown('قفط', thiefId, config)) {
            const timeLeft = isInCooldown('قفط', thiefId, config);
            return message.reply(`انتظر شوية! 🕒\nالشرطة تفتر بالمنطقة، ارجع حاول تسرق بعد **${timeLeft}**.`);
        }

        if (args.length < 1) {
            return message.reply('منو تريد تقفط؟ أشر على الضحية (منشن).');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('هذا مو موجود ويانا بالمخيم. أشر على واحد عدل!');
        }

        const targetId = targetUser.id;

        if (thiefId === targetId) {
            return message.reply('تريد تبوك نفسك؟ صاحي أنت؟ 😂');
        }

        // التحقق من "الكلب" (الحماية)
        const shieldExpiry = await db.get(`shield_${targetId}`);
        if (shieldExpiry && shieldExpiry > Date.now()) {
            return message.reply('⚠️ **عضك الكلب!** 🐕\nهذا الشخص مأجر كلب حراسة وما تكدر تقرب من كراتينه.');
        }

        let thiefBalance = await db.get(`balance_${thiefId}`) || 0;
        let targetBalance = await db.get(`balance_${targetId}`) || 0;

        if (targetBalance <= 0) {
            return message.reply('عوفه هذا "منتف" ما عنده ولا قوطية 🏚️. شوفلك واحد زنكيل.');
        }

        // نسبة السرقة عشوائية (بين 10% و 50%)
        const stealPercentage = Math.random() * (0.5 - 0.1) + 0.1;
        const stealAmount = Math.round(targetBalance * stealPercentage);

        thiefBalance += stealAmount;
        targetBalance -= stealAmount;

        await db.set(`balance_${thiefId}`, thiefBalance);
        await db.set(`balance_${targetId}`, targetBalance);

        // تفعيل وقت الانتظار
        setCooldown('قفط', thiefId, config.cooldowns['نهب']);

        message.reply(`🏃‍♂️ **شردة!**\nكدرت تقفط ${targetUser.tag} وتبوك منه **${stealAmount.toLocaleString()}** 🥫!\n💰 **صار بجيبك:** ${thiefBalance.toLocaleString()} 🥫.`);

        try {
            await targetUser.send(`🚨 **باكوك!**\n${message.author.tag} غافلك وخمط منك **${stealAmount.toLocaleString()}** 🥫.\nدير بالك المرة الجاية أو أجر كلب حراسة!`);
        } catch (error) {
            console.error(`ما كدرنا نبلغ ${targetUser.tag} (الخاص مسدود)، بس الفلوس انباكت!`);
        }
    }
};
