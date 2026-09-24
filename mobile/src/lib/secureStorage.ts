import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Where the login session lives.
 *
 *  - iOS/Android: the OS keychain/keystore (expo-secure-store), encrypted at rest and
 *    excluded from backups — instead of plaintext AsyncStorage.
 *    SecureStore values are limited to ~2KB, and Supabase sessions are bigger, so the
 *    value is split into numbered chunks.
 *  - Web: sessionStorage — the token dies with the tab and isn't shared across tabs,
 *    which shrinks the window if a sibling page on the same origin is compromised.
 */

const CHUNK = 1800;
const safeKey = (k: string) => k.replace(/[^A-Za-z0-9._-]/g, '_');

const native = {
  async getItem(key: string): Promise<string | null> {
    const k = safeKey(key);
    const countRaw = await SecureStore.getItemAsync(`${k}__n`);
    if (!countRaw) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(countRaw); i++) {
      const part = await SecureStore.getItemAsync(`${k}__${i}`);
      if (part == null) return null; // corrupted/partial — treat as signed out
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const k = safeKey(key);
    await native.removeItem(key);
    const n = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${k}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK), {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
    }
    await SecureStore.setItemAsync(`${k}__n`, String(n));
  },
  async removeItem(key: string): Promise<void> {
    const k = safeKey(key);
    const countRaw = await SecureStore.getItemAsync(`${k}__n`);
    const n = Number(countRaw ?? 0);
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${k}__${i}`);
    await SecureStore.deleteItemAsync(`${k}__n`);
  },
};

const web = {
  async getItem(key: string) {
    try {
      return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* storage blocked (private mode) — session stays in memory only */
    }
  },
  async removeItem(key: string) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const sessionStorageAdapter = Platform.OS === 'web' ? web : native;
