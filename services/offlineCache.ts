import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class OfflineCacheService {
  private readonly CACHE_PREFIX = 'cache_';
  private readonly DEFAULT_EXPIRY = 1000 * 60 * 60; // 1 hour

  // Save data to cache
  async set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRY): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheItem.timestamp;

      // Check if expired
      if (age > cacheItem.expiresIn) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Remove item from cache
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Cache projects
  async cacheProjects(projects: any[]): Promise<void> {
    await this.set('projects', projects, 1000 * 60 * 30); // 30 minutes
  }

  async getCachedProjects(): Promise<any[] | null> {
    return await this.get('projects');
  }

  // Cache teams
  async cacheTeams(teams: any[]): Promise<void> {
    await this.set('teams', teams, 1000 * 60 * 30); // 30 minutes
  }

  async getCachedTeams(): Promise<any[] | null> {
    return await this.get('teams');
  }

  // Cache skills
  async cacheSkills(skills: any[]): Promise<void> {
    await this.set('skills', skills, 1000 * 60 * 60 * 24); // 24 hours
  }

  async getCachedSkills(): Promise<any[] | null> {
    return await this.get('skills');
  }

  // Cache user profile
  async cacheUserProfile(profile: any): Promise<void> {
    await this.set('userProfile', profile, 1000 * 60 * 15); // 15 minutes
  }

  async getCachedUserProfile(): Promise<any | null> {
    return await this.get('userProfile');
  }

  // Check if online
  async isOnline(): Promise<boolean> {
    try {
      // Simple check - try to fetch from a reliable endpoint
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      return false;
    }
  }

  // Get cache info
  async getCacheInfo(): Promise<{ keys: string[]; size: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      // Estimate size (rough calculation)
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        keys: cacheKeys.map(k => k.replace(this.CACHE_PREFIX, '')),
        size: totalSize,
      };
    } catch (error) {
      console.error('Cache info error:', error);
      return { keys: [], size: 0 };
    }
  }
}

export default new OfflineCacheService();
