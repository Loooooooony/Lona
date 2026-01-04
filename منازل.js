const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'منامات', // غيرنا الاسم من منازل الى منامات
    description: 'شوف وين تكدر تنام اليوم (قائمة المنامات)',
    async execute(message, db, config) {
        const embed = new EmbedBuilder()
            .setTitle('⛺ سوق العقارات (الكراتين والخيم) ⛺')
            .setDescription('اختار "منامة" تستر نفسك بيها وتجمع قواطي وانت نايم 🥫:')
            .setColor('#d68f3a') // لون بني (كرتونة)
            .setTimestamp()
            .setFooter({ text: 'المنادي: ' + message.author.tag, iconURL: message.author.displayAvatarURL() });

        // أسماء المنامات حسب الترتيب (للتوضيح والتحشيش)
        const houseNames = [
            "ركن بالحديقة العامة 🌳",      // 1
            "هيكل متروك (بدون سقف) 🧱",    // 2
            "بيت صفيح (تجاوز) 🏚️",         // 3
            "خيمة بالجزرة الوسطية ⛺",     // 4
            "كرتونة ثلاجة VIP 📦"          // 5
        ];

        for (let i = 1; i <= 5; i++) {
            const houseData = await db.get(`house_${i}`);
            
            // نجيب القيم من الكونفك اذا ماكو داتا، او نخلي قيم افتراضية رخيصة
            const defaultPrice = config.houses && config.houses[i-1] ? config.houses[i-1].price : 500;
            const defaultIncome = config.houses && config.houses[i-1] ? config.houses[i-1].income : 20;

            const currentPrice = houseData?.price || defaultPrice;
            const currentIncome = houseData?.income || defaultIncome;

            const status = houseData?.owner ? `🔒 محجوزة لـ <@${houseData.owner}>` : '🟢 فارغة (للحجز)';
            const name = houseNames[i-1] || `منامة رقم #${i}`;

            embed.addFields(
                { 
                    name: `${name}`, 
                    value: `💰 **السعر:** ${currentPrice.toLocaleString()} 🥫\n📈 **الوارد:** ${currentIncome.toLocaleString()} 🥫 (كل فترة)\n📝 **الحالة:** ${status}`, 
                    inline: false 
                }
            );
        }

        message.reply({ embeds: [embed] });
    }
};
