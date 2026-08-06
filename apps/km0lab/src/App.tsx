import { SonnerToaster, Toaster, TooltipProvider } from '@km0lab/ui'
import { Capacitor } from '@capacitor/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'

import RequireAuth from '@/components/RequireAuth'
import RequireSetup from '@/components/RequireSetup'
import TopLoadingBar from '@/components/TopLoadingBar'
import { LangProvider } from '@/contexts/LangContext'

// En nativo (Capacitor WebView) HashRouter evita 404 al reabrir la app;
// en web mantenemos BrowserRouter para URLs limpias y SEO.
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

const Index = lazy(() => import('./pages/Index'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const PostalCode = lazy(() => import('./pages/PostalCode'))
const Login = lazy(() => import('./pages/Login'))
const CheckEmail = lazy(() => import('./pages/CheckEmail'))
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const Agenda = lazy(() => import('./pages/Agenda'))
const Noticias = lazy(() => import('./pages/Noticias'))
const Evento = lazy(() => import('./pages/Evento'))
const Points = lazy(() => import('./pages/Points'))
const PointsActions = lazy(() => import('./pages/PointsActions'))
const HistorialPunts = lazy(() => import('./pages/HistorialPunts'))
const Premis = lazy(() => import('./pages/Premis'))
const PremisCanjats = lazy(() => import('./pages/PremisCanjats'))
const Comercos = lazy(() => import('./pages/Comercos'))
const ComercDetall = lazy(() => import('./pages/ComercDetall'))
const Scanner = lazy(() => import('./pages/Scanner'))
const ScannerSuccess = lazy(() => import('./pages/ScannerSuccess'))
const ScanDeepLink = lazy(() => import('./pages/ScanDeepLink'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <Router>
            <TopLoadingBar />
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/onboarding"
                  element={
                    <RequireSetup need="language">
                      <Onboarding />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/postal-code"
                  element={
                    <RequireSetup need="language">
                      <PostalCode />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <RequireSetup need="location">
                      <Login />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/check-email"
                  element={
                    <RequireSetup need="location">
                      <CheckEmail />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <RequireSetup need="location">
                      <Home />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/home-registered"
                  element={
                    <RequireSetup need="location">
                      <Home forceAuthState="authed" />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/home-unregistered"
                  element={
                    <RequireSetup need="location">
                      <Home forceAuthState="guest" />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <Profile />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <RequireSetup need="location">
                      <Agenda />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/news"
                  element={
                    <RequireSetup need="location">
                      <Noticias />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/event"
                  element={
                    <RequireSetup need="location">
                      <Evento />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/points"
                  element={
                    <RequireSetup need="location">
                      <Points />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/points-actions"
                  element={
                    <RequireSetup need="location">
                      <PointsActions />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/points-history"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <HistorialPunts />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <RequireSetup need="location">
                      <Premis />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/redeemed-rewards"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <PremisCanjats />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route
                  path="/merchants"
                  element={
                    <RequireSetup need="location">
                      <Comercos />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/merchants/:id"
                  element={
                    <RequireSetup need="location">
                      <ComercDetall />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/scanner"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <Scanner />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route
                  path="/scanner/success"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <ScannerSuccess />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route
                  path="/scan"
                  element={
                    <RequireSetup need="location">
                      <RequireAuth>
                        <ScanDeepLink />
                      </RequireAuth>
                    </RequireSetup>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  )
}
