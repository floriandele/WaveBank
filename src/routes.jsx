import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout'
import DashboardPage from './pages/DashboardPage'
import AccountsPage from './pages/AccountsPage'
import AccountDetailPage from './pages/AccountDetailPage'
import InvoicesPage from './pages/InvoicesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'comptes', Component: AccountsPage },
      { path: 'comptes/:id', Component: AccountDetailPage },
      { path: 'factures', Component: InvoicesPage },
    ],
  },
])
