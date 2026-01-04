const { QuickDB } = require('quick.db');
const db = new QuickDB();

async function getHouseData() {
    let houses = await db.get('houses');
    if (!houses) {
        houses = [
            { price: 500, income: 20, ownerId: null }, // كرتونة VIP (أغلى شي)
            { price: 300, income: 15, ownerId: null }, // خيمة بالجزرة الوسطية
            { price: 200, income: 10, ownerId: null }, // بيت صفيح
            { price: 100, income: 5, ownerId: null },  // هيكل متروك
            { price: 50, income: 2, ownerId: null }    // ركن بحديقة عامة (أرخص شي)
        ];
        await db.set('houses', houses);
    }
    return houses;
}

async function setHouseData(houses) {
    await db.set('houses', houses);
}

function startHouseIncome(userId, incomeAmount, db) {
    setInterval(async () => {
        let userBalance = await db.get(`balance_${userId}`) || 0;
        userBalance += incomeAmount;
        await db.set(`balance_${userId}`, userBalance);
    }, 10000); // كل 10 ثواني يجيك الراتب
}

module.exports = { getHouseData, setHouseData, startHouseIncome };
