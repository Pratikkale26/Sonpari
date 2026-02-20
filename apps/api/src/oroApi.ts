const ORO_API_URL = process.env.ORO_API_URL || 'https://oro-tradebook-devnet.up.railway.app/api';
const ORO_API_KEY = process.env.ORO_API_KEY || '';
import { createHash } from 'crypto';
import { PublicKey } from '@solana/web3.js';

function getKycHashBase58(kycData: Record<string, any>): string {
  // Sort keys for deterministic output regardless of object key order
  const serialized = JSON.stringify(kycData, Object.keys(kycData).sort());
  const hash = createHash('sha256').update(serialized).digest();

// can store hash if you want before returning public key
  return new PublicKey(hash).toBase58();
}

// Usage
const kycHash = getKycHashBase58({
  name: "Peter Doe",
  passport: "AB123456",
  dob: "1990-01-01"
});
console.log(
  `kycHash: ${kycHash}`
)

// Same object with different key order → same hash
const sameHash = getKycHashBase58({
  passport: "AB123456",
  name: "Peter Doe",
  dob: "1990-01-01"
});
console.log(
  `sameHash: ${sameHash}`
)
// kycHash === sameHash ✓