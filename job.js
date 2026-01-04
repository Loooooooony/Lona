// Update By Ghlais -> Modified for Homeless Bot 🥫

module.exports = {
    name: 'مهنة',
    description: 'ترقى واختار كار (مهنة) جديدة بالسوق',

    async execute(message, db, config, args) {
        const userId = message.author.id;

        let currentBalance = await db.get(`balance_${userId}`) || 0;

        // اذا ما كتب اسم المهنة، نعرض القائمة
        if (!args[0]) {
            const jobList = config.jobTitles.map(job => `- **${job.name}**: سعر الرتبة ${job.cost} 🥫`).join('\n');
            return message.reply(`**📜 المهن (الكارات) المتاحة بالسوق:**\nاختار مهنة تناسب مقامك حتى تزيد يوميتك:\n\n${jobList}\n\n*⚠️ ملاحظة: انسخ الاسم بالضبط مثل ما مكتوب فوق!*\n*اكتب: !مهنة [اسم المهنة]*`);
        }

        if (currentBalance <= 0) {
            return message.reply('جيبك فارغ! روح جدي وجمع قواطي وتعال، الرتب بفلوس 🥫.');
        }

        // جمعنا الكلمات ومسحنا المسافات الزايدة
        const jobName = args.join(' ').trim(); 

        // هذا السطر راح يطبعلك بالترمينال شنو دزيتي وشنو موجود بالكونفك (للمراقبة)
        console.log(`User typed: "${jobName}"`);
        
        const selectedJob = config.jobTitles.find(job => job.name.trim() === jobName);

        if (!selectedJob) {
            // اذا الاسم غلط، نكول للمستخدم شنو كتبنا
            return message.reply(`هاي المهنة "**${jobName}**" ما موجودة بالسوك!\nتأكد من الهمزات (أ، إ) والمسافات، أو انسخ الاسم من القائمة.`);
        }

        const jobCost = selectedJob.cost;

        if (currentBalance < jobCost) {
            return message.reply(`ما عندك قواطي كافية تصير **${jobName}**. يرادلك **${jobCost}** 🥫 بعد.`);
        }

        // خصم المبلغ وتحديث المهنة
        const newBalance = currentBalance - jobCost;
        await db.set(`balance_${userId}`, newBalance);
        await db.set(`job_${userId}`, selectedJob.name);
        await db.set(`salary_${userId}`, selectedJob.salary);

        return message.reply(`🎉 **مبروك!** ترقيت وصرت **${jobName}**. يوميتك (الراتب) صارت **${selectedJob.salary}** 🥫.`);
    }
};
