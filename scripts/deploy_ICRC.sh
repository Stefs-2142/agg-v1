#!/bin/bash
set -x

# dfx start --background --clean

# Create identities and canister arguments

DEFAULT_IDENTITY=ICSpore
MINTER_IDENTITY=ICSpore-minter

dfx identity use $MINTER_IDENTITY
MINTER_PRINCIPAL_ID=$(dfx identity get-principal)

dfx identity use $DEFAULT_IDENTITY
DEFAULT_PRINCIPAL_ID=$(dfx identity get-principal)

ICSP_TOKEN_NAME=ICSpore DEX Aggregator
ICSP_TOKEN_SYMBOL=SPR_AGG


PRE_MINTED_TOKENS=10_000_000_000
ICSP_TRANSFER_FEE=10_000

dfx identity new archive_controller
dfx identity use archive_controller
ARCHIVE_CONTROLLER=$(dfx identity get-principal)
TRIGGER_THRESHOLD=2000
NUM_OF_BLOCK_TO_ARCHIVE=1000
CYCLE_FOR_ARCHIVE_CREATION=10000000000000
FEATURE_FLAGS=true

dfx identity use $DEFAULT_IDENTITY

# Deploy ICSP ledger canister
dfx deploy icsp_agg --ic --argument "(variant {Init = 
record {
     token_symbol = \"${ICSP_TOKEN_SYMBOL}\";
     token_name = \"${ICSP_TOKEN_NAME}\";
     minting_account = record { owner = principal \"${MINTER_PRINCIPAL_ID}\" };
     transfer_fee = ${ICSP_TRANSFER_FEE};
     metadata = vec {};
     feature_flags = opt record{icrc2 = ${FEATURE_FLAGS}};
     initial_balances = vec { record { record { owner = principal \"${MINTER_PRINCIPAL_ID}\"; }; ${PRE_MINTED_TOKENS}; }; };
     archive_options = record {
         num_blocks_to_archive = ${NUM_OF_BLOCK_TO_ARCHIVE};
         trigger_threshold = ${TRIGGER_THRESHOLD};
         controller_id = principal \"${ARCHIVE_CONTROLLER}\";
         cycles_for_archive_creation = opt ${CYCLE_FOR_ARCHIVE_CREATION};
     };
 }
})"
