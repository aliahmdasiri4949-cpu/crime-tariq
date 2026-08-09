const fs = require('fs');

const categories = [
    { name: "العصور القديمة", desc: "جرائم وقضايا تاريخية معقدة", count: 5 },
    { name: "العصر الحديث", desc: "جرائم المدن والمؤسسات الكبرى", count: 7 },
    { name: "جرائم غامضة", desc: "قضايا ذات طابع خارق أو معقد جداً", count: 5 },
    { name: "جرائم سيبرانية", desc: "اختراقات وتسريبات خطيرة", count: 5 }
];

const maleNames = [
    "طارق", "خالد", "سالم", "فهد", "عبدالرحمن", "عمر", "بندر", "فيصل", "محمود", "عادل", "سعيد", "رائد", "بدر", "ماجد", "نواف"
];

const femaleNames = [
    "نورا", "سارة", "حنان", "لمى", "شهد", "مريم", "ليلى", "هند", "عبير", "ياسمين", "ريم", "منال", "أمل", "خلود", "روان"
];

const roles = [
    "المدير المالي", "حارس الأمن", "مبرمج", "طبيب", "محامي", "رئيس القسم", "عامل النظافة", 
    "سكرتير", "مساعد شخصي", "مستشار", "مهندس معماري", "شريك مؤسس", "محاسب", "مدير الموارد البشرية"
];

const caseTemplates = [
    { title: "جريمة القطار السريع", desc: "حدثت جريمة قتل غامضة في القطار المتجه للرياض. الضحية رجل أعمال مشهور، والمشتبه بهم كانوا معه في نفس المقطورة." },
    { title: "سرقة المخطوطة الأثرية", desc: "مخطوطة نادرة اختفت من المكتبة الوطنية. الكاميرات تعطلت لمدة 5 دقائق فقط، والباب الرئيسي لم يكسر." },
    { title: "حادث المختبر السري", desc: "انفجار مدبر في مختبر كيميائي أدى لإتلاف أبحاث لسنوات. هناك من تعمد زيادة الضغط في الأنابيب." },
    { title: "تسمم في الحفل الختامي", desc: "تسمم أحد الضيوف المهمين في حفل عشاء فاخر. المطبخ كان يعج بالموظفين، والكأس كان مخصصاً له." },
    { title: "اختراق خوادم البنك", desc: "تم تحويل ملايين الدولارات لحسابات مجهولة في عملية اختراق معقدة من داخل البنك نفسه." },
    { title: "جثة في المستودع", desc: "تم العثور على جثة في مستودع مهجور. الضحية كان يحمل أسراراً خطيرة عن منافسين في السوق." },
    { title: "اختفاء رجل الأعمال", desc: "رجل أعمال اختفى في ظروف غامضة من يخته الخاص في وسط البحر. من كان معه على اليخت؟" }
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const casesData = {};
let caseIdCounter = 1;

for (let cat of categories) {
    for (let i = 0; i < cat.count; i++) {
        const template = getRandom(caseTemplates);
        const title = `${template.title} #${i+1}`;
        
        const suspects = [];
        const guiltyIndex = Math.floor(Math.random() * 6);
        
        for (let s = 0; s < 6; s++) {
            const isGuilty = (s === guiltyIndex);
            
            // Randomly decide gender
            const isMale = Math.random() > 0.5;
            const name = isMale ? getRandom(maleNames) : getRandom(femaleNames);
            const avatar = isMale ? "male.jpg" : "female.jpg";
            const role = getRandom(roles);
            
            let systemPrompt = "";
            if (isGuilty) {
                systemPrompt = `أنت "${name}"، وتعمل "${role}". أنت المجرم الحقيقي في هذه القضية.
تتحدث بالعامية السعودية وتستخف بالمحقق. أنت كذاب محترف ومراوغ جداً. تنكر بشدة أي تهمة موجهة لك وتختلق أعذاراً وهمية.
قاعدة التوتر (مهم جداً): 
- لا ترفع التوتر أبداً (stressIncrease = 0) إذا سألك المحقق أسئلة عادية أو غير مقنعة.
- ارفع التوتر قليلاً (من 5 إلى 15 فقط) إذا حاصرك المحقق بسؤال ذكي جداً، أو كشف تناقضاً واضحاً في كلامك.
رد بصيغة JSON فقط:
{
  "text": "ردك بالعامية (مراوغ وكذاب)",
  "action": "وصف حركتك",
  "stressIncrease": 0 إلى 15,
  "evidence": "null"
}`;
            } else {
                systemPrompt = `أنت "${name}"، وتعمل "${role}". أنت بريء من هذه الجريمة، لكنك تخفي سراً آخر (مثل تأخرك عن العمل، أو سرقة شيء بسيط).
تتحدث بالعامية السعودية وتدافع عن نفسك بقوة لأنك خائف من توريطك.
قاعدة التوتر: 
- 0 للأسئلة العادية أو الاتهامات الباطلة بالقتل/السرقة الكبيرة.
- 5 إلى 15 فقط إذا سألك المحقق عن سرك الصغير الذي تحاول إخفاءه.
رد بصيغة JSON فقط:
{
  "text": "ردك بالعامية (بريء ولكن تدافع بقوة)",
  "action": "وصف حركتك",
  "stressIncrease": 0 إلى 15,
  "evidence": "null"
}`;
            }

            suspects.push({
                id: (s + 1).toString(),
                name: name,
                role: role,
                avatar: avatar,
                desc: `يعمل في وظيفة ${role}. ${isGuilty ? 'كان متواجداً في مسرح الجريمة بشكل مريب.' : 'يملك سجلاً حافلاً بالانضباط ولكنه متوتر حالياً.'}`,
                isGuilty: isGuilty,
                systemPrompt: systemPrompt
            });
        }
        
        casesData[caseIdCounter.toString()] = {
            category: cat.name,
            categoryDesc: cat.desc,
            title: title,
            difficulty: ["سهلة", "متوسطة", "صعبة", "صعبة جداً"][Math.floor(Math.random() * 4)],
            price: Math.floor(Math.random() * 100),
            isNew: Math.random() > 0.5,
            description: template.desc,
            suspects: suspects
        };
        caseIdCounter++;
    }
}

const fileContent = `// تم توليد هذا الملف برمجياً
const casesData = ${JSON.stringify(casesData, null, 4)};
`;

fs.writeFileSync('cases_data.js', fileContent, 'utf-8');
console.log('Successfully generated cases_data.js with silhouettes.');
