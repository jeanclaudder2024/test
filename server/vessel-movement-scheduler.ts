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
 * تحريك السفن إلى مواقع جديدة بناءً على رحلاتها
 */
export async function moveVesselsToNewPositions(): Promise<{
  movedVessels: number;
  averageDistance: number;
  voyageStats: any;
}> {
  console.log('🌊 بدء تحريك السفن إلى مواقع جديدة...');
  
  const voyageRoutes = await generateRealisticVoyages();
  let totalDistance = 0;
  let movedCount = 0;

  const voyageStats = {
    short: 0,    // أقل من 5 أيام
    medium: 0,   // 5-10 أيام
    long: 0,     // 10-20 يوم
    veryLong: 0  // أكثر من 20 يوم
  };

  for (const route of voyageRoutes) {
    try {
      // حساب موقع متوسط في الرحلة (تقدم عشوائي بين 20-80%)
      const progress = 0.2 + (Math.random() * 0.6);
      const newLat = route.fromLat + (route.toLat - route.fromLat) * progress;
      const newLng = route.fromLng + (route.toLng - route.fromLng) * progress;

      // حساب السرعة بناءً على حالة السفينة
      const speed = route.status === 'at_sea' ? 12 + Math.random() * 6 :
                   route.status === 'approaching' ? 8 + Math.random() * 4 :
                   route.status === 'transit' ? 15 + Math.random() * 3 :
                   10 + Math.random() * 8;

      // تحديث موقع السفينة
      await db
        .update(vessels)
        .set({
          currentLat: newLat,
          currentLng: newLng,
          status: route.status,
          speed: Math.round(speed * 10) / 10 + '', // تحويل إلى نص مع رقم عشري
          lastUpdated: new Date()
        })
        .where(eq(vessels.id, route.vesselId));

      const distance = calculateDistance(route.fromLat, route.fromLng, route.toLat, route.toLng);
      totalDistance += distance;
      movedCount++;

      // إحصائيات الرحلات
      if (route.estimatedDays < 5) voyageStats.short++;
      else if (route.estimatedDays < 10) voyageStats.medium++;
      else if (route.estimatedDays < 20) voyageStats.long++;
      else voyageStats.veryLong++;

    } catch (error) {
      console.error(`خطأ في تحريك السفينة ${route.vesselId}:`, error);
    }
  }

  console.log(`✅ تم تحريك ${movedCount} سفينة بنجاح`);
  
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