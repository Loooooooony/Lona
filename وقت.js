const { EmbedBuilder } = require('discord.js');
const cooldownUtil = require('../utils/cooldown.js');

module.exports = {
    name: 'وقت',
    description: 'شوف شكد باقي وقت حتى تكدر تعيد الحيل',
    async execute(message, db, config) {
        try {
            const userId = message.author.id;
            
            // خريطة لترجمة الأسماء البرمجية إلى أسماء التحشيش
            const commandNamesMap = {
                'راتب': '🥫 جدي',
                'حظ': '🎟️ يانصيب',
                'استثمار': '💼 تشغيل',
                'تداول': '📉 سوق مريدي',
                'قرض': '💸 داين',
                'توب': '🏆 الزناكيل',
                'نرد': '🎲 زار',
                'قمار': '🐓 رهان',
                'نهب': '🏃 قفط',
                'حماية': '🐕 كلب',
                'يومي': '🎁 يومي',
                'شراء': '⛺ حجز مكان',
                'منازل': '🏘️ منامات',
                'شركات': '🛒 بسطيات',
                'شراء_شركة': '🏷️ شراء بسطية',
                'بيع_شركة': '🤝 بيع بسطية'
            };

            const commandCooldowns = Object.keys(config.cooldowns).map(command => {
                const remainingTime = cooldownUtil.getRemainingCooldown(command, userId, config);
                // استخدام الاسم الجديد اذا موجود، او الاسم القديم
                const displayName = commandNamesMap[command] || command;

                if (remainingTime > 0) {
                    const cooldownEndTime = new Date(Date.now() + remainingTime);
                    const formattedTime = `<t:${Math.floor(cooldownEndTime.getTime() / 1000)}:R>`;
                    return { command: displayName, timeLeft: formattedTime };
                } else {
                    return { command: displayName, timeLeft: '✅ جاهز' };
                }
            });

            const embed = new EmbedBuilder()
                .setTitle('⏳ توقيتات الشارع')
                .setColor(config.embedColor || '#59483b')
                .setDescription('هذا الوقت الباقي حتى تكدر تعيد الكلات (الأوامر):')
                .setFooter({
                    text: `المنادي: ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

            commandCooldowns.forEach(cooldown => {
                embed.addFields({ name: cooldown.command, value: cooldown.timeLeft, inline: true });
            });

            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error executing وقت command:', error);
            message.reply('ساعتك خربانة! ما كدرنا نعرف الوقت.');
        }
    }
};
