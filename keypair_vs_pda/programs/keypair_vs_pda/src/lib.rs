use anchor_lang::prelude::*;

declare_id!("2FRrUXHWvWZFzHCrgTjT5wiG3gRQEC8kP5u56DPvfPQe");

#[program]
pub mod keypair_vs_pda {
    use super::*;

    pub fn initialize_pda(ctx: Context<InitializePda>, name: String) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        ctx.accounts.pda.name = name;
        Ok(())
    }

    pub fn initialize_key_pair(ctx: Context<InitializeKeyPair>, name: String) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        ctx.accounts.key_pair.name = name;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePda<'info> {
    #[account(init,payer=singer,space=8+MyAccountData::INIT_SPACE,seeds=[],bump)]
    pub pda: Account<'info, MyAccountData>,

    #[account(mut)]
    pub singer: Signer<'info>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeKeyPair<'info> {
    // 使用key_pair初始化账户，不需要指点定seeds，和bump
    #[account(init,payer=singer,space=8+MyAccountData::INIT_SPACE)]
    pub key_pair: Account<'info, MyAccountData>,

    #[account(mut)]
    pub singer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct MyAccountData {
    #[max_len(50)]
    pub name: String,
}
