import { Inter } from 'next/font/google'
import './globals.css'
import App from '@components/App'
import { ReplicacheContextProvider } from '@lib/create-replicache-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

const RootLayout = ({ children } : { children: React.ReactNode }) => (
  <html lang="en">
    <body className={inter.className}>
      <ReplicacheContextProvider>
        <App>
          {children}
        </App>
      </ReplicacheContextProvider>
    </body>
  </html>
)

export default RootLayout
