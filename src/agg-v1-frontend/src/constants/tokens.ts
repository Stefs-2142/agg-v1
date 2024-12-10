export const TOKENS = {
  ICP: {
    symbol: 'ICP',
    logo: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png',
    decimals: 8
  },
  ckBTC: {
    symbol: 'ckBTC',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwveUtVZjZueURlbXNBMW1BeFlhTkcucG5nIn0:dfinity:PrgFDN3hVntenLfLCcp-Ih8nkMYUw3D3oOa8DRYPc0k?width=2400',
    decimals: 8
  },
  ckUSDT: {
    symbol: 'ckUSDT',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvRmRtRUdudUE0ZVNnYUh3ZFBGazcucG5nIn0:dfinity:OjxfOixU4LxtiNDK60EuejiKyMt6jGF7CIzqWNbhfCQ?width=2400',
    decimals: 6
  },
  ckUSDC: {
    symbol: 'ckUSDC',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvTExyZzR0Ynd3N1h0UWpWZVZrd1AucG5nIn0:dfinity:98XVYNxw1g4W2eNHHEh6BlmbWJVxxr0sQhi0WRe-nJA?width=2400',
    decimals: 6
  },
  ckETH: {
    symbol: 'ckETH',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvajhLVmRTNWlLS01aWXE2Z3JDSGUucG5nIn0:dfinity:kTWhzshTsVqv4nmX-0Fk9uXzAlpwaCPNfPUVHDEGo-8?width=2400',
    decimals: 18
  },
  CHAT: {
    symbol: 'CHAT',
    logo: 'https://dgegb-daaaa-aaaar-arlhq-cai.raw.icp0.io/avatar/319398709384407980892342373791723159552',
    decimals: 8
  }
} as const;

export const ALL_TOKENS = Object.values(TOKENS);

// Функции для конвертации
export const toDecimalAmount = (amount: string, decimals: number): bigint => {
  // Убираем все пробелы и заменяем запятую на точку
  const cleanAmount = amount.replace(/\s+/g, '').replace(',', '.');
  
  // Разбиваем на целую и дробную части
  const [whole, fraction = ''] = cleanAmount.split('.');
  
  // Дополняем дробную часть нулями справа до нужной длины
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  
  // Собираем число и конвертируем в BigInt
  return BigInt(whole + paddedFraction);
};

export const fromDecimalAmount = (amount: bigint, decimals: number): string => {
  const amountStr = amount.toString().padStart(decimals + 1, '0');
  const whole = amountStr.slice(0, -decimals) || '0';
  const fraction = amountStr.slice(-decimals).replace(/0+$/, '');
  
  return fraction ? `${whole}.${fraction}` : whole;
};