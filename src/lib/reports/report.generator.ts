export class ReportGenerator {
  static generate(_type: string, _params: Record<string, unknown>): Promise<Buffer> {
    return Promise.resolve(Buffer.alloc(0))
  }

  static getAvailableReports(): string[] {
    return []
  }
}
