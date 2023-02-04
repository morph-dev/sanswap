import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WagmiProvider from './WagmiProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <WagmiProvider>
        <App />
      </WagmiProvider>
    </ChakraProvider>
  </React.StrictMode>
);
