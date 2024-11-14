use anchor_lang::prelude::*;

#[error_code]
pub enum CrowdFoundError {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Not enough balance")]
    NotEnoughBalance,
    #[msg("Can not donate")]
    CanNotDonate,
}
