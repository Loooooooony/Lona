const userIncomeProcesses = {}; // بقايا الكود القديم (مو ضروري بس عوفيه او مسحيه عادي)

module.exports = {
    name: 'حجز', // الاسم البرمجي (لازم يطابق الكونفك اذا استخدمتيه هناك)
    description: 'احجز مكان تنام بيه (كرتونة، ركن، هيكل)',
    async execute(message, db, config, args) {
        try {
            const houseNumber = parseInt(args[0]);

            // التأكد من الرقم (عندنا 5 أماكن بس بالكونفك)
            if (!houseNumber || isNaN(houseNumber) || houseNumber < 1 || houseNumber > 5) {
                return message.reply('وين رايح؟ اختار رقم مكان صحيح من 1 إلى 5 (شوف القائمة بأمر `منامات`).');
            }

            const userId = message.author.id;

            // التأكد ان المستخدم ما عنده مكان ثاني
            for (let i = 1; i <= 5; i++) {
                const houseKey = `house_${i}`;
                let houseData = await db.get(houseKey);
                if (houseData && houseData.owner === userId) {
                    return message.reply('أنت عندك مكان تنام بيه! لا تصير طماع وتأخذ مكان غيرك 🛑.');
                }
            }

            const houseKey = `house_${houseNumber}`;
            let houseData = await db.get(houseKey);

            // اذا المكان ما مسجل بالداتا، نجيب معلوماته من الكونفك
            if (!houseData) {
                houseData = {
                    price: config.houses[houseNumber - 1].price,
                    income: config.houses[houseNumber - 1].income,
                    owner: null
                };
                await db.set(houseKey, houseData);
            }

            const userBalance = await db.get(`balance_${userId}`) || 0;

            if (userBalance < houseData.price) {
                return message.reply(`ما عندك قواطي كافية تحجز هذا المكان 🏚️.\nسعره **${houseData.price.toLocaleString()}** 🥫 وأنت جيبك فارغ.`);
            }

            // --- إتمام عملية الشراء ---

            // 1. خصم المبلغ
            await db.set(`balance_${userId}`, userBalance - houseData.price);

            // 2. تسجيل الملكية ورفع السعر
            houseData.owner = userId;
            houseData.price *= 1.5; // السعر يزيد
            houseData.income *= 1.2; // الدخل يزيد
            await db.set(houseKey, houseData);

            // (لغينا startIncomeProcess من هنا) ❌

            return message.reply(`🎉 **مبروك!**\nحجزت المكان رقم **#${houseNumber}** وصار ملكك ⛺.\nراح يجيك منه وارد **${houseData.income.toLocaleString()}** 🥫.\n\n💡 **ملاحظة:** لا تنسى تستخدم أمر **\`!وارد\`** كل ساعة عشان تلم القواطي!`);

        } catch (error) {
            console.error('Error executing حجز command:', error);
            message.reply('البلدية هجمت عالمنطقة! ما كدرت تحجز المكان.');
        }
    }
};
