import { SonnerToaster, Toaster, TooltipProvider } from '@km0lab/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import TopLoadingBar from '@/components/TopLoadingBar'
import { LangProvider } from '@/contexts/LangContext'

const Index = lazy(() => import('./pages/Index'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const PostalCode = lazy(() => import('./pages/PostalCode'))
const Login = lazy(() => import('./pages/Login'))
const CheckEmail = lazy(() => import('./pages/CheckEmail'))
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <TopLoadingBar />
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/postal-code" element={<PostalCode />} />
                <Route path="/login" element={<Login />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/home" element={<Home />} />
                <Route
                  path="/home-registrado"
                  element={<Home forceAuthState="authed" />}
                />
                <Route
                  path="/home-no-registrado"
                  element={<Home forceAuthState="guest" />}
                />
                <Route path="/profile" element={<Profile />} />
                {/* Rutas del subsistema events-query (agenda, evento, noticias,
                    hoy, chat) pendientes de su tanda. */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  )
}
