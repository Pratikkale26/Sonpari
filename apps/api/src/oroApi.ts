import axios from 'axios';
import { createHash } from 'crypto';
import { PublicKey, Transaction, Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

const ORO_BASE_URL = process.env.ORO_API_URL || 'https://oro-tradebook-devnet.up.railway.app/api';
const ORO_API_KEY = process.env.ORO_API_KEY || '';

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
  const secretKey = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Deserializes a base64 transaction, signs it with our execution keypair, and re-serializes to base64.
 */
export function signSerializedTransaction(serializedTxBase64: string): string {
  const keypair = getExecutionKeypair();
  const txBytes = Buffer.from(serializedTxBase64, 'base64');
  const tx = Transaction.from(txBytes);
  tx.partialSign(keypair);
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}



// Creates a new Oro user PDA.
export async function createOroUser(kycHash: string) {
  const { data } = await oroClient.post('/users', { kycHash });
  return data.data as {
    userId: string;
    userPda: string;
    kycHash: string;
    transaction: string; // base64 serializedTx
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