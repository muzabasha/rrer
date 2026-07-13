export class SearchEngine {
  static search(_query: string, _filters?: Record<string, unknown>): Promise<unknown[]> {
    return Promise.resolve([])
  }

  static indexDocument(_id: string, _data: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}
