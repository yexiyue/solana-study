use anchor_lang::prelude::*;

use crate::{error::CrowdFoundError, state::CrowdFound};

#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one=authority@CrowdFoundError::InvalidAuthority,
        constraint=crowd_found.balance>=amount @ CrowdFoundError::NotEnoughBalance
    )]
    pub crowd_found: Account<'info, CrowdFound>,
}

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        self.crowd_found.sub_lamports(amount)?;
        self.authority.add_lamports(amount)?;
        self.crowd_found.balance -= amount;
        Ok(())
    }
}
