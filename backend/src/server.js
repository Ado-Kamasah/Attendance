import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection on startup
    console.log('Connecting to PostgreSQL database...');
    await prisma.$connect();
    console.log('Database connected successfully.');

    // Start Express listening
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  }
}

// Global process exception handlers
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from DB. Shutting down server.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from DB. Shutting down server.');
  process.exit(0);
});

startServer();
