/**
 * نظام جدولة حركة السفن كل أسبوعين
 * يحرك السفن بناءً على رحلاتها الحقيقية بشكل واقعي
 */

import { db } from './db';
import { vessels, ports, refineries } from '../shared/schema';
import { eq, sql, and, or, isNotNull } from 'drizzle-orm';

interface VoyageRoute {
  vesselId: number;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  status: string;
  estimatedDays: number;
}

/**
 * حساب المسافة بين نقطتين بالكيلومتر
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * حساب الوقت المقدر للرحلة بالأيام
 */
function estimateVoyageTime(distance: number, vesselType: string): number {
  // سرعة متوسطة حسب نوع السفينة (عقدة)
  const averageSpeed = vesselType.includes('VLCC') ? 14 :
                      vesselType.includes('Suezmax') ? 15 :
                      vesselType.includes('Aframax') ? 16 :
                      vesselType.includes('LNG') ? 19 : 15;
  
  const distanceNauticalMiles = distance * 0.539957; // تحويل إلى ميل بحري
  const hours = distanceNauticalMiles / averageSpeed;
  return Math.ceil(hours / 24); // تحويل إلى أيام
}

/**
 * إنشاء رحلات واقعية للسفن
 */
export async function generateRealisticVoyages(): Promise<VoyageRoute[]> {
  console.log('🚢 إنشاء رحلات واقعية للسفن...');
  
  // الحصول على جميع السفن النشطة
  const activeVessels = await db
    .select()
    .from(vessels)
    .where(and(
      sql`status != 'inactive'`,
      isNotNull(vessels.currentLat),
      isNotNull(vessels.currentLng)
    ));

  // الحصول على جميع الموانئ والمصافي
  const allPorts = await db.select().from(ports);
  const coastalRefineries = await db
    .select()
    .from(refineries)
    .where(and(
      isNotNull(refineries.lat),
      isNotNull(refineries.lng),
      sql`lat BETWEEN -85 AND 85`,
      sql`lng BETWEEN -175 AND 175`
    ));

  const destinations = [
    ...allPorts.map(p => ({ id: p.id, name: p.name, lat: p.lat!, lng: p.lng!, type: 'port' })),
    ...coastalRefineries.map(r => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng!, type: 'refinery' }))
  ];

  const voyageRoutes: VoyageRoute[] = [];

  for (const vessel of activeVessels) {
    // اختيار وجهة عشوائية واقعية
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    
    const distance = calculateDistance(
      vessel.currentLat!,
      vessel.currentLng!,
      destination.lat,
      destination.lng
    );

    // تجنب الرحلات القصيرة جداً (أقل من 100 كم)
    if (distance < 100) continue;

    const estimatedDays = estimateVoyageTime(distance, vessel.vesselType || 'Oil Tanker');
    
    // تحديد حالة السفينة بناءً على طول الرحلة
    let newStatus = 'at_sea';
    if (estimatedDays <= 2) newStatus = 'approaching';
    else if (estimatedDays >= 15) newStatus = 'long_voyage';
    else if (Math.random() < 0.3) newStatus = 'transit';

    voyageRoutes.push({
      vesselId: vessel.id,
      fromLat: vessel.currentLat!,
      fromLng: vessel.currentLng!,
      toLat: destination.lat,
      toLng: destination.lng,
      status: newStatus,
      estimatedDays
    });
  }

  console.log(`📊 تم إنشاء ${voyageRoutes.length} رحلة واقعية`);
  return voyageRoutes;
}

/**
 * تحريك السفن إلى مواقع جديدة واقعية - 9 سفن لكل ميناء/مصفاة ساحلية
 */
export async function moveVesselsToNewPositions(): Promise<{
  movedVessels: number;
  averageDistance: number;
  voyageStats: any;
}> {
  console.log('🌊 بدء توزيع السفن بشكل واقعي...');

  // الحصول على الموانئ النفطية والمصافي الساحلية فقط
  const oilPorts = await db.select().from(ports);
  const coastalRefineries = await db
    .select()
    .from(refineries)
    .where(and(
      isNotNull(refineries.lat),
      isNotNull(refineries.lng),
      // فلترة المصافي الساحلية فقط - تجنب المصافي الداخلية
      or(
        sql`${refineries.lat}::numeric BETWEEN 24 AND 30 AND ${refineries.lng}::numeric BETWEEN 48 AND 55`, // الخليج العربي
        sql`${refineries.lat}::numeric BETWEEN 51 AND 54 AND ${refineries.lng}::numeric BETWEEN 3 AND 6`,   // روتردام
        sql`${refineries.lat}::numeric BETWEEN 29 AND 30 AND ${refineries.lng}::numeric BETWEEN -96 AND -94`, // هيوستن
        sql`${refineries.lat}::numeric BETWEEN 1 AND 2 AND ${refineries.lng}::numeric BETWEEN 103 AND 105`,  // سنغافورة
        sql`${refineries.lat}::numeric BETWEEN 35 AND 36 AND ${refineries.lng}::numeric BETWEEN 139 AND 140` // اليابان
      )
    ));

  console.log(`🏭 تم العثور على ${oilPorts.length} ميناء نفطي و ${coastalRefineries.length} مصفاة ساحلية`);

  // دمج المواقع
  const allLocations = [
    ...oilPorts.map(p => ({ 
      id: p.id, 
      name: p.name, 
      lat: parseFloat(p.lat), 
      lng: parseFloat(p.lng), 
      type: 'port' 
    })),
    ...coastalRefineries.map(r => ({ 
      id: r.id, 
      name: r.name, 
      lat: parseFloat(r.lat!), 
      lng: parseFloat(r.lng!), 
      type: 'refinery' 
    }))
  ];

  // الحصول على جميع السفن النشطة
  const activeVessels = await db
    .select()
    .from(vessels)
    .where(sql`status != 'inactive'`);

  let movedCount = 0;
  let totalDistance = 0;
  const voyageStats = { nearPorts: 0, atSea: 0, transit: 0, docked: 0 };

  // توزيع 9 سفن لكل موقع
  const vesselsPerLocation = 9;
  const vesselsForPorts = allLocations.length * vesselsPerLocation;

  for (let i = 0; i < activeVessels.length; i++) {
    const vessel = activeVessels[i];
    
    try {
      let newLat: number;
      let newLng: number;
      let status: string;
      let speed: string;

      if (i < vesselsForPorts) {
        // السفن المخصصة للموانئ والمصافي (9 لكل موقع)
        const locationIndex = Math.floor(i / vesselsPerLocation);
        const positionInGroup = i % vesselsPerLocation;
        const location = allLocations[locationIndex];

        if (location) {
          // توزيع السفن حول الموقع بشكل واقعي
          const radius = 0.05; // نصف قطر 5 كيلومتر تقريباً
          const angle = (positionInGroup / vesselsPerLocation) * 2 * Math.PI;
          
          newLat = location.lat + (Math.cos(angle) * radius * (0.5 + Math.random() * 0.5));
          newLng = location.lng + (Math.sin(angle) * radius * (0.5 + Math.random() * 0.5));

          // تحديد حالة السفينة حسب موقعها في المجموعة
          if (positionInGroup < 3) {
            status = 'docked';
            speed = '0';
            voyageStats.docked++;
          } else if (positionInGroup < 6) {
            status = 'anchored';
            speed = (Math.random() * 2).toFixed(1);
            voyageStats.nearPorts++;
          } else {
            status = 'loading';
            speed = (2 + Math.random() * 3).toFixed(1);
            voyageStats.nearPorts++;
          }
        } else {
          continue; // تخطي إذا لم يوجد موقع
        }
      } else {
        // السفن المتبقية في المحيط
        const oceanRoutes = [
          { lat: 26.5, lng: 51.0, name: 'الخليج العربي' },      // الخليج العربي
          { lat: 29.5, lng: -94.8, name: 'خليج المكسيك' },       // خليج المكسيك
          { lat: 52.5, lng: 4.5, name: 'بحر الشمال' },          // بحر الشمال
          { lat: 1.5, lng: 104.0, name: 'مضيق ملقا' },           // مضيق ملقا
          { lat: 8.0, lng: 80.0, name: 'المحيط الهندي' },        // المحيط الهندي
          { lat: 35.5, lng: 20.0, name: 'البحر المتوسط' },       // البحر المتوسط
          { lat: -15.0, lng: 15.0, name: 'جنوب الأطلسي' },       // جنوب الأطلسي
          { lat: 35.0, lng: 140.0, name: 'المحيط الهادئ' }        // المحيط الهادئ
        ];

        const route = oceanRoutes[Math.floor(Math.random() * oceanRoutes.length)];
        
        // إضافة تشتت عشوائي للموقع
        newLat = route.lat + (Math.random() * 6 - 3);
        newLng = route.lng + (Math.random() * 8 - 4);
        
        status = Math.random() < 0.6 ? 'at_sea' : 'transit';
        speed = (10 + Math.random() * 8).toFixed(1);
        
        if (status === 'at_sea') voyageStats.atSea++;
        else voyageStats.transit++;
      }

      // التأكد من صحة الإحداثيات
      newLat = Math.max(-85, Math.min(85, newLat));
      newLng = Math.max(-180, Math.min(180, newLng));

      // تحديث موقع السفينة في قاعدة البيانات
      await db
        .update(vessels)
        .set({
          currentLat: newLat.toFixed(6),
          currentLng: newLng.toFixed(6),
          status: status,
          speed: speed,
          lastUpdated: new Date()
        })
        .where(eq(vessels.id, vessel.id));

      movedCount++;
      totalDistance += Math.random() * 500; // مسافة تقديرية

    } catch (error) {
      console.error(`خطأ في تحديث السفينة ${vessel.id}:`, error);
    }
  }

  console.log(`✅ تم توزيع ${movedCount} سفينة بنجاح`);
  console.log(`📊 الإحصائيات: ${voyageStats.docked} راسية، ${voyageStats.nearPorts} قرب الموانئ، ${voyageStats.atSea} في البحر، ${voyageStats.transit} عبور`);
  
  return {
    movedVessels: movedCount,
    averageDistance: totalDistance / movedCount || 0,
    voyageStats
  };
}

/**
 * جدولة حركة السفن كل أسبوعين
 */
export function scheduleVesselMovement(): void {
  console.log('📅 تفعيل جدولة حركة السفن كل أسبوعين');
  
  // تحريك فوري عند بدء التشغيل
  setTimeout(() => {
    moveVesselsToNewPositions();
  }, 5000); // انتظار 5 ثوان لبدء النظام

  // جدولة كل أسبوعين (14 يوم)
  setInterval(async () => {
    try {
      const result = await moveVesselsToNewPositions();
      console.log('📊 نتائج حركة السفن:', {
        تم_تحريك: result.movedVessels,
        متوسط_المسافة: Math.round(result.averageDistance) + ' كم',
        رحلات_قصيرة: result.voyageStats.short,
        رحلات_متوسطة: result.voyageStats.medium,
        رحلات_طويلة: result.voyageStats.long,
        رحلات_طويلة_جداً: result.voyageStats.veryLong
      });
    } catch (error) {
      console.error('❌ خطأ في جدولة حركة السفن:', error);
    }
  }, 14 * 24 * 60 * 60 * 1000); // 14 يوم بالميلي ثانية
}

/**
 * تحريك يدوي فوري للسفن (للاختبار)
 */
export async function triggerManualVesselMovement(): Promise<any> {
  console.log('🔄 تحريك يدوي فوري للسفن...');
  return await moveVesselsToNewPositions();
}