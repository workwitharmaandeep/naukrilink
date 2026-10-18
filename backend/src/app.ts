import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.config';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/students/student.routes';
import companyRoutes from './modules/companies/company.routes';
import internshipRoutes from './modules/internships/internship.routes';
import applicationRoutes from './modules/applications/application.routes';
import skillRoutes from './modules/skills/skills.routes';
import verificationRoutes from './modules/verification/verification.routes';
import reportRoutes from './modules/reports/report.routes';
import quizRoutes from './modules/quizzes/quiz.routes';
import interviewRoutes from './modules/interviews/interview.routes';
import matchingRoutes from './modules/matching/matching.routes';
import mentorshipRoutes from './modules/mentorship/mentorship.routes';
import notificationRoutes from './modules/notifications/notification.routes';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [env.WEB_CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Parsers & Cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url === '/api/v1/health',
        },
      })
    );
  }

  // Rate Limiting
  app.use('/api/', apiLimiter);

  // Health Check
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'nexaura-api',
      version: '1.0.0',
    });
  });

  // REST API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/companies', companyRoutes);
  app.use('/api/v1/internships', internshipRoutes);
  app.use('/api/v1/applications', applicationRoutes);
  app.use('/api/v1/skills', skillRoutes);
  app.use('/api/v1/verification', verificationRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/quizzes', quizRoutes);
  app.use('/api/v1/interviews', interviewRoutes);
  app.use('/api/v1/matching', matchingRoutes);
  app.use('/api/v1/mentorship', mentorshipRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist`,
        details: null,
      },
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
