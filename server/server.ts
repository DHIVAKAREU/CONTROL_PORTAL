import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import New Authentication Routes
import authRoutes from './src/routes/auth.routes';
import adminRoutes from './src/routes/admin.routes';
import superAdminRoutes from './src/routes/superadmin.routes';

// Restore Application Feature Routes (Needed for Dashboard)
import zoneRoutes from './src/routes/zones.routes';
import eventRoutes from './src/routes/events.routes';
import permissionRoutes from './src/routes/permission.routes';
import platformRoutes from './src/routes/platform.routes';

// Import Controllers for direct mapping (Resilience Layer)
import { listUsers } from './src/controllers/users.controller';
import { getZones } from './src/controllers/zones.controller';
import { authenticate } from './src/middleware/auth';

// Import Config
import { initSocket } from './src/config/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Config Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Custom Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    system: 'SmartAccess_Gateway_v3_Strict', 
    timestamp: new Date().toISOString() 
  });
});

// Primary V2 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/platform', platformRoutes);

// --- COMPATIBILITY LAYER (Support for Legacy Frontend Paths) ---
// These ensure the Command Center and User Directory continue to work during transition.
app.get('/api/users', authenticate, listUsers);
app.use('/api/users', adminRoutes); // Handles POST /api/users, etc.
app.get('/api/org/zones', authenticate, getZones);
app.use('/api/org/zones', zoneRoutes);
// -----------------------------------------------------------------

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('JWT_SECRET_STATUS:', process.env.JWT_SECRET ? 'LOADED_FROM_ENV' : 'USING_DEFAULT_FALLBACK');
});

// Global Error Handler (MUST be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[GLOBAL_ERROR] [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.error('Stack:', err.stack);
  console.error('Details:', err.message);
  
  res.status(500).json({ 
    error: 'INTERNAL_ERROR', 
    message: err.message, 
    path: req.path,
    timestamp: new Date().toISOString()
  });
});
