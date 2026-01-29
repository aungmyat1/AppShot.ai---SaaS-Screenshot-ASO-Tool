/**
 * Type declaration for 'archiver' so the build passes when @types/archiver
 * is not resolved (e.g. in Vercel monorepo). Use default import: import archiver from "archiver"
 */
declare module "archiver" {
  import { Writable } from "stream";

  interface Archiver {
    pipe<T extends Writable>(destination: T): T;
    append(
      source: string | Buffer | NodeJS.ReadableStream,
      data?: { name: string }
    ): Archiver;
    finalize(): Promise<void>;
    abort(): void;
    on(event: string, callback: (...args: unknown[]) => void): Archiver;
  }

  function archiver(format: string, options?: Record<string, unknown>): Archiver;
  export default archiver;
}
