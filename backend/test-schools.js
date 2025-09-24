const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "http://localhost:3000";

async function testGetSchools() {
  try {
    console.log("🔍 Testing schools endpoint...\n");

    // Step 1: Login to get token
    console.log("1. Logging in...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123",
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log("❌ Login failed:", errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log("✅ Login successful!");

    // Step 2: Get schools
    console.log("\n2. Getting schools...");
    const schoolsResponse = await fetch(`${BASE_URL}/api/admin/schools`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (schoolsResponse.ok) {
      const schoolsData = await schoolsResponse.json();
      console.log("✅ Schools retrieved successfully!");
      console.log("Schools:", JSON.stringify(schoolsData, null, 2));

      if (schoolsData.data && schoolsData.data.length > 0) {
        console.log("\nFirst school ID:", schoolsData.data[0].id);
      }
    } else {
      const errorData = await schoolsResponse.json();
      console.log("❌ Failed to get schools:");
      console.log("Status:", schoolsResponse.status);
      console.log("Error:", JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testGetSchools();
