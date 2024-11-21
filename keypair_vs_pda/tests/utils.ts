import { getProvider } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function printBalance(account: PublicKey) {
  const balance = await getProvider().connection.getBalance(account);
  console.log(`${account} has ${balance / LAMPORTS_PER_SOL} SOL`);
}

export async function airdropSOL(account: PublicKey, amount: number) {
  const connection = getProvider().connection;

  const tx = await connection.requestAirdrop(
    account,
    amount * LAMPORTS_PER_SOL
  );

  const lastBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: lastBlockHash.blockhash,
    lastValidBlockHeight: lastBlockHash.lastValidBlockHeight,
    signature: tx,
  });
}

export async function sendSol(from: Keypair, to: Keypair, amount: number) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  await getProvider().sendAndConfirm(tx, [from]);
  console.log(`Sent ${amount} SOL from ${from.publicKey} to ${to.publicKey}`);
}
