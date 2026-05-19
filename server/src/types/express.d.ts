import type { UserRecord } from "../data/store.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

export {};

