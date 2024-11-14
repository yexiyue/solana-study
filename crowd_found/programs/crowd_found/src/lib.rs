use anchor_lang::prelude::*;

declare_id!("FCFvpJohnR3Ha8xUq1Hy9MRN6bwhydtXazvAAFrPugGG");

#[program]
pub mod crowd_found {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
