export class NotificationService {
  static send(_userId: string, _title: string, _message: string): Promise<void> {
    return Promise.resolve()
  }

  static getUnread(_userId: string): Promise<unknown[]> {
    return Promise.resolve([])
  }

  static markAsRead(_notificationId: string): Promise<void> {
    return Promise.resolve()
  }
}
