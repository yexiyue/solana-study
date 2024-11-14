use anchor_lang::prelude::*;

use crate::{error::CrowdFoundError, state::CrowdFound};

#[derive(Accounts)]
pub struct DeleteCrowdFound<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close=authority,
        has_one=authority@CrowdFoundError::InvalidAuthority,
    )]
    pub crowd_found: Account<'info, CrowdFound>,
}


