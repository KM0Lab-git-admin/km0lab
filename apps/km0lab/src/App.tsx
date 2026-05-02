import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const Language = lazy(() => import('./pages/Language'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const PostalCode = lazy(() => import('./pages/PostalCode'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/language-selection" replace />}
          />
          <Route path="/language-selection" element={<Language />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/postal-code" element={<PostalCode />} />
          <Route
            path="*"
            element={<Navigate to="/language-selection" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
