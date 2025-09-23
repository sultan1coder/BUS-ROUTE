const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

async function testAttendanceEndpoint() {
  try {
    console.log("🔍 Testing student attendance endpoint...\n");

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

    // Step 2: Test attendance endpoint
    console.log("\n2. Testing attendance endpoint...");
    const attendanceResponse = await fetch(
      `${BASE_URL}/api/students/attendance?date=2025-09-23`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json();
      console.log("✅ Attendance endpoint working!");
      console.log("Response:", JSON.stringify(attendanceData, null, 2));
    } else {
      const errorData = await attendanceResponse.json();
      console.log("❌ Attendance endpoint failed:");
      console.log("Status:", attendanceResponse.status);
      console.log("Error:", JSON.stringify(errorData, null, 2));
    }

    // Step 3: Test without authentication (should fail)
    console.log("\n3. Testing without authentication (should fail)...");
    const noAuthResponse = await fetch(
      `${BASE_URL}/api/students/attendance?date=2025-09-23`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (noAuthResponse.ok) {
      console.log(
        "⚠️  Endpoint accessible without authentication (security issue!)"
      );
    } else {
      console.log("✅ Endpoint properly protected (requires authentication)");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testAttendanceEndpoint();
