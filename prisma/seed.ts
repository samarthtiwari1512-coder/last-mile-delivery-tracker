import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // ---- Admin user ----
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@delivery-tracker.local" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@delivery-tracker.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // ---- Zones ----
  const zoneNames = ["North Zone", "South Zone", "East Zone", "West Zone"];
  const zones = [];
  for (const name of zoneNames) {
    const zone = await prisma.zone.upsert({ where: { name }, update: {}, create: { name } });
    zones.push(zone);
  }

  // ---- Areas (pincode -> zone mapping) ----
  const areaSeed = [
    { pincode: "110001", label: "Connaught Place, Delhi", zone: "North Zone" },
    { pincode: "110002", label: "Daryaganj, Delhi", zone: "North Zone" },
    { pincode: "560001", label: "MG Road, Bengaluru", zone: "South Zone" },
    { pincode: "560002", label: "Shivajinagar, Bengaluru", zone: "South Zone" },
    { pincode: "700001", label: "BBD Bagh, Kolkata", zone: "East Zone" },
    { pincode: "700016", label: "Park Street, Kolkata", zone: "East Zone" },
    { pincode: "400001", label: "Fort, Mumbai", zone: "West Zone" },
    { pincode: "400051", label: "Bandra, Mumbai", zone: "West Zone" },
    { pincode: "207247", label: "Kasganj, Uttar Pradesh", zone: "North Zone" },
    { pincode: "370110", label: "Kutch, Gujarat", zone: "West Zone" },
  ];
  for (const a of areaSeed) {
    const zone = zones.find((z) => z.name === a.zone)!;
    await prisma.area.upsert({
      where: { pincode: a.pincode },
      update: { zoneId: zone.id, label: a.label },
      create: { pincode: a.pincode, label: a.label, zoneId: zone.id },
    });
  }

  // ---- Rate cards (all 4 combinations, no hardcoded numbers in app code) ----
  const rateCardSeed = [
    { orderType: "B2C" as const, rateType: "INTRA_ZONE" as const, baseCharge: 30, perKgRate: 15, minCharge: 40 },
    { orderType: "B2C" as const, rateType: "INTER_ZONE" as const, baseCharge: 50, perKgRate: 22, minCharge: 70 },
    { orderType: "B2B" as const, rateType: "INTRA_ZONE" as const, baseCharge: 20, perKgRate: 10, minCharge: 30 },
    { orderType: "B2B" as const, rateType: "INTER_ZONE" as const, baseCharge: 35, perKgRate: 16, minCharge: 55 },
  ];
  for (const rc of rateCardSeed) {
    await prisma.rateCard.upsert({
      where: { orderType_rateType: { orderType: rc.orderType, rateType: rc.rateType } },
      update: rc,
      create: rc,
    });
  }

  // ---- COD surcharge config ----
  await prisma.codSurchargeConfig.upsert({
    where: { orderType: "B2C" },
    update: { isPercent: false, value: 25 },
    create: { orderType: "B2C", isPercent: false, value: 25 },
  });
  await prisma.codSurchargeConfig.upsert({
    where: { orderType: "B2B" },
    update: { isPercent: true, value: 2 },
    create: { orderType: "B2B", isPercent: true, value: 2 },
  });

  // ---- Sample delivery agent ----
  const agentPasswordHash = await bcrypt.hash("Agent@123", 10);
  const agentUser = await prisma.user.upsert({
    where: { email: "agent1@delivery-tracker.local" },
    update: {},
    create: {
      name: "Ramesh Kumar",
      email: "agent1@delivery-tracker.local",
      passwordHash: agentPasswordHash,
      role: "AGENT",
      phone: "9876543210",
    },
  });
  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: { currentZoneId: zones[0].id, availability: "AVAILABLE" },
    create: { userId: agentUser.id, currentZoneId: zones[0].id, availability: "AVAILABLE" },
  });

  // ---- Sample customer ----
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);
  await prisma.user.upsert({
    where: { email: "customer1@delivery-tracker.local" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "customer1@delivery-tracker.local",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "9123456780",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:    admin@delivery-tracker.local / Admin@123");
  console.log("Agent login:    agent1@delivery-tracker.local / Agent@123");
  console.log("Customer login: customer1@delivery-tracker.local / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
