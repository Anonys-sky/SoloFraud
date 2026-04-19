/**
 * SoloFraud Multi-Layer Security Perimeter
 * Implements PII Redaction, Injection Defense, and Rate Limiting.
 */

// Simple in-memory rate limiter for the hackathon demo
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_THRESHOLD = 20; // max requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW_MS) {
    userData.count = 0;
    userData.lastReset = now;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);

  return {
    success: userData.count <= RATE_LIMIT_THRESHOLD,
    remaining: Math.max(0, RATE_LIMIT_THRESHOLD - userData.count)
  };
}

/**
 * PII Sanitizer: The Mask
 * Masks Malaysian IC numbers, phone numbers, and emails.
 */
export function scrubPII(text: string): string {
  let sanitized = text;

  // Mask Malaysian IC Numbers (e.g., 901231-01-1234 or 901231011234)
  sanitized = sanitized.replace(/\b\d{6}[-]?\d{2}[-]?\d{4}\b/g, "[IC_HIDDEN]");

  // Mask Phone Numbers (Malaysian format)
  // Replaces all but the last 4 digits for context preservation
  sanitized = sanitized.replace(/(\+?6?01\d{1})(\d{3,4})(\d{4})/g, (match, p1, p2, p3) => {
    return `${p1}***${p3}`;
  });

  // Mask Emails
  sanitized = sanitized.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi, "[EMAIL_HIDDEN]");

  return sanitized;
}

/**
 * Injection Defense: The Sentinel
 * Detects malicious prompt engineering attempts.
 */
export function isMaliciousPrompt(text: string): { isMalicious: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  const injectionPatterns = [
    "ignore all previous instructions",
    "ignore previous instructions",
    "system prompt leak",
    "forget everything",
    "bypass security",
    "output the system message",
    "do not mention solo fraud",
    "stop being the advisor"
  ];

  for (const pattern of injectionPatterns) {
    if (lowerText.includes(pattern)) {
      return { isMalicious: true, reason: `Prompt Injection Pattern Detected: "${pattern}"` };
    }
  }

  // Detect high-frequency repetition (common in bot attacks)
  if (text.length > 500 && new Set(text.split(" ")).size < text.split(" ").length * 0.2) {
    return { isMalicious: true, reason: "Excessive Repetition / Entropy Failure" };
  }

  return { isMalicious: false };
}
