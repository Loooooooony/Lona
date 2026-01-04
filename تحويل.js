module.exports = {
    name: 'قطة', // غيرنا الاسم من تحويل الى قطة
    description: 'تحويل قواطي لمشرد آخر (مساعدة أو خاوة)',
    async execute(message, db, config, args) {
        if (args.length < 2) {
            return message.reply('لمن تريد تنطي؟ حدد المشرد والمبلغ (مثال: !قطة @فلان 100).');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('أشر (منشن) على الشخص اللي تريد تنطيه قواطي 🥫.');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('تريد تحول لنفسك؟ خبل أنت؟ ضمها بجيبك وخلصنا! 😂');
        }

        const amount = parseFloat(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('اكتب رقم عدل! لا تدوخنا بأرقام وهمية.');
        }

        const senderId = message.author.id;
        const receiverId = targetUser.id;

        try {
            // التحقق من القروض (الديون)
            const hasOutstandingLoan = await db.get(`loan_${senderId}`);
            if (hasOutstandingLoan) {
                return message.reply('أنت مطلوب لـ "أبو المولدة"! ⚡\nما تكدر تحول قواطي لحد ما تسدد ديونك القديمة (استخدم أمر `توفي`).');
            }

            let senderBalance = await db.get(`balance_${senderId}`) || 0;
            let receiverBalance = await db.get(`balance_${receiverId}`) || 0;

            if (senderBalance < amount) {
                return message.reply('جيبك فارغ! منين تجيب قواطي؟ روح جدي بالأول 🥫.');
            }

            const taxRate = config.transferTaxRate || 0.15;
            const taxAmount = amount * taxRate;
            const finalAmount = amount - taxAmount;

            senderBalance -= amount;
            receiverBalance += finalAmount;

            await db.set(`balance_${senderId}`, senderBalance);
            await db.set(`balance_${receiverId}`, receiverBalance);

            message.reply(`💸 **عفية عليك!**\nحولت **${amount.toLocaleString()}** 🥫 للمسكين ${targetUser.tag}.\n👮‍♂️ **الخاوة (الضريبة):** انقص من المبلغ **${taxAmount.toLocaleString()}** 🥫 (عمولة الطريق).\n💰 **بقى بجيبك:** ${senderBalance.toLocaleString()} 🥫.`);

            try {
                await targetUser.send(`📦 **جتك رزقة!**\nاستلمت **${finalAmount.toLocaleString()}** 🥫 من ${message.author.tag} (قطة).\nرصيدك الحالي صار: **${receiverBalance.toLocaleString()}** 🥫.`);
            } catch (error) {
                if (error.code === 50007) {
                    message.reply(`ما كدرت أدز رسالة خاصة لـ ${targetUser.tag} (الخاص مقفول)، بس القواطي وصلت!`);
                } else {
                    console.error('Failed to send DM:', error);
                    // message.reply('حدث خطأ أثناء محاولة إرسال رسالة خاصة.'); // مو ضروري نخبص المستخدم بالخطأ
                }
            }

        } catch (error) {
            console.error('Error during money transfer:', error);
            return message.reply('صار خطأ بالتحويل، القواطي وكعت بالبالوعة!');
        }
    }
}; 
