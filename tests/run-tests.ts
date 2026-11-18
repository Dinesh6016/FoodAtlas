import { SignupSchema, LoginSchema, RestaurantSchema, MenuItemSchema } from "../lib/validation/schemas";
import { formatPrice, formatPriceRange, slugify } from "../lib/utils";
import { signToken, verifyToken, hashPassword, verifyPassword } from "../lib/auth/auth";
import { checkRateLimit } from "../lib/rate-limit/rate-limiter";
import prisma from "../lib/db/prisma";

async function runUnitAndIntegrationTests() {
  console.log("🧪 Starting FoodAtlas Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(description: string, condition: boolean) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  // --- UNIT TESTS: Utilities & Formatting ---
  console.log("🔹 Testing Utilities & Formatting:");
  assert("formatPrice formats INR correctly", formatPrice(450).includes("450"));
  assert("formatPriceRange returns correct ₹ repetitions", formatPriceRange(1) === "₹" && formatPriceRange(3) === "₹₹₹");
  assert("slugify generates clean URL safe slugs", slugify("Paradise Biryani & Kebabs!!") === "paradise-biryani-kebabs");

  // --- UNIT TESTS: Validation Schemas ---
  console.log("\n🔹 Testing Zod Validation Schemas:");
  const validSignup = SignupSchema.safeParse({
    name: "Vikram Oberoi",
    email: "chef@example.com",
    password: "secretpassword",
    role: "OWNER",
  });
  assert("SignupSchema accepts valid payload", validSignup.success === true);

  const invalidSignup = SignupSchema.safeParse({
    name: "V",
    email: "invalid-email",
    password: "123",
  });
  assert("SignupSchema rejects invalid email/short password", invalidSignup.success === false);

  const validMenuItem = MenuItemSchema.safeParse({
    categoryId: "cat-123",
    name: "Paneer Tikka",
    price: 320,
    veg: true,
  });
  assert("MenuItemSchema validates proper item", validMenuItem.success === true);

  // --- UNIT TESTS: Authentication & Crypto ---
  console.log("\n🔹 Testing Auth & Password Hashing:");
  const rawPass = "supersecurepass123";
  const hash = await hashPassword(rawPass);
  const isValid = await verifyPassword(rawPass, hash);
  const isWrong = await verifyPassword("wrongpassword", hash);
  assert("Password hashing and bcrypt verification works", isValid && !isWrong);

  const token = signToken({
    id: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    role: "USER",
  });
  const decoded = verifyToken(token);
  assert("JWT signing and token verification works", decoded !== null && decoded.email === "test@example.com");

  // --- UNIT TESTS: Rate Limiting ---
  console.log("\n🔹 Testing Rate Limiter:");
  const rlKey = "test-ip-rate-limit";
  const r1 = checkRateLimit(rlKey, 2, 10);
  const r2 = checkRateLimit(rlKey, 2, 10);
  const r3 = checkRateLimit(rlKey, 2, 10);
  assert("Rate limiter allows up to limit and blocks excess calls", r1.success && r2.success && !r3.success);

  // --- INTEGRATION TESTS: Database Queries & Relations ---
  console.log("\n🔹 Testing Database Integration:");
  try {
    const restaurantCount = await prisma.restaurant.count();
    assert("Prisma can count active restaurants in database", restaurantCount > 0);

    const sample = await prisma.restaurant.findFirst({
      where: { slug: "paradise-biryani-heritage" },
      include: {
        location: true,
        cuisines: true,
        menuCategories: { include: { items: true } },
      },
    });

    assert("Restaurant has populated location relation", sample !== null && sample.location !== null);
    assert("Restaurant has populated menu categories and items", sample !== null && sample.menuCategories.length > 0);
  } catch (err: any) {
    console.error("Database test error:", err);
    assert("Database integration executed without exception", false);
  }

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runUnitAndIntegrationTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
