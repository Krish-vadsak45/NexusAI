declare module "pdf-parse-fork" {
  function pdf(
    dataBuffer: Buffer,
    options?: Record<string, unknown>,
  ): Promise<{
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }>;
  export default pdf;
}
