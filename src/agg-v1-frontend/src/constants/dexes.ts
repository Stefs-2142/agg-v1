export const CROSS_CHAIN_DEXES = {
  uniswap: {
    name: 'Uniswap',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    chain: 'EVM'
  },
  jupiter: {
    name: 'Jupiter',
    logo: 'https://jup.ag/favicon-32x32.png',
    chain: 'Solana'
  },
  osmosis: {
    name: 'Osmosis',
    logo: 'https://cryptologos.cc/logos/osmosis-osmo-logo.png',
    chain: 'Cosmos'
  }
} as const;