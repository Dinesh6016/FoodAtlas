import fs from "fs";
import path from "path";
import prisma from "../lib/db/prisma";
import { slugify } from "../lib/utils";
import { RestaurantStatus, VerificationStatus } from "@prisma/client";

async function importCSV() {
  const csvPath = path.join(process.cwd(), "data", "restaurants.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  console.log(`🚀 Starting CSV import with ${lines.length - 1} records...`);

  let importedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Parse CSV line handling quotes
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    const values: string[] = [];
    let match;
    while ((match = regex.exec(rawLine)) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      values.push(match[1] !== undefined ? match[1] : match[2] || "");
    }

    const [name, address, cityName, areaName, phone, website, latStr, lngStr, prStr, cuisinesList] = values;

    if (!name || !cityName) {
      console.warn(`Row ${i} missing required name or city. Skipping.`);
      continue;
    }

    const lat = Number(latStr) || 17.4168;
    const lng = Number(lngStr) || 78.4382;
    const priceRange = Number(prStr) || 2;
    const slug = `${slugify(name)}-${Math.random().toString(36).substring(2, 6)}`;

    // Ensure City exists
    const city = await prisma.city.upsert({
      where: { slug: slugify(cityName) },
      update: {},
      create: {
        name: cityName,
        slug: slugify(cityName),
        state: "Telangana",
        latitude: lat,
        longitude: lng,
      },
    });

    // Ensure Area exists
    const area = await prisma.area.upsert({
      where: {
        cityId_slug: {
          cityId: city.id,
          slug: slugify(areaName || "central"),
        },
      },
      update: {},
      create: {
        cityId: city.id,
        name: areaName || "Central",
        slug: slugify(areaName || "central"),
        latitude: lat,
        longitude: lng,
      },
    });

    // Connect Cuisines
    const cuisineSlugs = (cuisinesList || "cafe").split(",").map((s) => slugify(s.trim()));
    const matchedCuisines = await prisma.cuisine.findMany({
      where: { slug: { in: cuisineSlugs } },
    });

    await prisma.restaurant.create({
      data: {
        name,
        slug,
        phone,
        website: website || null,
        priceRange,
        status: RestaurantStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        dataProvenance: "ADMIN_CSV_IMPORT",
        location: {
          create: {
            address,
            cityName: city.name,
            cityId: city.id,
            areaName: area.name,
            areaId: area.id,
            state: city.state,
            country: "India",
            postalCode: "500001",
            latitude: lat,
            longitude: lng,
          },
        },
        cuisines: {
          create: matchedCuisines.map((c) => ({
            cuisine: { connect: { id: c.id } },
          })),
        },
      },
    });

    importedCount++;
  }

  console.log(`✅ Successfully imported ${importedCount} restaurants from CSV with full provenance tracking.`);
}

importCSV().catch(console.error);
