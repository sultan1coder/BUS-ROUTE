const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@school.com",
        password: hashedPassword,
        role: "ADMIN",
        firstName: "School",
        lastName: "Administrator",
        phone: "+1234567890",
        isActive: true,
      },
    });

    console.log("Admin user created successfully!");
    console.log("Email:", adminUser.email);
    console.log("Password: admin123");
    console.log("Role:", adminUser.role);

    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

async function testAdminLogin() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("No admin user found. Please run createAdminUser() first.");
      return;
    }

    // Test password verification
    const isValidPassword = await bcrypt.compare(
      "admin123",
      adminUser.password
    );

    if (isValidPassword) {
      console.log("✅ Password verification successful");

      // Generate JWT token
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
        },
        process.env.JWT_SECRET ||
          "your-super-secret-jwt-key-change-this-in-production",
        { expiresIn: "7d" }
      );

      console.log("✅ JWT token generated successfully");
      console.log("Token:", token.substring(0, 50) + "...");

      return { user: adminUser, token };
    } else {
      console.log("❌ Password verification failed");
      return null;
    }
  } catch (error) {
    console.error("Error testing admin login:", error);
    throw error;
  }
}

// Run the setup
async function main() {
  try {
    console.log("🚀 Setting up admin user...");
    await createAdminUser();

    console.log("\n🔍 Testing admin login...");
    await testAdminLogin();

    console.log("\n✅ Admin setup completed successfully!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions for use in other scripts
module.exports = {
  createAdminUser,
  testAdminLogin,
};

// Run if called directly
if (require.main === module) {
  main();
}
