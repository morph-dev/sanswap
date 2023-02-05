import { Box, ChakraProvider } from '@chakra-ui/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider
} from 'react-router-dom';
import TopBar from './components/topbar/TopBar';
import Bank from './pages/bank/Bank';
import Pool from './pages/pool/Pool';
import WagmiProvider from './providers/WagmiProvider';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="pool" element={<Pool />} />
      <Route path="bank" element={<Bank />} />
      <Route index element={<Navigate to="/pool" />} />
    </Route>
  )
);

function Layout() {
  return (
    <Box h="100vh">
      <TopBar />
      <Box bg="teal" h="full">
        <Outlet />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <WagmiProvider>
        <RouterProvider router={router} />
      </WagmiProvider>
    </ChakraProvider>
  );
}
