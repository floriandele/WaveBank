import { createBrowserRouter } from 'react-router'
import RootLayout from './components/RootLayout'
import DashboardPage from './pages/DashboardPage'
import AccountsPage from './pages/AccountsPage'
import AccountDetailPage from './pages/AccountDetailPage'
import InvoicesPage from './pages/InvoicesPage'
import LoansPage from './pages/LoansPage'
import LoanSimulatorPage from './pages/LoanSimulatorPage'
import LoanDetailPage from './pages/LoanDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'comptes', Component: AccountsPage },
      { path: 'comptes/:id', Component: AccountDetailPage },
      { path: 'factures', Component: InvoicesPage },
      { path: 'prets', Component: LoansPage },
      { path: 'prets/simuler', Component: LoanSimulatorPage },
      { path: 'prets/:id', Component: LoanDetailPage },
    ],
  },
])
