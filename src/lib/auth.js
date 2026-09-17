import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash plain-text password using bcrypt
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plain password against stored password.
 * Supports bcrypt hashes AND plain-text (auto-migration friendly).
 */
export async function verifyPassword(plainPassword, storedPassword) {
  if (!plainPassword || !storedPassword) return false;

  // Check if stored password is a bcrypt hash
  const isBcrypt = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

  if (isBcrypt) {
    try {
      return await bcrypt.compare(plainPassword, storedPassword);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plain text passwords (e.g. dev/seed data)
  return plainPassword === storedPassword;
}

