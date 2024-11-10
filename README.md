# Aggregator

## The Problem

In the decentralized finance (DeFi) ecosystem on the Internet Computer, users often face challenges when trying to get the best rates for their token swaps:
- Multiple DEXs offer different rates for the same token pairs
- Manually checking each DEX is time-consuming and inefficient
- Price differences between DEXs create opportunities for better trades that users might miss
- Complex approval and swap processes across different DEX protocols

## Our Solution

The Aggregator introduces a unified solution that:
1. Acts as a single entry point for trading across multiple DEXs
2. Automatically finds and executes trades at the best available rates
3. Simplifies the trading process by handling all DEX interactions
4. Reduces costs by choosing the most efficient trading path

### Current Implementation

The current version leverages the Internet Computer's ecosystem features in a minimal but effective way:
- Integration with native IC DEXs (KongSwap, ICPSwap)
- Direct canister-to-canister communication for efficient price discovery
- Atomic execution of trades within the IC ecosystem
- Native token support for ICP ecosystem tokens

While the current implementation focuses on basic integration with IC ecosystem DEXs, it serves as a foundation for more advanced features to come.

### Future with ChainFusion

The full potential of the Aggregator will be unlocked with ChainFusion implementation, enabling:
- Cross-chain trading capabilities
- Integration with DEXs from multiple blockchain ecosystems
- Advanced routing algorithms for optimal trade paths
- Enhanced liquidity aggregation across chains
- Unified trading experience regardless of underlying blockchain

## Overview

The aggregator canister acts as a middleware that:
1. Queries multiple DEXs for token swap quotes
2. Compares rates to find the best deal
3. Executes trades through the chosen DEX
4. Handles all necessary token approvals and transfers

Currently integrated with KongSwap and ICPSwap, the aggregator compares rates and executes trades through the most advantageous path.

## Supported DEXs

Currently integrated with:
- KongSwap
- ICPSwap

## Canister Methods

### Getting Quotes

To fetch quotes from all supported DEXs:

```bash
dfx canister call agg-v1-backend getQuotes '(
    "ICP",  # Token to sell
    "ckBTC", # Token to buy
    1000000000, # Amount in e8s
    0.01 # Slippage tolerance
)'
```

### Finding Best Quote

To get the best available quote across all DEXs:

```bash
dfx canister call agg-v1-backend getBestQuote '(
    "ICP",
    "ckBTC",
    1000000000,
    0.01
)'
```

## Frontend Application

The frontend application provides a user-friendly interface for cross-chain swaps (Currnect Web-app only for show-case purporses) featuring:

- Token selection for both source and destination
- Real-time price quotes from multiple DEXs
- Best rate highlighting
- Slippage tolerance settings
- Wallet integration for seamless transactions

## Development

### Local Setup

1. Start the local replica:
```bash
dfx start --background --clear
```

2. Deploy the canisters:
```bash
dfx deploy
```

3. Start the frontend development server:
```bash
cd src/agg-v1-frontend && npm run dev
```

The application will be available at `http://localhost:5173/`

## Dfx sdk OR Intercanister call

### Step 1. Set Approve to DCA canister

This call make future transfer from your wallet possible without any additional actions


```bash
dfx canister call ryjl3-tyaaa-aaaaa-aaaba-cai  icrc2_approve '(record { amount = 40_000; spender = record{owner = principal "4fd3k-eqaaa-aaaao-qjvuq-cai";} })' --ic
```

CLI result
```
(variant { Ok = 12_141_598 : nat })
```

### Step 2. Executing Swaps

To execute a swap using the best available rate:

```bash
dfx canister call agg-v1-backend executeBestSwap '(
    "ICP",
    "ckBTC",
    1000000000,
    principal "your-principal-id",
    0.01
)'
