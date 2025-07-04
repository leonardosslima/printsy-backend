import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        active: boolean;
      };
      rawBody?: Buffer;
    }
  }
}

export {};