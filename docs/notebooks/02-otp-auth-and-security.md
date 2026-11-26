# Notebook 02: Cryptographic OTP & Gated Authentication Architecture

> **Focus**: Backend Security, Token Cryptography, State Machines, UX Resilience, SMTP Fallback Systems

---

## 1. Cryptographic Token Design: 64-Char Opaque Tokens vs 6-Digit Numeric OTPs

### The UX Failure of Raw Hash Tokens
In early milestone implementations, authentication tokens used 64-character base64 URL strings:
```typescript
export const createOpaqueToken = () => crypto.randomBytes(48).toString("base64url");
// Example: a7F9x_29BmK819vLqPz109s...
```
*Why this creates a terrible user experience:*
1. **Impossible to Type on Mobile**: Users checking email on a phone cannot easily copy/paste a 64-character string into a mobile input.
2. **Schema Rigidity**: Zod validators had `.min(32)`, completely blocking short codes.
3. **Link Fragility**: In many email clients (Outlook, university mail filters), long URL tokens get truncated, wrapped across lines, or sanitized, breaking the link.

### The 6-Digit Numeric OTP Standard
Modern platforms (GitHub, Google, Swiggy, Uber) use **6-digit cryptographic numeric OTPs**:
```typescript
export const createNumericOtp = (digits = 6): string => {
  const min = Math.pow(10, digits - 1); // 100,000
  const max = Math.pow(10, digits) - 1; // 999,999
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};
```
- **900,000 possible permutations** with a strict 15–60 minute expiration window.
- Clean typography and instant cognitive readability (`582 914`).
- Direct integration with HTML `autoComplete="one-time-code"`.

---

## 2. Security Principle: SHA-256 Token Hashing at Rest

A common security vulnerability in junior projects is storing plaintext OTPs in the database table (`token: "582914"`). If an attacker gets read access to a database backup or SQL injection, they can hijack every pending account and reset passwords.

### CampuScene's Zero-Cleartext Architecture:
1. Generate the raw 6-digit OTP in memory: `const rawOtp = createNumericOtp(6);`
2. Hash it with SHA-256 before database insertion:
   ```typescript
   export const hashToken = (token: string) => 
     crypto.createHash("sha256").update(token).digest("hex");
   ```
3. Save **only the hash** in PostgreSQL (`EmailVerificationToken` or `PasswordResetToken` table).
4. Send the **raw OTP** to the user via email.
5. On verification, hash the user's input: `hashToken(inputOtp.trim())` and perform a lookup.
6. The database never contains plaintext tokens.

---

## 3. The Gated Account State Machine

```
               [ User Submits Registration ]
                             │
                             ▼
                 Status: PENDING_VERIFICATION
                 (Account locked; Login denied)
                             │
             ┌───────────────┴───────────────┐
             │                               │
    [ Valid 6-digit OTP ]          [ Invalid / Expired ]
             │                               │
             ▼                               ▼
      Status: ACTIVE                 Account remains locked
   emailVerifiedAt: now()           (Resend OTP available)
             │
             ▼
     Login Permitted
```

---

## 4. The "Trapped User" Edge Case & Self-Healing Re-Registration

### The Problem
What happens if:
1. A student registers with `rahul@gmail.com`.
2. The email fails to arrive (or SMTP server was not yet configured).
3. The student closes the tab, tries to register again, and gets hit with:
   `409 Conflict: "An account with this email already exists."`
4. The student cannot log in (unverified), cannot register (already exists), and has no OTP. They are permanently locked out of the platform!

### The Self-Healing Solution in `auth.service.ts`:
```typescript
if (existingUser) {
  if (existingUser.status === UserStatus.PENDING_VERIFICATION) {
    // Self-healing re-registration: refresh credentials and issue fresh OTP
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    await this.userRepository.updatePassword(existingUser.id, passwordHash);
    
    const verificationToken = createNumericOtp(6);
    await this.tokenRepository.createEmailVerificationToken(
      existingUser.id, 
      hashToken(verificationToken), 
      addMinutes(new Date(), 60)
    );
    await this.emailService.sendVerificationEmail(existingUser.email, existingUser.name, verificationToken);
    
    return { user: toPublicUserDto(existingUser), verificationToken };
  }
  throw new AppError(409, ErrorCodes.CONFLICT, "An account with this email already exists.");
}
```

---

## 5. Graceful Production SMTP Fallback

In production environments without active SMTP configuration (`!env.SMTP_USER`), the API automatically responds with the generated OTP code in the response payload accompanied by a clear banner:
```json
{
  "success": true,
  "message": "Reset code generated. (SMTP is not configured on this server, code provided below).",
  "data": { "resetToken": "582914", "smtpConfigured": false }
}
```
This ensures developers, judges, and evaluators can verify functionality on live staging deployments before private credentials are wired into Render.

### Key Takeaway for Build-in-Public
> *"Great authentication isn't just about bcrypt and JWTs. It's about edge-case empathy: ensuring that an unconfigured mail server or an expired token never turns into a permanent user lockout."*
