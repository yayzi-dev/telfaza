// High-Security Admin Authentication Service using native Web Crypto API (SHA-256 + Salt)
// Features: Zero plain-text storage, Anti-Brute Force Exponential Backoff, Session Token Auto-Expiry, Audit Logging.

const STORAGE_KEY_AUTH = 'perkvex_secure_vault_auth_v1';
const STORAGE_KEY_AUDIT = 'perkvex_secure_vault_audit_v1';
const DEFAULT_SALT = 'perkvex_salt_99x_cinema_secure_2026';

// Default master password hash for: "perkvex2026"
// Admin can instantly change this to any custom password from the Security Settings tab.
const DEFAULT_MASTER_HASH = 'e4a2d815d7f7e9b0c265691079d38c6d1796be79ff46ff6d956bf3ebf686ca55';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  event: 'login_success' | 'login_failed' | 'password_changed' | 'session_expired' | 'manual_logout' | 'panic_wipe';
  ipInfo?: string;
  userAgent?: string;
  details?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  failedAttempts: number;
  lockoutUntil: number | null;
}

// Convert string to SHA-256 hex string using native browser SubtleCrypto
export async function hashPassword(password: string, salt: string = DEFAULT_SALT): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}::${password}::${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate high-entropy cryptographically secure random session token
export function generateSecureToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
}

class AdminAuthService {
  private currentPasswordHash: string;
  private currentSalt: string;
  private quickPinHash: string | null = null;
  private sessionTimeoutMs: number = 30 * 60 * 1000; // 30 minutes default
  private failedAttempts: number = 0;
  private lockoutUntil: number | null = null;
  private sessionToken: string | null = null;
  private sessionExpiresAt: number | null = null;
  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.currentPasswordHash = DEFAULT_MASTER_HASH;
    this.currentSalt = DEFAULT_SALT;
    this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.passwordHash) this.currentPasswordHash = parsed.passwordHash;
        if (parsed.salt) this.currentSalt = parsed.salt;
        if (parsed.quickPinHash) this.quickPinHash = parsed.quickPinHash;
        if (parsed.sessionTimeoutMs) this.sessionTimeoutMs = parsed.sessionTimeoutMs;
        if (parsed.failedAttempts) this.failedAttempts = parsed.failedAttempts;
        if (parsed.lockoutUntil && parsed.lockoutUntil > Date.now()) {
          this.lockoutUntil = parsed.lockoutUntil;
        }

        // Restore active session if valid
        if (parsed.sessionToken && parsed.sessionExpiresAt && parsed.sessionExpiresAt > Date.now()) {
          this.sessionToken = parsed.sessionToken;
          this.sessionExpiresAt = parsed.sessionExpiresAt;
        }
      }
    } catch {
      // Fallback to defaults
    }
  }

  private saveState() {
    try {
      const data = {
        passwordHash: this.currentPasswordHash,
        salt: this.currentSalt,
        quickPinHash: this.quickPinHash,
        sessionTimeoutMs: this.sessionTimeoutMs,
        failedAttempts: this.failedAttempts,
        lockoutUntil: this.lockoutUntil,
        sessionToken: this.sessionToken,
        sessionExpiresAt: this.sessionExpiresAt,
      };
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(cb: (state: AuthState) => void): () => void {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public getState(): AuthState {
    const isSessionValid = Boolean(
      this.sessionToken &&
      this.sessionExpiresAt &&
      this.sessionExpiresAt > Date.now()
    );

    return {
      isAuthenticated: isSessionValid,
      sessionToken: isSessionValid ? this.sessionToken : null,
      sessionExpiresAt: isSessionValid ? this.sessionExpiresAt : null,
      failedAttempts: this.failedAttempts,
      lockoutUntil: this.lockoutUntil && this.lockoutUntil > Date.now() ? this.lockoutUntil : null,
    };
  }

  // Anti-Brute Force verification
  public async login(passwordOrPin: string): Promise<{ success: boolean; error?: string }> {
    // 1. Check active lockout
    if (this.lockoutUntil && this.lockoutUntil > Date.now()) {
      const secondsLeft = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Security Lockout Active. Please wait ${secondsLeft}s before retrying.`,
      };
    }

    const testHash = await hashPassword(passwordOrPin, this.currentSalt);
    const isMasterMatch = testHash === this.currentPasswordHash;
    const isPinMatch = this.quickPinHash ? testHash === this.quickPinHash : false;

    if (isMasterMatch || isPinMatch) {
      // Login Success: Reset attempts, issue fresh session
      this.failedAttempts = 0;
      this.lockoutUntil = null;
      this.sessionToken = generateSecureToken();
      this.sessionExpiresAt = Date.now() + this.sessionTimeoutMs;
      this.saveState();

      this.logAudit({
        id: `audit-${Date.now()}`,
        timestamp: Date.now(),
        event: 'login_success',
        details: isPinMatch ? 'Authenticated via Quick PIN' : 'Authenticated via Master Password',
        userAgent: navigator.userAgent,
      });

      return { success: true };
    }

    // Login Failed: Increment failed attempts & apply exponential backoff
    this.failedAttempts += 1;
    let lockoutDuration = 0;
    if (this.failedAttempts >= 5) {
      // 5 attempts = 30s lockout
      lockoutDuration = 30 * 1000;
    }
    if (this.failedAttempts >= 8) {
      // 8 attempts = 3 minutes lockout
      lockoutDuration = 180 * 1000;
    }
    if (this.failedAttempts >= 10) {
      // 10+ attempts = 15 minutes lockout
      lockoutDuration = 900 * 1000;
    }

    if (lockoutDuration > 0) {
      this.lockoutUntil = Date.now() + lockoutDuration;
    }

    this.saveState();

    this.logAudit({
      id: `audit-${Date.now()}`,
      timestamp: Date.now(),
      event: 'login_failed',
      details: `Failed attempt #${this.failedAttempts}. Lockout: ${lockoutDuration ? `${lockoutDuration / 1000}s` : 'none'}`,
      userAgent: navigator.userAgent,
    });

    const attemptsRemaining = Math.max(0, 5 - this.failedAttempts);
    const errorMsg = lockoutDuration > 0
      ? `Too many failed attempts! Terminal locked for ${lockoutDuration / 1000} seconds.`
      : `Invalid credentials! (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before security lockout)`;

    return { success: false, error: errorMsg };
  }

  // Update password with custom salt
  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const verifyHash = await hashPassword(currentPassword, this.currentSalt);
    if (verifyHash !== this.currentPasswordHash) {
      return { success: false, error: 'Current password verification failed.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const newSalt = `salt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.currentSalt = newSalt;
    this.currentPasswordHash = await hashPassword(newPassword, newSalt);
    // Refresh session expiration
    this.sessionExpiresAt = Date.now() + this.sessionTimeoutMs;
    this.saveState();

    this.logAudit({
      id: `audit-${Date.now()}`,
      timestamp: Date.now(),
      event: 'password_changed',
      details: 'Master password updated securely with new cryptographic salt.',
      userAgent: navigator.userAgent,
    });

    return { success: true };
  }

  // Set 4-digit quick pin
  public async setQuickPin(pin: string): Promise<{ success: boolean; error?: string }> {
    if (!pin || pin.length < 4) {
      this.quickPinHash = null;
      this.saveState();
      return { success: true };
    }
    this.quickPinHash = await hashPassword(pin, this.currentSalt);
    this.saveState();
    return { success: true };
  }

  // Update session timeout length
  public setSessionTimeout(minutes: number) {
    this.sessionTimeoutMs = minutes * 60 * 1000;
    if (this.sessionExpiresAt) {
      this.sessionExpiresAt = Date.now() + this.sessionTimeoutMs;
    }
    this.saveState();
  }

  // Manual logout
  public logout() {
    this.sessionToken = null;
    this.sessionExpiresAt = null;
    this.saveState();

    this.logAudit({
      id: `audit-${Date.now()}`,
      timestamp: Date.now(),
      event: 'manual_logout',
      details: 'Admin logged out manually.',
      userAgent: navigator.userAgent,
    });
  }

  // Panic wipe all stored metrics & logs
  public panicWipe(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
      localStorage.removeItem('perkvex_stream_events_v1');
      localStorage.removeItem('perkvex_daily_visitors_v1');
    } catch {
      // ignore
    }
    this.sessionToken = null;
    this.sessionExpiresAt = null;
    this.currentPasswordHash = DEFAULT_MASTER_HASH;
    this.currentSalt = DEFAULT_SALT;
    this.failedAttempts = 0;
    this.lockoutUntil = null;
    this.saveState();
  }

  // Audit Logging
  public getAuditLogs(): AuditLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private logAudit(entry: AuditLogEntry) {
    try {
      const logs = this.getAuditLogs();
      const updated = [entry, ...logs].slice(0, 50); // Keep last 50 events
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export const adminAuth = new AdminAuthService();
