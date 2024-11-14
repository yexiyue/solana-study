use anchor_lang::{prelude::*, system_program};

use crate::{error::CrowdFoundError, state::CrowdFound};

#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct Donate<'info> {
    #[account(
        mut,
        constraint=singer.lamports()>=amount @ CrowdFoundError::NotEnoughBalance,
        constraint=crowd_found.authority!=singer.key() @CrowdFoundError::CanNotDonate
    )]
    pub singer: Signer<'info>,

    #[account(mut)]
    pub crowd_found: Account<'info, CrowdFound>,

    pub system_program: Program<'info, System>,
}

impl<'info> Donate<'info> {
    pub fn donate(&mut self, amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(),
            system_program::Transfer {
                from: self.singer.to_account_info(),
                to: self.crowd_found.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;
        self.crowd_found.balance += amount;

        Ok(())
    }
}
