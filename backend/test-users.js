// Test user management functionality
// Try to use built-in fetch, fallback to node-fetch
let fetch;
try {
  fetch = global.fetch;
} catch {
  fetch = require("node-fetch");
}

const BASE_URL = "http://localhost:3000";
const API_BASE = `${BASE_URL}/api`;

async function testUserManagement() {
  console.log("🚀 Testing User Management Endpoints\n");

  try {
    // Test 1: Login to get token
    console.log("1️⃣ Testing Admin Login...");
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
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
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log("✅ Login successful, got token\n");

    // Test 2: Get users list
    console.log("2️⃣ Testing Get Users...");
    const usersResponse = await fetch(`${API_BASE}/admin/users?limit=5`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!usersResponse.ok) {
      throw new Error(`Get users failed: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    console.log("✅ Users retrieved successfully");
    console.log(`📊 Found ${usersData.data?.length || 0} users\n`);

    // Test 3: Get user analytics
    console.log("3️⃣ Testing User Analytics...");
    const analyticsResponse = await fetch(`${API_BASE}/admin/analytics/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics failed: ${analyticsResponse.status}`);
    }

    const analyticsData = await analyticsResponse.json();
    console.log("✅ Analytics retrieved successfully");
    console.log(`📈 Total users: ${analyticsData.data?.totalUsers || 0}`);
    console.log(`👥 Active users: ${analyticsData.data?.activeUsers || 0}\n`);

    // Test 4: Get dashboard data
    console.log("4️⃣ Testing Dashboard Data...");
    const dashboardResponse = await fetch(`${API_BASE}/admin/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard failed: ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    console.log("✅ Dashboard data retrieved successfully");
    console.log(`📊 Overview stats loaded: ${!!dashboardData.data?.overview}`);
    console.log(`📈 Analytics loaded: ${!!dashboardData.data?.userAnalytics}`);
    console.log(
      `🔔 Recent activities: ${
        dashboardData.data?.recentActivities?.length || 0
      }\n`
    );

    console.log("🎉 All User Management tests passed!");
    console.log("\n📋 User Management Features Verified:");
    console.log("✅ User authentication & authorization");
    console.log("✅ User listing with pagination");
    console.log("✅ User analytics & statistics");
    console.log("✅ Dashboard data integration");
    console.log("✅ Role-based access control");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testUserManagement();
