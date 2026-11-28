import { Capacitor } from '@capacitor/core'
import { SonnerToaster, Toaster, TooltipProvider } from '@km0lab/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import type { LegalDocumentId } from '@km0lab/app'
import type { Location } from 'react-router-dom'

import CaptureInviteFromUrl from '@/components/CaptureInviteFromUrl'
import DeviceShell from '@/components/DeviceShell'
import RequireAuth from '@/components/RequireAuth'
import RequireSetup from '@/components/RequireSetup'
import ResumePendingScan from '@/components/ResumePendingScan'
import TermsGate from '@/components/TermsGate'
import TopLoadingBar from '@/components/TopLoadingBar'
import UpdateRequired from '@/components/UpdateRequired'
import { LangProvider } from '@/contexts/LangContext'
import { LEGAL_ROUTES } from '@/data/legalRoutes'

// En nativo (Capacitor WebView) HashRouter evita 404 al reabrir la app;
// en web mantenemos BrowserRouter para URLs limpias y SEO.
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

const Index = lazy(() => import('./pages/Index'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const PostalCode = lazy(() => import('./pages/PostalCode'))
const Login = lazy(() => import('./pages/Login'))
const LegalDocument = lazy(() => import('./pages/LegalDocument'))
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
const EmailOtpTemplate = lazy(() => import('./pages/EmailOtpTemplate'))
const Invite = lazy(() => import('./pages/Invite'))
const InviteLanding = lazy(() => import('./pages/InviteLanding'))
const MyInvitations = lazy(() => import('./pages/MyInvitations'))
const BusinessSignup = lazy(() => import('./pages/BusinessSignup'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient()

interface LegalLocationState {
  backgroundLocation?: Location
}

/**
 * Las rutas. Como en el prototipo (encargo 16), un enlace legal abierto desde
 * otra pantalla (`LegalLink`) lleva esa pantalla en `backgroundLocation`: se
 * sigue pintando debajo, sin desmontarse, y el texto legal va encima. Al
 * volver, la casilla y lo escrito siguen ahí. Entrar directo a
 * `/condicions` o `/privacitat` pinta la página sola.
 */
function AppRoutes() {
  const location = useLocation()
  const backgroundLocation = (location.state as LegalLocationState | null)
    ?.backgroundLocation
  const legalDocumentId: LegalDocumentId | null =
    location.pathname === LEGAL_ROUTES.terms
      ? 'conditions'
      : location.pathname === LEGAL_ROUTES.privacy
        ? 'privacy'
        : null

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<Index />} />
        <Route
          path="/onboarding"
          element={
            <RequireSetup need="language">
              <Onboarding />
            </RequireSetup>
          }
        />
        {/* Se entra desde la Home ("Com funciona?"), que ya exige
              need="location"; el mismo guard mantiene la coherencia. */}
        <Route
          path="/how-it-works"
          element={
            <RequireSetup need="location">
              <HowItWorks />
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
              <DeviceShell>
                <Home />
              </DeviceShell>
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
              <DeviceShell>
                <Agenda />
              </DeviceShell>
            </RequireSetup>
          }
        />
        <Route
          path="/news"
          element={
            <RequireSetup need="location">
              <DeviceShell>
                <Noticias />
              </DeviceShell>
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
              <DeviceShell>
                <PointsActions />
              </DeviceShell>
            </RequireSetup>
          }
        />
        <Route
          path="/points-history"
          element={
            <RequireSetup need="location">
              <RequireAuth>
                <DeviceShell>
                  <HistorialPunts />
                </DeviceShell>
              </RequireAuth>
            </RequireSetup>
          }
        />
        <Route
          path="/rewards"
          element={
            <RequireSetup need="location">
              <DeviceShell>
                <Premis />
              </DeviceShell>
            </RequireSetup>
          }
        />
        <Route
          path="/redeemed-rewards"
          element={
            <RequireSetup need="location">
              <RequireAuth>
                <DeviceShell>
                  <PremisCanjats />
                </DeviceShell>
              </RequireAuth>
            </RequireSetup>
          }
        />
        <Route
          path="/merchants"
          element={
            <RequireSetup need="location">
              <DeviceShell>
                <Comercos />
              </DeviceShell>
            </RequireSetup>
          }
        />
        <Route
          path="/merchants/:id"
          element={
            <RequireSetup need="location">
              <DeviceShell>
                <ComercDetall />
              </DeviceShell>
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
        {/* Sin guardas: guarda el código antes de que nada redirija. */}
        <Route path="/scan" element={<ScanDeepLink />} />
        {/* Textos legales: públicos, sin sesión ni pueblo elegido. La
              ficha de la tienda de aplicaciones enlaza a /privacitat. Desde
              un formulario se abren encima (ver `AppRoutes`). */}
        <Route
          path={LEGAL_ROUTES.terms}
          element={
            <DeviceShell>
              <LegalDocument documentId="conditions" />
            </DeviceShell>
          }
        />
        <Route
          path={LEGAL_ROUTES.privacy}
          element={
            <DeviceShell>
              <LegalDocument documentId="privacy" />
            </DeviceShell>
          }
        />
        <Route path="/i/:code" element={<InviteLanding />} />
        <Route
          path="/invite"
          element={
            <RequireSetup need="location">
              <DeviceShell>
                <Invite />
              </DeviceShell>
            </RequireSetup>
          }
        />
        <Route
          path="/my-invitations"
          element={
            <RequireSetup need="location">
              <RequireAuth>
                <DeviceShell>
                  <MyInvitations />
                </DeviceShell>
              </RequireAuth>
            </RequireSetup>
          }
        />
        <Route
          path="/business-signup"
          element={
            <RequireSetup need="location">
              <BusinessSignup />
            </RequireSetup>
          }
        />
        {/* Maqueta visual del email OTP: referencia de diseno, no
              forma parte del funnel de usuario. Sin guard. */}
        <Route path="/email/otp" element={<EmailOtpTemplate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {backgroundLocation && legalDocumentId && (
        <div className="pointer-events-auto fixed inset-0 z-[70] overflow-hidden bg-km0-beige-50">
          <DeviceShell>
            <LegalDocument documentId={legalDocumentId} />
          </DeviceShell>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <UpdateRequired />
          <Router>
            <CaptureInviteFromUrl />
            <ResumePendingScan />
            <TermsGate />
            <TopLoadingBar />
            <Suspense fallback={null}>
              <AppRoutes />
            </Suspense>
          </Router>
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  )
}
