import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import scheduleRoutes from './routes/schedules.js';
import sessionRoutes from './routes/sessions.js';
import attendanceRoutes from './routes/attendance.js';
import facultyRoutes from './routes/facultyRoutes.js';
import adminRoutes from './routes/admin.js';
import semesterRoutes from './routes/semesters.js';
import notificationRoutes from './routes/notifications.js';
import classRepRoutes from './routes/classrep.js';
import suggestionRoutes from './routes/suggestions.js';
import financeRoutes from './routes/finance.js';
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is running', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/classrep', classRepRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/finance', financeRoutes);
// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;
