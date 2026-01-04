const ms = require('ms'); 

module.exports = {
    name: 'داين', // غيرنا الاسم من قرض الى داين
    description: 'اطلب سلفة من أبو المولدة (ديون)',
    async execute(message, db, config) {
        const userId = message.author.id;
        let currentBalance = await db.get(`balance_${userId}`) || 0;
        const existingLoan = await db.get(`loan_${userId}`);

        // ممنوع تاخذ قرضين بنفس الوقت
        if (existingLoan && existingLoan > 0) {
            return message.reply('عليك ديون قديمة! 🛑\nسدد اللي عليك بالأول (استخدم `!توفي`) لا يجونك الديانة يكسرون راسك.');
        }

        // مبلغ القرض (100 قوطية بس، اقتصاد تقشف)
        const loanAmount = 100; 
        
        currentBalance += loanAmount;
        await db.set(`balance_${userId}`, currentBalance);
        await db.set(`loan_${userId}`, loanAmount);

        message.reply(`💸 **أخذت سلفة!**\nتداينت **${loanAmount.toLocaleString()}** 🥫 من "أبو المولدة".\nدير بالك! راح يجي ياخذهم منك بعد **ساعة ضبط** (غصب عنك).`);

        // المؤقت: بعد ساعة ينسحب المبلغ اوتوماتيكياً
        setTimeout(async () => {
            let updatedBalance = await db.get(`balance_${userId}`) || 0;
            const outstandingLoan = await db.get(`loan_${userId}`); 

            // اذا الدين لسا موجود
            if (outstandingLoan) {
                if (updatedBalance >= outstandingLoan) {
                    // اذا عنده فلوس، نسحبها غصب
                    updatedBalance -= outstandingLoan;
                    await db.set(`balance_${userId}`, updatedBalance);
                    await db.delete(`loan_${userId}`);
                    message.reply(`🔌 **وقت السداد!**\nأجا الديانة وفتشوا جيوبك واخذوا فلوسهم (**${loanAmount.toLocaleString()}** 🥫) غصب.\nحمدلله خلصت منهم! ✅`);
                } else {
                    // اذا ما عنده فلوس
                    message.reply(`⚠️ **مشكلة!**\nالديانة جوك وما عندك قواطي تسدد! 🏃‍♂️\nشردت منهم بس الدين بعده برقبتك. حاول تسدد بأسرع وقت بـ \`!توفي\`.`);
                }
            }
        }, ms('1h')); // المهلة ساعة وحدة
    }
};
