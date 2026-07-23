import { SonnerToaster, Toaster, TooltipProvider } from '@km0lab/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import RequireSetup from '@/components/RequireSetup'
import TopLoadingBar from '@/components/TopLoadingBar'
import { LangProvider } from '@/contexts/LangContext'

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
                  path="/home-registrado"
                  element={
                    <RequireSetup need="location">
                      <Home forceAuthState="authed" />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/home-no-registrado"
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
                      <Profile />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/agenda"
                  element={
                    <RequireSetup need="location">
                      <Agenda />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/noticias"
                  element={
                    <RequireSetup need="location">
                      <Noticias />
                    </RequireSetup>
                  }
                />
                <Route
                  path="/evento"
                  element={
                    <RequireSetup need="location">
                      <Evento />
                    </RequireSetup>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  )
}
