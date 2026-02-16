export abstract class CacheService {
  abstract populateAllCaches()
  abstract setRefreshToken(userId: number, refreshToken: string, expiresIn: number)
  abstract setTokenToBlacklist(token: string)
  abstract revokeRefreshToken(userId: number)
  abstract pipeline()
  abstract set(key: string, value: string, ...args: any[]): Promise<any>
  abstract del(...keys: string[]): Promise<number>
  abstract sadd(key: string, ...members: (string | number)[]): Promise<number>
}
