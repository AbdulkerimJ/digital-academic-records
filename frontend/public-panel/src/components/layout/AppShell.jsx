import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="min-h-screen w-full flex bg-background relative selection:bg-primary/10 selection:text-primary transition-colors duration-500 font-sans">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,var(--color-primary),transparent)] opacity-[0.02] pointer-events-none z-0" />

      {/* Sidebar - Desktop & Mobile */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative z-10">
        <Navbar onMenuToggle={toggleMobileMenu} />
        
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1600px] w-full mx-auto animate-fade-in-up">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  )
}
