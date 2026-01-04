const companies = require('./companiesData'); // ضفنا هذا السطر عشان يتعرف على البسطيات

module.exports = {
    name: 'هويتي', // غيرنا الاسم من حساب الى هويتي
    description: 'شوف تاريخك المشرف بالشارع',
    async execute(message, db) {
        const userId = message.author.id;
        
        // جلب البيانات
        const balance = await db.get(`balance_${userId}`) || 0;
        const loanAmount = await db.get(`loan_${userId}`) || 0;
        const userCompanies = await db.get(`user_${userId}_companies`) || [];

        // تحويل أرقام البسطيات الى أسماء
        const companyNames = userCompanies.map(companyId => {
            const company = companies.find(c => c.id === companyId);
            return company ? company.name : 'بسطية مجهولة';
        }).join('، ');

        // رسالة الرد (تحشيش)
        const loanText = loanAmount > 0 ? `⛔ **مطلوب (ديون):** ${loanAmount.toLocaleString()} 🥫 (دير بالك من الديانة)` : `✅ **الديون:** ما مطلوب لأحد (نظيف)`;
        const companiesText = userCompanies.length > 0 ? userCompanies.length : 'ما عندك (كاعد عالرصيف)';

        message.reply(`🆔 **هوية المشرد:** <@${userId}>\n\n` +
                      `💰 **الخرجية (الجيب):** ${balance.toLocaleString()} 🥫\n` +
                      `${loanText}\n` +
                      `⛺ **عدد البسطيات:** ${companiesText}\n` +
                      `📝 **أسماء البسطيات:** ${companyNames.length > 0 ? companyNames : 'فارغ 💨'}`);
    }
};
