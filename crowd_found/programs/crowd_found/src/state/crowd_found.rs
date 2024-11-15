use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CrowdFound {
    #[max_len(50)]
    pub title: String,
    #[max_len(100)]
    pub description: String,
    pub authority: Pubkey,
    pub balance: u64,
}
