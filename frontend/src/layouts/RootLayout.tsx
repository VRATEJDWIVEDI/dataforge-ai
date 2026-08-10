import { Outlet } from "react-router-dom"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <span className="font-semibold tracking-tight">DataForge AI</span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}