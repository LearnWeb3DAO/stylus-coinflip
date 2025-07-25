#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;

use openzeppelin_stylus::access::ownable::{self, IOwnable, Ownable};
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    prelude::*,
};

// Custom errors for the contract
sol! {
    // Thrown when a player's bet is less than the minimum bet
    error MinBetNotMet(uint256 min_bet, uint256 player_bet);
    // Thrown when a randomness request fails
    error RandomnessRequestFailed();
    // Thrown when a randomness fulfillment is received for a game that does not exist
    error GameNotFound();
    // Thrown when a fulfillment is received from a non-Supra router
    error OnlySupraRouter();
    // Thrown when a game is resolved twice
    error GameAlreadyResolved();
    // Thrown when a transfer fails
    error TransferFailed();
    // Thrown when the contract does not have enough balance to withdraw
    error InsufficientBalance(uint256 balance, uint256 amount);
}

sol! {
    event GameCreated(uint256 indexed nonce, address indexed player, uint256 bet);
    event GameResolved(uint256 indexed nonce, address indexed player, uint256 bet, bool won);
    event Withdrawal(address indexed to, uint256 amount);
}

#[derive(SolidityError)]
pub enum Error {
    GameNotFound(GameNotFound),
    MinBetNotMet(MinBetNotMet),
    RandomnessRequestFailed(RandomnessRequestFailed),
    UnauthorizedAccount(ownable::OwnableUnauthorizedAccount),
    InvalidOwner(ownable::OwnableInvalidOwner),
    OnlySupraRouter(OnlySupraRouter),
    GameAlreadyResolved(GameAlreadyResolved),
    TransferFailed(TransferFailed),
    InsufficientBalance(InsufficientBalance),
}

impl From<ownable::Error> for Error {
    fn from(value: ownable::Error) -> Self {
        match value {
            ownable::Error::UnauthorizedAccount(e) => Error::UnauthorizedAccount(e),
            ownable::Error::InvalidOwner(e) => Error::InvalidOwner(e),
        }
    }
}

sol_interface! {
    interface ISupraRouterContract {
        function generateRequest(string memory function_sig, uint8 rng_count, uint256 num_confirmations, address client_wallet_address) external returns(uint256);
    }
}

sol_storage! {
    #[entrypoint]
    pub struct Coinflip {
        #[borrow]
        Ownable ownable;

        address subscription_manager;
        address supra_router;
        uint256 min_bet;

        mapping(uint256 => Game) games;
    }

    pub struct Game {
        uint256 bet;
        address player;
        uint256 randomness;
        bool resolved;
        bool won;
    }
}

impl Coinflip {
    fn request_randomness(&mut self) -> Result<U256, Error> {
        let subscription_manager = self.subscription_manager.get();
        let router = ISupraRouterContract::from(self.supra_router.get());
        let request_result = router.generate_request(
            &mut *self,
            String::from("fulfillRandomness(uint256,uint256[])"),
            1,
            U256::from(1),
            subscription_manager,
        );

        match request_result {
            Ok(nonce) => Ok(nonce),
            Err(_) => Err(Error::RandomnessRequestFailed(RandomnessRequestFailed {})),
        }
    }
}

/// Declare that `Counter` is a contract with the following external methods.
#[public]
#[implements(IOwnable<Error = Error>)]
impl Coinflip {
    #[constructor]
    pub fn constructor(
        &mut self,
        subscription_manager: Address,
        supra_router: Address,
        min_bet: U256,
    ) -> Result<(), Error> {
        // Use tx_origin() here instead of msg_sender() because Stylus contracts are deployed via a CREATE2 Deployer Factory
        // This means that msg_sender() will be the address of the deployer factory, not the actual EOA deployer
        let initial_owner = self.vm().tx_origin();

        self.subscription_manager.set(subscription_manager);
        self.supra_router.set(supra_router);
        self.min_bet.set(min_bet);

        Ok(self.ownable.constructor(initial_owner)?)
    }

    #[payable]
    pub fn new_game(&mut self) -> Result<(), Error> {
        let bet = self.vm().msg_value();
        let player = self.vm().msg_sender();

        if bet < self.min_bet.get() {
            return Err(Error::MinBetNotMet(MinBetNotMet {
                min_bet: self.min_bet.get(),
                player_bet: bet,
            }));
        }

        let nonce = self.request_randomness()?;
        let mut game_setter = self.games.setter(nonce);
        game_setter.bet.set(bet);
        game_setter.player.set(player);
        game_setter.resolved.set(false);
        game_setter.won.set(false);
        game_setter.randomness.set(U256::ZERO);

        log(self.vm(), GameCreated { nonce, player, bet });

        Ok(())
    }

    #[selector(name = "fulfillRandomness")]
    pub fn fulfill_randomness(&mut self, nonce: U256, rng_list: Vec<U256>) -> Result<(), Error> {
        let sender = self.vm().msg_sender();
        if sender != self.supra_router.get() {
            return Err(Error::OnlySupraRouter(OnlySupraRouter {}));
        }

        let game = self.games.get(nonce);
        let player = game.player.get();
        let bet = game.bet.get();
        if player.is_zero() {
            return Err(Error::GameNotFound(GameNotFound {}));
        }
        if game.resolved.get() {
            return Err(Error::GameAlreadyResolved(GameAlreadyResolved {}));
        }

        let randomness = rng_list[0];
        let player_won = randomness % U256::from(2) == U256::ZERO;

        let mut game_setter = self.games.setter(nonce);
        game_setter.randomness.set(randomness);
        game_setter.resolved.set(true);
        game_setter.won.set(player_won);

        if player_won {
            // Send the user 1.9x the bet
            let winnings = bet * U256::from(19) / U256::from(10);
            let transfer_result = self.vm().transfer_eth(player, winnings);
            if transfer_result.is_err() {
                return Err(Error::TransferFailed(TransferFailed {}));
            }
        }

        log(
            self.vm(),
            GameResolved {
                nonce,
                player,
                bet,
                won: player_won,
            },
        );

        Ok(())
    }

    pub fn withdraw(&mut self, amount: U256) -> Result<(), Error> {
        self.ownable.only_owner()?;

        let balance = self.vm().balance(self.vm().contract_address());
        if balance < amount {
            return Err(Error::InsufficientBalance(InsufficientBalance {
                balance,
                amount,
            }));
        }

        let transfer_result = self.vm().transfer_eth(self.vm().msg_sender(), amount);
        if transfer_result.is_err() {
            return Err(Error::TransferFailed(TransferFailed {}));
        }

        log(
            self.vm(),
            Withdrawal {
                to: self.vm().msg_sender(),
                amount,
            },
        );

        Ok(())
    }

    #[receive]
    #[payable]
    pub fn receive(&mut self) -> Result<(), Vec<u8>> {
        Ok(())
    }
}

#[public]
impl IOwnable for Coinflip {
    type Error = Error;

    fn owner(&self) -> Address {
        self.ownable.owner()
    }

    fn transfer_ownership(&mut self, new_owner: Address) -> Result<(), Self::Error> {
        Ok(self.ownable.transfer_ownership(new_owner)?)
    }

    fn renounce_ownership(&mut self) -> Result<(), Self::Error> {
        Ok(self.ownable.renounce_ownership()?)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_counter() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut _contract = Coinflip::from(&vm);
    }
}
