import OpenAI from "openai";
import { db } from "./db.js";
import { vessels, ports, refineries } from "../shared/schema.js";
import { eq } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface VesselPosition {
  id: number;
  lat: number;
  lng: number;
  status: string;
  speed: string;
  location_name: string;
  reasoning: string;
}

interface DistributionPlan {
  vessels: VesselPosition[];
  distribution_summary: string;
  total_vessels: number;
  maritime_zones: {
    [key: string]: number;
  };
}

/**
 * استخدام OpenAI لتوزيع السفن بذكاء على الخريطة العالمية
 */
export async function intelligentVesselDistribution(): Promise<DistributionPlan> {
  console.log("🤖 بدء التوزيع الذكي للسفن باستخدام OpenAI...");

  try {
    // الحصول على بيانات الموانئ والمصافي
    const allPorts = await db.select().from(ports);
    const allRefineries = await db.select().from(refineries);
    const allVessels = await db.select().from(vessels);

    console.log(`📊 تحليل ${allVessels.length} سفينة، ${allPorts.length} ميناء، ${allRefineries.length} مصفاة`);

    const prompt = `
أنت خبير في النقل البحري العالمي والطرق التجارية. مهمتك توزيع ${allVessels.length} سفينة نفط بشكل واقعي على الخريطة العالمية.

الموانئ المتاحة (${allPorts.length} ميناء):
${allPorts.slice(0, 20).map(p => `- ${p.name} (${p.country}) - ${p.lat}, ${p.lng}`).join('\n')}

المصافي المتاحة (${allRefineries.length} مصفاة):
${allRefineries.slice(0, 15).map(r => `- ${r.name} (${r.country}) - ${r.lat}, ${r.lng}`).join('\n')}

قم بتوزيع السفن وفقاً للمعايير التالية:
1. 15-20% من السفن في الموانئ الرئيسية (راسية، محملة، مفرغة)
2. 25-30% في الطرق البحرية الاستراتيجية (مضيق هرمز، قناة السويس، مضيق ملقا)
3. 40-45% في المحيطات الرئيسية (الأطلسي، الهادئ، الهندي)
4. 10-15% في البحار الإقليمية (المتوسط، الشمال، الأحمر، الخليج العربي)

اعتبارات مهمة:
- جميع الإحداثيات يجب أن تكون في المياه (لا على اليابسة)
- توزيع متوازن جغرافياً
- مراعاة كثافة النقل البحري الحقيقية
- سرعات واقعية (0-3 عقدة للموانئ، 8-16 عقدة للمحيطات)
- حالات واقعية للسفن

اكتب استجابتك بتنسيق JSON فقط:
{
  "vessels": [
    {
      "id": رقم_السفينة,
      "lat": خط_العرض,
      "lng": خط_الطول,
      "status": "الحالة",
      "speed": "السرعة",
      "location_name": "اسم_الموقع",
      "reasoning": "سبب_الاختيار"
    }
  ],
  "distribution_summary": "ملخص_التوزيع",
  "total_vessels": ${allVessels.length},
  "maritime_zones": {
    "ports": عدد_السفن_في_الموانئ,
    "strategic_routes": عدد_السفن_في_الطرق_الاستراتيجية,
    "open_ocean": عدد_السفن_في_المحيطات,
    "regional_seas": عدد_السفن_في_البحار_الإقليمية
  }
}

توزع ${Math.min(100, allVessels.length)} سفينة أولاً كعينة تجريبية.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنت خبير في النقل البحري العالمي. قم بتوزيع السفن بشكل واقعي في المياه فقط. اكتب الاستجابة بتنسيق JSON صحيح فقط."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const distributionPlan = JSON.parse(response.choices[0].message.content) as DistributionPlan;
    
    console.log("🎯 خطة التوزيع الذكية جاهزة:", distributionPlan.distribution_summary);
    console.log("📍 المناطق البحرية:", distributionPlan.maritime_zones);

    return distributionPlan;

  } catch (error) {
    console.error("❌ خطأ في التوزيع الذكي:", error);
    throw error;
  }
}

/**
 * تطبيق خطة التوزيع على قاعدة البيانات
 */
export async function applyDistributionPlan(plan: DistributionPlan): Promise<void> {
  console.log("📝 تطبيق خطة التوزيع على قاعدة البيانات...");

  try {
    for (const vesselPos of plan.vessels) {
      await db.update(vessels)
        .set({
          current_lat: vesselPos.lat,
          current_lng: vesselPos.lng,
          status: vesselPos.status,
          speed: vesselPos.speed
        })
        .where(eq(vessels.id, vesselPos.id));
    }

    console.log(`✅ تم تحديث ${plan.vessels.length} سفينة بنجاح`);
  } catch (error) {
    console.error("❌ خطأ في تطبيق خطة التوزيع:", error);
    throw error;
  }
}

/**
 * التوزيع الذكي الكامل للسفن
 */
export async function executeIntelligentDistribution(): Promise<{
  success: boolean;
  plan: DistributionPlan;
  updated_vessels: number;
}> {
  try {
    console.log("🚀 بدء التوزيع الذكي الكامل للسفن...");
    
    const plan = await intelligentVesselDistribution();
    await applyDistributionPlan(plan);
    
    console.log("🎉 اكتمل التوزيع الذكي بنجاح!");
    
    return {
      success: true,
      plan,
      updated_vessels: plan.vessels.length
    };
    
  } catch (error) {
    console.error("💥 فشل التوزيع الذكي:", error);
    return {
      success: false,
      plan: {
        vessels: [],
        distribution_summary: "فشل في التوزيع",
        total_vessels: 0,
        maritime_zones: {}
      },
      updated_vessels: 0
    };
  }
}