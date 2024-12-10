import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { NFIDProviderWrapper } from './contexts/NFIDContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NFIDProviderWrapper>
        <WalletProvider>
          <App />
        </WalletProvider>
      </NFIDProviderWrapper>
    </ThemeProvider>
  </StrictMode>
);