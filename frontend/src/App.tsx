import { Box, ChakraProvider } from '@chakra-ui/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import TopBar from './components/topbar/TopBar';
import Bank from './pages/bank/Bank';
import PoolPage from './pages/exchange/pool/PoolPage';
import PoolList from './pages/exchange/poolList/PoolList';
import { ExchangeProvider } from './providers/ExchangeContext';
import { TokenProvider } from './providers/TokenContext';
import WagmiProvider from './providers/WagmiProvider';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="exchange">
        <Route path=":poolId" loader={() => null} element={<PoolPage />} />
        <Route index element={<PoolList />} />
      </Route>
      <Route path="bank" element={<Bank />} />
      <Route index element={<Navigate to="/exchange" />} />
    </Route>
  )
);

function Layout() {
  return (
    <Box h="100vh">
      <TopBar />
      <Box h="full">
        <Outlet />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <WagmiProvider>
        <TokenProvider>
          <ExchangeProvider>
            <RouterProvider router={router} />
          </ExchangeProvider>
        </TokenProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}
