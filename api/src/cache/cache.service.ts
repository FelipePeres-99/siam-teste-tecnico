export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract smembers<T>(key: string): Promise<T[] | null>;
  abstract isTokenBlacklisted(token: string): Promise<boolean>;
  // API não tem permissão pra alterar informações no cache
}

