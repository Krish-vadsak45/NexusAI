import { Connection } from "mongoose";

declare module "pdf-parse-fork";

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

export {};
