const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'الزناكيل', // غيرنا الاسم من توب إلى الزناكيل
    description: 'عرض قائمة أباطرة الزبالة (أغنى المشردين)',
    async execute(message, db, config) {
        try {
            // جلب البيانات من الداتا بيس
            const balances = await db.all();

            if (!balances || balances.length === 0) {
                return message.reply('المخيم فارغ! محد عنده ولا فلس 🏚️.');
            }

            // تصفية وترتيب البيانات
            const sortedBalances = balances
                .filter(entry => entry && entry.id && entry.id.startsWith('balance_'))
                .map(entry => ({
                    userId: entry.id.split('_')[1],
                    balance: entry.value
                }))
                .sort((a, b) => b.balance - a.balance)
                .slice(0, config.topPlayersLimit || 10);

            if (sortedBalances.length === 0) {
                return message.reply('كلكم حفاية! ماكو ولا واحد عنده رصيد 😂.');
            }

            const embed = new EmbedBuilder()
                .setTitle(config.topPlayersTitle || '🏆 أباطرة المزابل 🏆')
                .setDescription(config.topPlayersDescription || 'هذولة هم الهوامير اللي مسيطرين على سوق القواطي:')
                .setColor(config.topPlayersEmbedColor || '#FFD700')
                .setTimestamp()
                .setFooter({ text: 'المنادي: ' + message.author.tag, iconURL: message.author.displayAvatarURL() });

            sortedBalances.forEach((entry, index) => {
                let balanceDisplay = formatBalance(entry.balance);
                
                // إضافة ميداليات لأول 3 مراكز
                let rankEmoji = '';
                if (index === 0) rankEmoji = '🥇';
                else if (index === 1) rankEmoji = '🥈';
                else if (index === 2) rankEmoji = '🥉';
                else rankEmoji = `#${index + 1}`;

                embed.addFields(
                    { name: `${rankEmoji} المركز`, value: `<@${entry.userId}>`, inline: true },
                    { name: '🎒 الحصيلة:', value: balanceDisplay, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }
                );
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing الزناكيل command:', error);
            message.reply('صار خطأ، القائمة انشقت وما كدرنا نشوف منو الزناكيل!');
        }
    }
};

// دالة تنسيق الأرقام (تحويل الأرقام الكبيرة واضافة القوطية)
function formatBalance(balance) {
    if (balance >= 1e9) {
        return `${(balance / 1e9).toFixed(1)}B 🥫`; // مليارات القواطي
    } else if (balance >= 1e6) {
        return `${(balance / 1e6).toFixed(1)}M 🥫`; // ملايين
    } else if (balance >= 1e3) {
        return `${(balance / 1e3).toFixed(1)}K 🥫`; // آلاف
    } else {
        return `${balance.toLocaleString()} 🥫`; // فكة
    }
}
