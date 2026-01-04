const { EmbedBuilder } = require('discord.js');
const companies = require('./companiesData');

module.exports = {
    name: 'بسطيات', // غيرنا الاسم من شركات لبسطيات
    description: 'عرض قائمة البسطيات المتاحة للبيع',
    async execute(message, db, config) {
        const embed = new EmbedBuilder()
            .setTitle('🛒 سوق مريدي (البسطيات المتاحة) 🛒')
            .setDescription('اختار بسطية واسترزق منها بدل كعدة الرصيف! 🤑')
            .setColor('#d68f3a') // لون بني فاتح (مثل الكرتونة)
            .setTimestamp();

        for (const company of companies) {
            // نجيب المالك من الداتابيس حتى نعرف اذا البسطية مبيوعة
            const ownerId = await db.get(`company_${company.id}_owner`);
            const ownerInfo = ownerId ? `<@${ownerId}> (مبيوعة 🔒)` : 'متاحة للبيع 🟢';

            embed.addFields({ 
                name: `⛺ ${company.name}`, 
                value: `💰 **السعر:** ${company.price.toLocaleString()} 🥫\n📈 **الوارد:** ${company.rent.toLocaleString()} 🥫 (كل فترة)\n📝 **الحالة:** ${ownerInfo}`, 
                inline: false 
            });
        }

        message.reply({ embeds: [embed] });
    }
};
