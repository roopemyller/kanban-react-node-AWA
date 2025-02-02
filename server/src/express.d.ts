// src/types/express.d.ts
declare namespace Express {
    export interface Request {
      user?: any; // This will allow you to add `user` property to `req`
    }
  }
  