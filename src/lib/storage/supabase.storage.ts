export class StorageService {
  static upload(_file: File, _path: string): Promise<string> {
    return Promise.resolve("")
  }

  static getSignedUrl(_path: string): Promise<string> {
    return Promise.resolve("")
  }

  static delete(_path: string): Promise<void> {
    return Promise.resolve()
  }
}
