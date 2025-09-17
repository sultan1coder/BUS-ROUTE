const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

async function testLogin() {
  try {
    console.log("🔍 Testing admin login endpoint...");

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login successful!");
      console.log("Response:", {
        success: data.success,
        message: data.message,
        user: {
          id: data.data?.user?.id,
          email: data.data?.user?.email,
          role: data.data?.user?.role,
          firstName: data.data?.user?.firstName,
          lastName: data.data?.user?.lastName,
        },
        token: data.data?.accessToken
          ? "Present (hidden for security)"
          : "Missing",
      });

      // Test token validation
      if (data.data?.accessToken) {
        console.log("\n🔍 Testing token validation...");
        const tokenResponse = await fetch(
          `${BASE_URL}/api/auth/validate-token`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.data.accessToken}`,
            },
          }
        );

        if (tokenResponse.ok) {
          console.log("✅ Token validation successful!");
        } else {
          console.log("❌ Token validation failed");
        }
      }

      return data;
    } else {
      const errorData = await response.json();
      console.log("❌ Login failed:");
      console.log("Status:", response.status);
      console.log("Error:", errorData);
      return null;
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    return null;
  }
}

async function testHealth() {
  try {
    console.log("🔍 Testing health endpoint...");

    const response = await fetch(`${BASE_URL}/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Health check successful!");
      console.log("Server status:", data.status);
      console.log("Uptime:", data.uptime, "seconds");
      return true;
    } else {
      console.log("❌ Health check failed");
      console.log("Status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Health check error:", error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log("🚀 Starting login tests...\n");

  // Test health endpoint first
  const healthOk = await testHealth();
  console.log("");

  if (!healthOk) {
    console.log(
      "❌ Server is not responding. Please start the backend server first."
    );
    console.log("Run: cd backend && npm run dev");
    return;
  }

  // Test login
  await testLogin();

  console.log("\n✅ Tests completed!");
}

// Export for use in other scripts
module.exports = {
  testLogin,
  testHealth,
};

// Run if called directly
if (require.main === module) {
  runTests();
}
