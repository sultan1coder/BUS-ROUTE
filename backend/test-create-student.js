const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "http://localhost:3000";

async function testCreateStudent() {
  try {
    console.log("🔍 Testing student creation endpoint...\n");

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

    // Step 2: Test student creation
    console.log("\n2. Testing student creation...");
    const studentData = {
      firstName: "Test",
      lastName: "Student",
      dateOfBirth: "2010-05-15",
      grade: "8",
      studentId: "TEST001",
      schoolId: "cmfsjrr4e0000ivlwjml45boe",
      rfidTag: "RFID123456",
      nfcTag: "NFC123456",
      medicalInfo: "No known allergies",
    };

    const createResponse = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log("✅ Student creation successful!");
      console.log("Response:", JSON.stringify(createData, null, 2));
    } else {
      const errorData = await createResponse.json();
      console.log("❌ Student creation failed:");
      console.log("Status:", createResponse.status);
      console.log("Error:", JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testCreateStudent();
