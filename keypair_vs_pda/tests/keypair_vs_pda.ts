import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { KeypairVsPda } from "../target/types/keypair_vs_pda";
import { airdropSOL, printBalance, sendSol } from "./utils";
import { expect } from "chai";

describe("keypair_vs_pda", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.KeypairVsPda as Program<KeypairVsPda>;
  const account1 = new Keypair();
  const account2 = new Keypair();
  const account3 = new Keypair();

  const wallet = provider.wallet as anchor.Wallet;

  const [padAccount] = PublicKey.findProgramAddressSync([], program.programId);

  it("airdrop", async () => {
    await airdropSOL(account1.publicKey, 10);
    await airdropSOL(account2.publicKey, 10);
    await printBalance(account1.publicKey);
    await printBalance(account2.publicKey);
  });

  it("initialize pda", async () => {
    console.log(
      `
      account1 的 Owner 为：`,
      (
        await anchor.getProvider().connection.getAccountInfo(account1.publicKey)
      ).owner.toString()
    );

    console.log(
      `
      padAccount 的 Owner 为：`,
      await anchor.getProvider().connection.getAccountInfo(padAccount)
    );
    await program.methods
      .initializePda("hello pad")
      .accounts({
        singer: account1.publicKey,
      })
      .signers([account1])
      .rpc();

    const res = await program.account.myAccountData.fetch(padAccount);
    console.log(`
        ${account1.publicKey} 初始化了 PDA，
        内容为： ${res.name}
      `);

    await sendSol(account1, account3, 1);
    await printBalance(account1.publicKey);
    await printBalance(account3.publicKey);

    console.log(
      `
      account1 的 Owner 为：`,
      (
        await anchor.getProvider().connection.getAccountInfo(account1.publicKey)
      ).owner.toString()
    );

    console.log(
      `
      padAccount 的 Owner 为：`,
      (
        await anchor.getProvider().connection.getAccountInfo(padAccount)
      ).owner.toString()
    );
  });

  it("initialize keypair", async () => {
    console.log(
      `
      account2 的 Owner 为：`,
      (
        await anchor.getProvider().connection.getAccountInfo(account2.publicKey)
      ).owner.toString()
    );
    await program.methods
      .initializeKeyPair("hello keypair")
      .accounts({
        keyPair: account2.publicKey,
        singer: wallet.publicKey,
      })
      .signers([account2])
      .rpc();

    const res = await program.account.myAccountData.fetch(account2.publicKey);
    console.log(`
        ${account2.publicKey} 初始化了 PDA，
        内容为： ${res.name}
      `);
    const accountInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(account2.publicKey);

    expect(accountInfo.owner.toString()).to.eq(program.programId.toString());

    try {
      await sendSol(account2, account3, 1);
      expect.fail("should fail");
    } catch (error) {
      console.error("sendSol 失败");
    }
    await printBalance(account2.publicKey);
    await printBalance(account3.publicKey);

    console.log(
      `
      account2 的 Owner 为：`,
      (
        await anchor.getProvider().connection.getAccountInfo(account2.publicKey)
      ).owner.toString()
    );
  });
});
