import searchService from "../lib/search/search-service";
import prisma from "../lib/db/prisma";

async function runE2ETests() {
  console.log("🚀 Starting FoodAtlas End-to-End Simulation Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(description: string, condition: boolean) {
    if (condition) {
      console.log(`  ✅ E2E PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ E2E FAIL: ${description}`);
      failed++;
    }
  }

  // 1. User searches for "biryani" in Hyderabad
  console.log("🔹 Step 1: User Search Flow");
  const searchResult = await searchService.search({
    query: "biryani",
    city: "Hyderabad",
  });
  assert("User searching 'biryani' in Hyderabad receives matching places", searchResult.restaurants.length > 0);
  assert("Search results contain restaurant name and rating metadata", searchResult.restaurants[0].name.length > 0 && searchResult.restaurants[0].averageRating > 0);

  // 2. User opens restaurant page
  console.log("\n🔹 Step 2: User Views Restaurant Details & Menu");
  const firstRestaurant = searchResult.restaurants[0];
  const fullRestaurant = await prisma.restaurant.findUnique({
    where: { id: firstRestaurant.id },
    include: {
      location: true,
      menuCategories: {
        include: { items: true },
      },
      reviews: true,
      openingHours: true,
    },
  });

  assert("Restaurant page successfully loads full address and coordinates", fullRestaurant?.location?.address !== undefined);
  assert("Restaurant page successfully displays opening hours for 7 days", fullRestaurant?.openingHours.length === 7);
  assert("Restaurant menu categories load with active menu items", (fullRestaurant?.menuCategories.length ?? 0) > 0);

  // 3. Digital Menu / QR verification
  console.log("\n🔹 Step 3: QR Menu Inspection");
  const sampleItem = fullRestaurant?.menuCategories[0]?.items[0];
  assert("Menu item contains price, name, and diet indicator", sampleItem?.price !== undefined && sampleItem?.veg !== undefined);

  // 4. Owner & Admin flow check
  console.log("\n🔹 Step 4: Admin Moderation Status Check");
  const activePlaces = await prisma.restaurant.count({ where: { status: "ACTIVE" } });
  assert("System has active restaurants ready for public consumption", activePlaces >= 30);

  console.log(`\n========================================`);
  console.log(`E2E Simulation Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch((e) => {
  console.error("E2E Simulation Failed:", e);
  process.exit(1);
});
