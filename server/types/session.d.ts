import 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminUser?: { email: string; isAdmin: boolean } | null;
    betaUser?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      betaStatus: string;
    } | null;
  }
}
