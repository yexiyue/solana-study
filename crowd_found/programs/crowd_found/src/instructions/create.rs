use std::borrow::BorrowMut;

use anchor_lang::prelude::*;

use crate::state::CrowdFound;

#[derive(Accounts)]
#[instruction(title:String)]
pub struct CreateCrowdFound<'info> {
    #[account(mut)]
    pub singer: Signer<'info>,

    pub system_program: Program<'info, System>,

    #[account(init,payer=singer,space=CrowdFound::INIT_SPACE+8,seeds=[singer.key().as_ref(),title.as_bytes()],bump)]
    pub crowd_found: Account<'info, CrowdFound>,
}

impl<'info> CreateCrowdFound<'info> {
    pub fn create_crowd_found(&mut self, title: String, description: String) -> Result<()> {
        let crowd_found = self.crowd_found.borrow_mut();
        crowd_found.title = title;
        crowd_found.description = description;
        crowd_found.authority = self.singer.key();
        Ok(())
    }
}
