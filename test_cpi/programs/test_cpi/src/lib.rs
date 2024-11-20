use anchor_lang::prelude::*;

use crowd_found::program::CrowdFound;

declare_id!("DkiYzwzUoLJ8bPjA525CntLsZCyv6Xz3hqHTVaLCJX81");

#[program]
pub mod test_cpi {
    use super::*;
    pub fn call_crowd_found_withdraw(ctx: Context<CrowdFoundWithdraw>, amount: u64) -> Result<()> {
        crowd_found::cpi::withdraw(ctx.accounts.withdraw_ctx(), amount)
    }
}

#[derive(Accounts)]
pub struct CrowdFoundWithdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub crowd_found: Account<'info, crowd_found::state::CrowdFound>,

    pub crowd_found_program: Program<'info, CrowdFound>,
}

impl<'info> CrowdFoundWithdraw<'info> {
    pub fn withdraw_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, crowd_found::cpi::accounts::Withdraw<'info>> {
        CpiContext::new(
            self.crowd_found_program.to_account_info(),
            crowd_found::cpi::accounts::Withdraw {
                authority: self.authority.to_account_info(),
                crowd_found: self.crowd_found.to_account_info(),
            },
        )
    }
}
