import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 Unit = X USD
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.09 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rateToUSD: 0.272 },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rateToUSD: 0.267 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 0.74 },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateToUSD: 0.66 },
};

interface CurrencyContextType {
  currentCurrency: CurrencyConfig;
  setCurrency: (code: string) => void;
  formatUSD: (amountUSD: number) => string;
  formatOriginal: (amount: number, currencyCode: string) => string;
  convertUSDToCurrency: (amountUSD: number, targetCurrencyCode?: string) => number;
  convertCurrencyToUSD: (amount: number, fromCurrencyCode: string) => number;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return localStorage.getItem('asfjk_currency') || 'USD';
  });

  const currentCurrency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;

  useEffect(() => {
    localStorage.setItem('asfjk_currency', currentCurrency.code);
  }, [currentCurrency]);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCode(code);
    }
  };

  const convertUSDToCurrency = (amountUSD: number, targetCode?: string): number => {
    const config = SUPPORTED_CURRENCIES[targetCode || currentCurrency.code] || currentCurrency;
    const value = amountUSD / config.rateToUSD;
    return Math.round(value);
  };

  const convertCurrencyToUSD = (amount: number, fromCode: string): number => {
    const config = SUPPORTED_CURRENCIES[fromCode] || SUPPORTED_CURRENCIES.USD;
    return parseFloat((amount * config.rateToUSD).toFixed(2));
  };

  const formatUSD = (amountUSD: number): string => {
    const converted = convertUSDToCurrency(amountUSD, currentCurrency.code);
    return `${currentCurrency.symbol}${converted.toLocaleString()}`;
  };

  const formatOriginal = (amount: number, code: string): string => {
    const config = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.USD;
    return `${config.symbol}${amount.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        formatUSD,
        formatOriginal,
        convertUSDToCurrency,
        convertCurrencyToUSD,
        availableCurrencies: Object.values(SUPPORTED_CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
