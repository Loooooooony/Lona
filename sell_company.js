const companies = require('./companiesData');

module.exports = {
    name: 'بيع_بسطية', // تغير الاسم
    description: 'بيع بسطيتك لمشرد ثاني واقبض قواطي',
    async execute(message, db, config, args) {
        try {
            const sellerId = message.author.id;
            const buyer = message.mentions.users.first();
            const sellAmount = parseInt(args[1]);

            if (!buyer) {
                return message.reply('لمن تريد تبيع؟ حدد المشرد المسكين اللي راح تورطه وياك (منشنه).');
            }

            const userCompanies = await db.get(`user_${sellerId}_companies`) || [];
            if (userCompanies.length === 0) {
                return message.reply('أنت حافي ما عندك ولا بسطية، شتبيع؟ الهوا؟ 😂');
            }

            const companyId = userCompanies[0];
            const company = companies.find(c => c.id === companyId);

            // تحديد السعر: يا اما السعر اللي كتبه، او السعر الافتراضي مضروب بالمضاعف
            const sellPrice = sellAmount || company.price * (config.companyPriceMultiplier || 1.5);

            const promptMessage = await message.channel.send(
                `${buyer}، أجاك رزق (أو ورطة)! 🤑\n${message.author} يريد يبيع لك **${company.name}** بسعر **${sellPrice.toLocaleString()}** 🥫.\nتقبل؟ اكتب **"نعم"** للقبول أو **"لا"** للرفض.`
            );

            const filter = response => {
                return response.author.id === buyer.id && ['نعم', 'لا'].includes(response.content.toLowerCase());
            };

            const collector = message.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async response => {
                if (response.content.toLowerCase() === 'نعم') {
                    let buyerBalance = await db.get(`balance_${buyer.id}`) || 0;

                    if (buyerBalance < sellPrice) {
                        return message.reply('جيبك فارغ! ما عندك قواطي كافية تشتري هاي البسطية 🥫.');
                    }

                    // خصم المبلغ من المشتري
                    buyerBalance -= sellPrice;
                    await db.set(`balance_${buyer.id}`, buyerBalance);

                    // إضافة المبلغ للبائع
                    let sellerBalance = await db.get(`balance_${sellerId}`) || 0;
                    sellerBalance += sellPrice;
                    await db.set(`balance_${sellerId}`, sellerBalance);

                    // نقل الملكية
                    await db.set(`company_${companyId}_owner`, buyer.id);
                    // تحديث سعر البسطية الجديد
                    await db.set(`company_${companyId}_price`, sellPrice * (config.companyPriceMultiplier || 1.2));

                    await db.set(`user_${buyer.id}_companies`, [companyId]);
                    await db.set(`user_${sellerId}_companies`, []); // تصفير شركات البائع

                    await message.channel.send(
                        `🤝 **تمت الصفقة!**\n${buyer} صار هو "السطة" الجديد لـ **${company.name}**.\nو ${message.author} لهف **${sellPrice.toLocaleString()}** 🥫 وراح يطش!`
                    );
                } else if (response.content.toLowerCase() === 'لا') {
                    await message.channel.send(`${buyer} غلس ورفض العرض. يكول غالية! 😒`);
                }

                collector.stop();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.channel.send('تأخرتوا والبلدية جتي! 🚔 انلغى العرض.');
                }
            });
        } catch (error) {
            console.error('Error in بيع_بسطية command:', error);
            message.reply('صار خطأ بالسيستم، البسطية ما قبلت تنباع!');
        }
    }
};