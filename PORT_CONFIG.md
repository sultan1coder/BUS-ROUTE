# Port Configuration Guide

## Updated Port Configuration

### Frontend (Next.js)

- **Port**: `4000` (changed from 3000)
- **URL**: `http://localhost:4000`
- **Command**: `cd frontend && npm run dev`

### Backend (Express.js)

- **Port**: `3000` (unchanged)
- **URL**: `http://localhost:3000`
- **Command**: `cd backend && npm run dev`

## Running the Application

### Option 1: Run Both Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 2: Using Environment Variables

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (alternative)
cd frontend
PORT=4000 npm run dev
```

## API Communication

- **Frontend → Backend**: `http://localhost:3000/api/*`
- **Frontend URL**: `http://localhost:4000`
- **CORS**: Configured for both ports (3000, 4000)

## Testing

### Backend Health Check

```bash
curl http://localhost:3000/health
```

### Frontend Access

Open browser to: `http://localhost:4000`

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Environment Variables

Make sure to restart terminals after changing environment variables.

## Network Access

For network access from other devices:

- Frontend: `http://YOUR_IP:4000`
- Backend: `http://YOUR_IP:3000`

## Configuration Files Updated

1. `frontend/package.json` - Updated dev and start scripts
2. `frontend/env.local` - Environment variables
3. `backend/src/server.ts` - CORS configuration
4. Added `PORT_CONFIG.md` - This documentation
