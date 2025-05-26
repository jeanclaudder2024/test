/**
 * نظام الذكاء الاصطناعي لتوزيع السفن بشكل واقعي ومحترف
 * يستخدم OpenAI لتحليل المواقع الجغرافية وإنشاء توزيع واقعي للناقلات النفطية
 */

import OpenAI from 'openai';
import { db } from './db';
import { vessels, ports, refineries } from '../shared/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RealisticPosition {
  vesselId: number;
  lat: number;
  lng: number;
  status: string;
  speed: string;
  locationName: string;
  reasoning: string;
}

/**
 * استخدام الذكاء الاصطناعي لإنشاء توزيع واقعي للسفن
 */
export async function createRealisticVesselDistribution(): Promise<{
  positions: RealisticPosition[];
  summary: string;
  totalVessels: number;
  locations: { [key: string]: number };
}> {
  console.log('🤖 استخدام الذكاء الاصطناعي لتوزيع السفن بشكل واقعي...');

  // الحصول على الموانئ النفطية الحقيقية
  const oilPorts = await db.select().from(ports);
  
  // الحصول على المصافي الساحلية فقط
  const coastalRefineries = await db
    .select()
    .from(refineries)
    .where(and(
      isNotNull(refineries.lat),
      isNotNull(refineries.lng)
    ));

  // الحصول على السفن النشطة
  const activeVessels = await db
    .select({ id: vessels.id, name: vessels.name, vesselType: vessels.vesselType })
    .from(vessels)
    .where(sql`status != 'inactive'`)
    .limit(2000); // أول 2000 سفينة

  const prompt = `
أنت خبير بحري متخصص في توزيع ناقلات النفط العالمية. مهمتك هي إنشاء توزيع واقعي ومحترف لـ ${activeVessels.length} ناقلة نفط.

المعلومات المتاحة:
- ${oilPorts.length} ميناء نفطي حقيقي
- ${coastalRefineries.length} مصفاة ساحلية
- أنواع السفن: VLCC, Suezmax, Aframax, Product Tankers, LNG Carriers

المتطلبات:
1. توزيع 9 سفن بالضبط لكل ميناء ومصفاة ساحلية
2. توزيع الباقي في الممرات المائية الدولية الرئيسية:
   - الخليج العربي (26.5°N, 50.5°E) - أهم منطقة نفطية
   - مضيق هرمز (26.0°N, 56.0°E) - ممر حيوي
   - قناة السويس (30.0°N, 32.5°E) - طريق شحن رئيسي
   - مضيق ملقا (1.5°N, 103.5°E) - ممر آسيوي مهم
   - خليج المكسيك (28.0°N, -90.0°E) - منطقة إنتاج
   - بحر الشمال (56.0°N, 3.0°E) - منطقة نفطية أوروبية
   - البحر الأحمر (20.0°N, 38.0°E) - طريق تجاري

3. حالات واقعية للسفن:
   - docked: راسية في الموانئ
   - anchored: منتظرة قرب الموانئ
   - loading: تحميل/تفريغ
   - at_sea: في رحلات بحرية
   - transit: عبور الممرات المائية

أنشئ JSON يحتوي على:
- positions: مصفوفة المواقع مع vesselId, lat, lng, status, speed, locationName, reasoning
- summary: ملخص التوزيع
- totalVessels: العدد الإجمالي
- locations: إحصائيات التوزيع حسب المنطقة

تأكد من:
- جميع الإحداثيات في المياه فقط (لا توجد سفن على اليابسة)
- توزيع متوازن ومنطقي
- سرعات واقعية (0 للراسية، 1-3 للمنتظرة، 12-18 للمبحرة)
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "أنت خبير بحري متخصص في توزيع الأساطيل النفطية العالمية. تُنتج بيانات واقعية ومحترفة فقط."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log('✅ تم إنشاء التوزيع الذكي بنجاح');
    
    return result;
  } catch (error) {
    console.error('❌ خطأ في الذكاء الاصطناعي:', error);
    
    // خطة احتياطية واقعية
    return createFallbackDistribution(activeVessels, oilPorts, coastalRefineries);
  }
}

/**
 * خطة احتياطية لتوزيع واقعي للسفن
 */
function createFallbackDistribution(vessels: any[], ports: any[], refineries: any[]) {
  const positions: RealisticPosition[] = [];
  const locations: { [key: string]: number } = {};

  // المواقع الاستراتيجية الواقعية
  const strategicLocations = [
    { name: 'الخليج العربي', lat: 26.5, lng: 50.5, capacity: 500 },
    { name: 'مضيق هرمز', lat: 26.0, lng: 56.0, capacity: 200 },
    { name: 'خليج المكسيك', lat: 28.0, lng: -90.0, capacity: 300 },
    { name: 'بحر الشمال', lat: 56.0, lng: 3.0, capacity: 200 },
    { name: 'مضيق ملقا', lat: 1.5, lng: 103.5, capacity: 150 },
    { name: 'البحر الأحمر', lat: 20.0, lng: 38.0, capacity: 100 },
    { name: 'قناة السويس', lat: 30.0, lng: 32.5, capacity: 100 }
  ];

  let vesselIndex = 0;

  // توزيع على المواقع الاستراتيجية
  strategicLocations.forEach(location => {
    const vesselCount = Math.min(location.capacity, vessels.length - vesselIndex);
    locations[location.name] = vesselCount;

    for (let i = 0; i < vesselCount; i++) {
      if (vesselIndex >= vessels.length) break;

      const vessel = vessels[vesselIndex];
      const radius = 0.5; // نصف درجة للتشتت
      const randomLat = location.lat + (Math.random() - 0.5) * radius;
      const randomLng = location.lng + (Math.random() - 0.5) * radius;

      const status = ['at_sea', 'transit', 'anchored'][Math.floor(Math.random() * 3)];
      const speed = status === 'anchored' ? '0' : (10 + Math.random() * 8).toFixed(1);

      positions.push({
        vesselId: vessel.id,
        lat: randomLat,
        lng: randomLng,
        status,
        speed,
        locationName: location.name,
        reasoning: `موزعة في ${location.name} - منطقة نفطية استراتيجية`
      });

      vesselIndex++;
    }
  });

  return {
    positions,
    summary: `تم توزيع ${vesselIndex} ناقلة نفط على المواقع الاستراتيجية الرئيسية`,
    totalVessels: vesselIndex,
    locations
  };
}

/**
 * تطبيق التوزيع الذكي على قاعدة البيانات
 */
export async function applyAIDistribution(): Promise<{
  updated: number;
  errors: number;
  distribution: any;
}> {
  console.log('📊 تطبيق التوزيع الذكي على قاعدة البيانات...');

  const distribution = await createRealisticVesselDistribution();
  let updated = 0;
  let errors = 0;

  for (const position of distribution.positions) {
    try {
      await db
        .update(vessels)
        .set({
          currentLat: position.lat.toFixed(6),
          currentLng: position.lng.toFixed(6),
          status: position.status,
          speed: position.speed,
          lastUpdated: new Date()
        })
        .where(eq(vessels.id, position.vesselId));

      updated++;
    } catch (error) {
      console.error(`خطأ في تحديث السفينة ${position.vesselId}:`, error);
      errors++;
    }
  }

  console.log(`✅ تم تحديث ${updated} سفينة بنجاح، ${errors} خطأ`);
  console.log('📈 ملخص التوزيع:', distribution.summary);
  console.log('🗺️ توزيع المناطق:', distribution.locations);

  return { updated, errors, distribution };
}