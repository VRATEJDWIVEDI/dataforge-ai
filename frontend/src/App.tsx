import { Routes, Route } from "react-router-dom"
import RootLayout from "@/layouts/RootLayout"
import LandingPage from "@/pages/LandingPage"

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
    </Routes>
  )
}

export default App
