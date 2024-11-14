use anchor_lang::prelude::*;

use crate::{error::CrowdFoundError, state::CrowdFound};

#[derive(Accounts)]
pub struct UpdateCrowdFound<'info> {
    pub authority: Signer<'info>,

    #[account(mut,has_one=authority@CrowdFoundError::InvalidAuthority)]
    pub crowd_found: Account<'info, CrowdFound>,
}

impl<'info> UpdateCrowdFound<'info> {
    pub fn update_crowd_found(&mut self, description: String) -> Result<()> {
        self.crowd_found.description = description;
        Ok(())
    }
}
