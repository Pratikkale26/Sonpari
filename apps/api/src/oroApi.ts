import axios from 'axios';
import { createHash } from 'crypto';
import { PublicKey, Transaction, VersionedTransaction, Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

const ORO_BASE_URL = process.env.ORO_API_URL || 'https://oro-tradebook-devnet.up.railway.app/api';
const ORO_API_KEY = process.env.ORO_API_KEY!;

const oroClient = axios.create({
  baseURL: ORO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ORO_API_KEY,
  },
});



// Generates a Base58-encoded SHA-256 KYC hash from user data.
export function generateKycHash(kycData: Record<string, string>): string {
  const serialized = JSON.stringify(kycData, Object.keys(kycData).sort());
  const hash = createHash('sha256').update(serialized).digest();
  return new PublicKey(hash).toBase58();
}


function getExecutionKeypair(): Keypair {
  const privateKeyBase58 = process.env.ORO_EXECUTION_PRIVATE_KEY;
  if (!privateKeyBase58) throw new Error('ORO_EXECUTION_PRIVATE_KEY is not set');

  try {
    const secretKey = bs58.decode(privateKeyBase58.trim());
    return Keypair.fromSecretKey(secretKey);
  } catch (error: any) {
    console.error("Failed to decode ORO_EXECUTION_PRIVATE_KEY:", error.message);
    throw new Error("Invalid ORO_EXECUTION_PRIVATE_KEY. Ensure it is a valid base58 string without quotes or spaces.");
  }
}

/**
 * Deserializes a base64 transaction, signs it with our execution keypair, and re-serializes to base64.
 * Handles both legacy Transaction and modern VersionedTransaction (V0).
 */
export function signSerializedTransaction(serializedTxBase64: string): string {
  const keypair = getExecutionKeypair();
  const txBytes = Buffer.from(serializedTxBase64, 'base64');

  try {
    // Attempt to deserialize as a Versioned Transaction (V0), which is the new standard
    const tx = VersionedTransaction.deserialize(new Uint8Array(txBytes));
    tx.sign([keypair]);
    return Buffer.from(tx.serialize()).toString('base64');
  } catch (err) {
    // Fallback to legacy transaction if Versioned deserialization fails
    const tx = Transaction.from(txBytes);
    tx.partialSign(keypair);
    return tx.serialize({ requireAllSignatures: false }).toString('base64');
  }
}



// Creates a new Oro user PDA.
export async function createOroUser(kycHash: string) {
  const { data } = await oroClient.post('/users', { kycHash });
  return data.data as {
    userId: string;
    userPda: string;
    kycHash: string;
    transaction: { serializedTx: string };
  };
}


// Creates a gold purchase transaction for a user
export async function purchaseGoldForUser(userId: string, goldGrams: number, maxUsdcAmount?: number) {
  const { data } = await oroClient.post('/trading/purchases/user', {
    userId,
    goldAmount: goldGrams,
    maxUsdcAmount: maxUsdcAmount || goldGrams * 7000, // fallback generous max
    co_sign: false,
    userAsFeePayer: false,
  });
  return data.data as {
    purchaseId: string;
    goldAmount: number;
    quoteUsdcAmount: number;
    quotedGoldPrice: number;
    status: string;
    transaction: { serializedTx: string };
  };
}


// Creates a gold sell transaction for a user
export async function sellGoldForUser(userId: string, goldGrams: number, minUsdcAmount?: number) {
  const { data } = await oroClient.post('/trading/sales/user', {
    userId,
    goldAmount: goldGrams,
    minUsdcAmount: minUsdcAmount || 0,
    co_sign: false,
    userAsFeePayer: false,
  });
  return data.data as {
    saleId: string;
    goldAmount: number;
    quoteUsdcAmount: number;
    quotedGoldPrice: number;
    status: string;
    transaction: { serializedTx: string };
  };
}


// Submits a single signed transaction to Solana via Oro.
export async function submitTransaction(signedTxBase64: string) {
  const { data } = await oroClient.post('/transactions/submit', {
    signedTransaction: signedTxBase64,
  });
  return data.data as { txId: string; status: string; balanceChanges?: Record<string, number> };
}

// Submits multiple signed transactions in batch.
export async function submitAllTransactions(signedTxsBase64: string[]) {
  const { data } = await oroClient.post('/transactions/submit/all', {
    transactions: signedTxsBase64,
  });
  return data.data as Array<{ txId: string; status: string; error?: string }>;
}

// Sign a serialized transaction with our execution key and submit it.
export async function signAndSubmit(serializedTxBase64: string) {
  const signed = signSerializedTransaction(serializedTxBase64);
  return submitTransaction(signed);
}