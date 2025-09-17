# Admin Setup Guide

This guide will help you set up an admin user and test the login functionality for the School Bus Tracking System.

## Prerequisites

1. **PostgreSQL Database**: Make sure you have PostgreSQL running
2. **Environment Variables**: Create a `.env` file in the backend directory
3. **Node.js Dependencies**: Install all dependencies

## Step 1: Environment Setup

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bus_route_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"
```

**Important**: Replace the database credentials with your actual PostgreSQL credentials.

## Step 2: Database Setup

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma Client**:

   ```bash
   npm run prisma:generate
   ```

3. **Run Database Migrations**:

   ```bash
   npm run prisma:migrate
   ```

4. **Push Schema to Database**:
   ```bash
   npm run prisma:push
   ```

## Step 3: Create Admin User

Run the admin setup script:

```bash
# Option 1: Run the setup script
node setup-admin.js

# Option 2: Use npm script (if added to package.json)
npm run setup-admin
```

This will create an admin user with:

- **Email**: admin@school.com
- **Password**: admin123
- **Role**: ADMIN

## Step 4: Start the Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Step 5: Test Admin Login

### Option A: Use the Test Script

```bash
node test-login.js
```

### Option B: Manual Testing with cURL

1. **Test Health Endpoint**:

   ```bash
   curl http://localhost:3000/health
   ```

2. **Login as Admin**:

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@school.com",
       "password": "admin123"
     }'
   ```

3. **Expected Response**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": {
         "id": "...",
         "email": "admin@school.com",
         "role": "ADMIN",
         "firstName": "School",
         "lastName": "Administrator"
       },
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

## Step 6: Frontend Integration

### Login Request Example

```javascript
const loginAdmin = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123",
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

### Using the Access Token

```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
};
```

## Troubleshooting

### 404 Error on Login

- Make sure the backend server is running on port 3000
- Check that the `.env` file exists and has correct values
- Verify the database connection is working

### Database Connection Error

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Run `npm run prisma:generate` after updating `.env`

### JWT Token Errors

- Make sure JWT_SECRET is set in `.env`
- Check token expiration (default: 7 days)

### Admin User Not Found

- Run the setup script again: `node setup-admin.js`
- Check database to see if user was created

## Default Admin Credentials

- **Email**: admin@school.com
- **Password**: admin123
- **Role**: ADMIN

## API Endpoints

- **POST** `/api/auth/login` - Admin login
- **GET** `/api/auth/profile` - Get admin profile (requires auth)
- **POST** `/api/auth/logout` - Logout
- **GET** `/health` - Health check

## Next Steps

1. Create additional admin users through the UI
2. Set up school staff accounts
3. Configure bus routes and drivers
4. Set up parent accounts for student tracking

---

For more information, check the API documentation in `backend/API.md`
