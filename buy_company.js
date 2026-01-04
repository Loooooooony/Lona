const companies = require('./companiesData');

module.exports = {
    name: 'شراء_بسطية',
    description: 'شراء بسطية للاسترزاق',
    async execute(message, db, config, args) {
        try {
            const userId = message.author.id;
            let userBalance = await db.get(`balance_${userId}`) || 0;

            const companyId = parseInt(args[0]);

            if (isNaN(companyId)) {
                return message.reply('يرجى تحديد رقم البسطية اللي تريد تشتريها (شوف القائمة بـ `!بسطيات`).');
            }

            const company = companies.find(c => c.id === companyId);

            if (!company) {
                return message.reply('هاي البسطية ما موجودة بالسوق! تأكد من الرقم.');
            }

            // التحقق اذا البسطية مبيوعة
            const companyOwner = await db.get(`company_${companyId}_owner`);
            if (companyOwner) {
                return message.reply('هاي البسطية محجوزة لواحد ثاني، شوف غيرها.');
            }

            // التحقق اذا المستخدم عنده بسطية (قانون: بسطية وحدة لكل مواطن)
            const userCompanies = await db.get(`user_${userId}_companies`) || [];
            if (userCompanies.length > 0) {
                return message.reply('ما تكدر تفتح أكثر من بسطية وحدة، البلدية تشيلك! (قانون منع الاحتكار).');
            }

            if (userBalance < company.price) {
                return message.reply(`ما عندك قواطي كافية! 🏚️\nسعرها **${company.price.toLocaleString()}** 🥫 وأنت جيبك فارغ.`);
            }

            // --- إتمام عملية الشراء ---

            // 1. خصم المبلغ
            userBalance -= company.price;
            await db.set(`balance_${userId}`, userBalance);

            // 2. تسجيل الملكية
            await db.set(`company_${companyId}_owner`, userId);
            
            // 3. رفع سعر البسطية (تضخم السوق)
            await db.set(`company_${companyId}_price`, company.price * (config.companyPriceMultiplier || 1.5));
            
            // 4. إضافة البسطية لقائمة ممتلكات المستخدم
            userCompanies.push(companyId);
            await db.set(`user_${userId}_companies`, userCompanies);

            // 5. الرد (مع تذكير بأمر وارد)
            message.reply(`🎉 **مبروك!**\nاشتريت **${company.name}** بـ **${company.price.toLocaleString()}** 🥫.\n\n💡 **ملاحظة مهمة:**\nعشان تستلم أرباحك، لازم كل ساعة تكتب أمر: **\`!وارد\`** (تلم الغلة بيدك).`);

        } catch (error) {
            console.error('Error in شراء_بسطية command:', error);
            message.reply('صار خطأ، البسطية احترقت قبل لا تشتريها!');
        }
    }
};
