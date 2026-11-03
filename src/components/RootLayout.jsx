import { Outlet, ScrollRestoration } from 'react-router'
import Header from './Header'
import Footer from './Footer'

export default function RootLayout() {
  return (
    <div className="flex min-h-full flex-col bg-mist">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
