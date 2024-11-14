use anchor_lang::prelude::*;

mod error;
mod instructions;
mod state;

use instructions::prelude::*;

declare_id!("FCFvpJohnR3Ha8xUq1Hy9MRN6bwhydtXazvAAFrPugGG");

#[program]
pub mod crowd_found {
    use super::*;

    pub fn create(
        ctx: Context<CreateCrowdFound>,
        title: String,
        description: String,
    ) -> Result<()> {
        ctx.accounts.create_crowd_found(title, description)
    }

    pub fn update(ctx: Context<UpdateCrowdFound>, description: String) -> Result<()> {
        ctx.accounts.update_crowd_found(description)
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        ctx.accounts.donate(amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)
    }

    pub fn delete(_ctx: Context<DeleteCrowdFound>) -> Result<()> {
        Ok(())
    }
}
