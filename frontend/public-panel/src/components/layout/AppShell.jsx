import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.05),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(var(--primary),0.03),transparent_25%)]" />
      
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 z-10">
        <Outlet />
      </main>
    </div>
  )
}
