import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    // children: [
    //   {
    //     element: <Team />,
    //     path: ":teamId",
    //     loader: async ({ params }) => {
    //       return fetch(`/api/teams/${params.teamId}.json`);
    //     },
    //   },
    // ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
