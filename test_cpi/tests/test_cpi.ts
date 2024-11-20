import * as anchor from "@coral-xyz/anchor";
import { getProvider, Program } from "@coral-xyz/anchor";
import { CrowdFound } from "../../crowd_found/target/types/crowd_found";
import crowd_found_idl from "../../crowd_found/target/idl/crowd_found.json";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { airdropSOL, printBalance } from "./utils";
import { expect } from "chai";
import { TestCpi } from "../target/types/test_cpi";

describe("crowd_found", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = new anchor.Program(
    crowd_found_idl as any
  ) as anchor.Program<CrowdFound>;
  const testCpiProgram = anchor.workspace.TestCpi as Program<TestCpi>;
  const account1 = new Keypair();
  const account2 = new Keypair();
  const account3 = new Keypair();

  const [account1CrowdFoundPda] = PublicKey.findProgramAddressSync(
    [account1.publicKey.toBuffer(), Buffer.from("crowdFound")],
    program.programId
  );

  it("airdrop", async () => {
    await airdropSOL(account1.publicKey, 10);
    await airdropSOL(account2.publicKey, 10);
    await airdropSOL(account3.publicKey, 10);

    await printBalance(account1.publicKey);
    await printBalance(account2.publicKey);
    await printBalance(account3.publicKey);
  });

  it("Create", async () => {
    // Add your test here.
    await program.methods
      .create("crowdFound", "测试众筹")
      .accounts({
        singer: account1.publicKey,
      })
      .signers([account1])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account1.publicKey} 创建了众筹项目，
        标题为： ${res.title}
        描述为：${res.description}
      `);

    expect(res.authority.toBase58()).eq(account1.publicKey.toBase58());
    expect(res.balance.toNumber()).eq(0);
  });

  it("update", async () => {
    await program.methods
      .update("new description")
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        authority: account1.publicKey,
      })
      .signers([account1])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account1.publicKey} 更新了众筹项目，
        新的描述是：${res.description}
    `);

    expect(res.description).eq("new description");

    try {
      await program.methods
        .update("new description")
        .accountsPartial({
          crowdFound: account1CrowdFoundPda,
          authority: account2.publicKey,
        })
        .signers([account2])
        .rpc();
      expect.fail("should fail");
    } catch (error) {
      expect(error.message).to.contain("Invalid authority");
    }
  });

  it("account2 donate", async () => {
    await program.methods
      .donate(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        singer: account2.publicKey,
      })
      .signers([account2])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account2.publicKey} 捐赠了 1 SOL 给 ${account1.publicKey} 的众筹项目，
        目前的余额是：${res.balance.toNumber() / LAMPORTS_PER_SOL} SOL
    `);

    expect(res.balance.toNumber()).eq(1 * LAMPORTS_PER_SOL);
  });

  it("account3 donate", async () => {
    await program.methods
      .donate(new anchor.BN(5 * LAMPORTS_PER_SOL))
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        singer: account3.publicKey,
      })
      .signers([account3])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account3.publicKey} 捐赠了 5 SOL 给 ${account1.publicKey} 的众筹项目，
        目前的余额是：${res.balance.toNumber() / LAMPORTS_PER_SOL} SOL
    `);

    expect(res.balance.toNumber()).eq(6 * LAMPORTS_PER_SOL);
  });

  it("account1 donate", async () => {
    try {
      await program.methods
        .donate(new anchor.BN(5 * LAMPORTS_PER_SOL))
        .accountsPartial({
          crowdFound: account1CrowdFoundPda,
          singer: account1.publicKey,
        })
        .signers([account1])
        .rpc();
      expect.fail("should fail");
    } catch (error) {
      expect(error.message).to.contain("Can not donate");
    }
  });

  it("account1 withdraw", async () => {
    await testCpiProgram.methods
      .callCrowdFoundWithdraw(new anchor.BN(5 * LAMPORTS_PER_SOL))
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        authority: account1.publicKey,
      })
      .signers([account1])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account1.publicKey} 从众筹项目${account1CrowdFoundPda} 提取了 5 SOL，
        目前的余额是：${res.balance.toNumber() / LAMPORTS_PER_SOL} SOL
    `);
    await printBalance(account1.publicKey);

    expect(res.balance.toNumber()).eq(1 * LAMPORTS_PER_SOL);
  });

  it("account1 withdraw two", async () => {
    await testCpiProgram.methods
      .callCrowdFoundWithdraw(new anchor.BN(5 * LAMPORTS_PER_SOL))
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        authority: account1.publicKey,
      })
      .signers([account1])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account1.publicKey} 从众筹项目${account1CrowdFoundPda} 提取了 5 SOL，
        目前的余额是：${res.balance.toNumber() / LAMPORTS_PER_SOL} SOL
    `);
    await printBalance(account1.publicKey);

    expect(res.balance.toNumber()).eq(1 * LAMPORTS_PER_SOL);
  });

  it("account2 withdraw", async () => {
    await testCpiProgram.methods
      .callCrowdFoundWithdraw(new anchor.BN(5 * LAMPORTS_PER_SOL))
      .accountsPartial({
        crowdFound: account1CrowdFoundPda,
        authority: account2.publicKey,
      })
      .signers([account2])
      .rpc();

    const res = await program.account.crowdFound.fetch(account1CrowdFoundPda);
    console.log(`
        ${account2.publicKey} 从众筹项目${account1CrowdFoundPda} 提取了 5 SOL，
        目前的余额是：${res.balance.toNumber() / LAMPORTS_PER_SOL} SOL
    `);
    await printBalance(account2.publicKey);

    expect(res.balance.toNumber()).eq(1 * LAMPORTS_PER_SOL);
  });

  it("account1 delete", async () => {
    await program.methods
      .delete()
      .accountsPartial({
        authority: account1.publicKey,
        crowdFound: account1CrowdFoundPda,
      })
      .signers([account1])
      .rpc();
    await printBalance(account1.publicKey);
    const balance = await getProvider().connection.getBalance(
      account1.publicKey
    );
    // 删除后，账户租金和众筹的资金都会转到账户中
    expect(balance).eq(16 * LAMPORTS_PER_SOL);
  });
});
