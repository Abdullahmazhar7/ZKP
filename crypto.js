// crypto.js — Lightweight cryptographic utilities for ZKP demos

/**
 * Modular exponentiation: (base^exp) mod mod
 * Uses fast exponentiation (square and multiply)
 */
function modPow(base, exp, mod) {
    if (mod === 1) return 0;
    let result = 1;
    base = ((base % mod) + mod) % mod;
    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }
    return result;
}

/**
 * SHA-256 hash using Web Crypto API
 * Returns hex string
 */
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random integer in [min, max] inclusive
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Modular arithmetic: (a mod n), always positive
 */
function mod(a, n) {
    return ((a % n) + n) % n;
}
