module.exports = {
    name: 'فلوسي', // غيرنا الاسم من فلوسي الى الخرجية
    description: 'شوف شكد عندك قواطي بالجيوب',
    async execute(message, db, config) {
        try {
            const userId = message.author.id;
            let currentBalance = await db.get(`balance_${userId}`) || 0;

            // رسالة الرصيد (ستايل مشردين)
            const responseMessage = `🎒 **الخرجية (الجيب):**\nدورت بجيوبك زين ولكيت ما مجموعه: **${currentBalance.toLocaleString()}** 🥫.`;

            message.reply({
                content: responseMessage,
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('Error fetching balance:', error);
            message.reply('جيبك مشكوك! ما كدرنا نحسب القواطي.');
        }
    }
};
