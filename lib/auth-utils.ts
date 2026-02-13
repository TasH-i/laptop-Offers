// lib/auth-utils.ts

import { randomBytes, createHash } from 'crypto'

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex')
}

/**
 * Hash a refresh token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Get refresh token expiry date (7 days from now)
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)
  return expiry
}

/**
 * Check if an email is in the admin list
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ALLOW_ADMIN_EMAILS?.split(',').map((e) =>
    e.trim().toLowerCase()
  ) || []
  return adminEmails.includes(email.toLowerCase())
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  message: string
} {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  return { isValid: true, message: '' }
}

/**
 * Validate phone number (Sri Lankan format)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Allow formats: +94XXXXXXXXX, 0XXXXXXXXX, 94XXXXXXXXX
  const phoneRegex = /^(\+?94|0)?[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}