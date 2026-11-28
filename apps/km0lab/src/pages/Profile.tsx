import {
  updateProfile,
  useProfile,
  useAuth,
  t,
  useSetHomeTown,
  useTerritory,
  useLocationContext,
  useAccessDoors,
  useSignInMethods,
  logoutEverywhere,
} from '@km0lab/app'
import {
  Button,
  Switch,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@km0lab/ui'
import { motion } from 'framer-motion'
import { LogOut, Loader2, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import type { FormEvent } from 'react'

import BrandedFrame from '@/components/BrandedFrame'
import SignInMethodsSection from '@/components/SignInMethodsSection'
import TownPickerSheet from '@/components/TownPickerSheet'
import { useLang } from '@/contexts/LangContext'
import { LEGAL_ROUTES } from '@/data/legalRoutes'
import { SUPPORT_EMAIL } from '@/data/supportContact'

/**
 * Profile — Edición y visualización del perfil del usuario.
 *
 * Campos editables: nombre, apellidos, teléfono.
 * Email → solo lectura (viene de la sesión).
 * CP/población no se editan aquí: se eligen antes del registro y se
 * guardan al sembrar el perfil.
 */

type ProfileForm = {
  first_name: string
  last_name: string
  phone: string
  contact_shared: boolean
}

const Profile = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user, signOut } = useAuth()
  const { profile, loading } = useProfile()
  const [saving, setSaving] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOutEverywhere, setLoggingOutEverywhere] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    contact_shared: false,
  })

  const profileSchema = z.object({
    first_name: z
      .string()
      .trim()
      .max(100, t('profile.error_max', lang))
      .optional(),
    last_name: z
      .string()
      .trim()
      .max(100, t('profile.error_max', lang))
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s]{5,19}$|^$/, t('profile.error_phone', lang))
      .optional(),
    contact_shared: z.boolean(),
  })

  useEffect(() => {
    if (profile) {
      const data = profile
      setForm({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        phone: data.phone ?? '',
        contact_shared: data.contact_shared ?? false,
      })
    }
  }, [profile])

  const handleChange =
    (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const parsed = profileSchema.safeParse(form)
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? t('profile.error_invalid', lang)
      )
      return
    }

    setSaving(true)
    const { error } = await updateProfile(user.id, {
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim() || null,
      contact_shared: form.contact_shared,
    })

    setSaving(false)
    if (error) {
      toast.error(t('profile.toast_save_fail', lang))
      return
    }
    toast.success(t('profile.toast_saved', lang))
  }

  const { providers } = useAccessDoors()
  const signInMethods = useSignInMethods()
  const territory = useTerritory()
  const { town } = useLocationContext()
  const setHomeTown = useSetHomeTown()
  const [townPickerOpen, setTownPickerOpen] = useState(false)
  const openMyTown = () => {
    if (territory.isGrouped) setTownPickerOpen(true)
    else navigate('/postal-code')
  }

  const handleLogout = async () => {
    await signOut()
    toast.success(t('profile.toast_logout', lang))
    navigate('/login')
  }

  const handleLogoutEverywhere = async () => {
    if (loggingOutEverywhere) return
    setLoggingOutEverywhere(true)
    const fail = () => {
      setLogoutDialogOpen(false)
      toast.error(t('profile.logout_all.error', lang), {
        action: {
          label: t('profile.logout_all.retry', lang),
          onClick: () => {
            void handleLogoutEverywhere()
          },
        },
      })
    }
    try {
      const result = await logoutEverywhere()
      if (result.error) {
        fail()
        return
      }
      setLogoutDialogOpen(false)
      toast.success(t('profile.logout_all.success', lang))
      navigate('/login')
    } catch {
      fail()
    } finally {
      setLoggingOutEverywhere(false)
    }
  }

  return (
    <>
      <BrandedFrame
        onBack={() => navigate(-1)}
        backAriaLabel={t('common.back', lang)}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-full flex flex-col justify-center gap-4"
        >
          <div className="text-center space-y-1 mt-2">
            <h1 className="font-brand text-2xl text-km0-blue-700">
              {t('profile.title', lang)}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t('profile.subtitle', lang)}
            </p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-km0-blue-700" size={28} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-3 mt-1">
              <Field label={t('profile.first_name', lang)}>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={handleChange('first_name')}
                  placeholder={t('profile.first_name_ph', lang)}
                  autoComplete="given-name"
                  className={inputCls}
                />
              </Field>

              <Field label={t('profile.last_name', lang)}>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={handleChange('last_name')}
                  placeholder={t('profile.last_name_ph', lang)}
                  autoComplete="family-name"
                  className={inputCls}
                />
              </Field>

              <Field label={t('profile.email', lang)}>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  disabled
                  className={`${inputCls} opacity-60 cursor-not-allowed`}
                />
              </Field>

              <Field label={t('profile.phone', lang)}>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder={t('profile.phone_ph', lang)}
                  autoComplete="tel"
                  className={inputCls}
                />
              </Field>

              <div className="flex flex-col gap-1">
                <div className="flex min-h-11 items-center justify-between gap-3">
                  <label
                    htmlFor="contact-shared"
                    className="whitespace-normal font-ui text-sm text-km0-blue-800"
                  >
                    {t('profile.legal.contact_label', lang)}
                  </label>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <Switch
                      id="contact-shared"
                      aria-describedby="contact-shared-help"
                      className="relative before:absolute before:inset-x-0 before:-inset-y-2.5"
                      checked={form.phone.trim() ? form.contact_shared : false}
                      onCheckedChange={(contact_shared) =>
                        setForm((previous) => ({ ...previous, contact_shared }))
                      }
                      disabled={!form.phone.trim() || saving}
                    />
                  </div>
                </div>
                <p
                  id="contact-shared-help"
                  className="whitespace-normal font-body text-xs leading-snug text-km0-blue-800/70"
                >
                  {t('profile.legal.contact_help', lang)}
                </p>
              </div>

              <Field label={t('territory.myTown', lang)}>
                <Button
                  variant="bubbleSurface"
                  type="button"
                  onClick={openMyTown}
                  aria-haspopup={territory.isGrouped ? 'dialog' : undefined}
                  className={`${inputCls} justify-between gap-2 text-left`}
                >
                  <span className="truncate">
                    {territory.homeTown?.name ?? town}
                  </span>
                  <ChevronRight
                    aria-hidden
                    size={18}
                    className="shrink-0 text-km0-blue-700"
                  />
                </Button>
              </Field>

              <SignInMethodsSection
                lang={lang}
                methods={signInMethods.methods}
                loading={signInMethods.loading}
                error={signInMethods.error}
                onRetry={signInMethods.reload}
                providers={providers}
                onLink={signInMethods.linkProvider}
              />

              <Button
                variant="bubbleSurface"
                type="submit"
                disabled={saving}
                className="h-12 mt-2 rounded-xl bg-km0-yellow-500 hover:bg-km0-yellow-600 active:scale-[0.98] transition-all font-ui text-base text-km0-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {saving ? t('profile.saving', lang) : t('profile.save', lang)}
              </Button>

              <Button
                variant="bubbleSurface"
                type="button"
                onClick={handleLogout}
                disabled={loggingOutEverywhere}
                className="h-11 mt-1 rounded-xl border-2 border-km0-blue-700/20 hover:bg-km0-beige-100 active:scale-[0.98] transition-all font-ui text-sm text-km0-blue-700 flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                {t('profile.logout', lang)}
              </Button>
              <Button
                variant="bubbleLink"
                type="button"
                disabled={loggingOutEverywhere}
                onClick={() => setLogoutDialogOpen(true)}
                className="h-auto min-h-9 whitespace-normal px-1 font-body text-xs underline underline-offset-2"
              >
                {loggingOutEverywhere && (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                )}
                {t(
                  loggingOutEverywhere
                    ? 'profile.logout_all.loading'
                    : 'profile.logout_all.label',
                  lang
                )}
              </Button>
              <footer className="whitespace-normal text-center font-body text-xs leading-5 text-km0-blue-800/70">
                <p>
                  <a
                    href={LEGAL_ROUTES.terms}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {t('profile.legal.terms', lang)}
                  </a>
                  {t('profile.legal.separator', lang)}
                  <a
                    href={LEGAL_ROUTES.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {t('profile.legal.privacy', lang)}
                  </a>
                </p>
                <p>
                  {t('profile.legal.delete', lang)}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="underline underline-offset-2"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  {t('profile.legal.period', lang)}
                </p>
              </footer>
            </form>
          )}
        </motion.div>
      </BrandedFrame>
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-sm rounded-lg border-km0-blue-700/20 bg-km0-beige-50 text-km0-blue-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-ui">
              {t('profile.logout_all.title', lang)}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-km0-blue-800/70">
              {t('profile.logout_all.description', lang)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="bubbleSurface" disabled={loggingOutEverywhere}>
                {t('profile.logout_all.cancel', lang)}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="bubblePrimary"
                disabled={loggingOutEverywhere}
                onClick={(event) => {
                  event.preventDefault()
                  void handleLogoutEverywhere()
                }}
              >
                {loggingOutEverywhere && (
                  <Loader2 aria-hidden className="animate-spin" />
                )}
                {t(
                  loggingOutEverywhere
                    ? 'profile.logout_all.loading'
                    : 'profile.logout_all.confirm',
                  lang
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {territory.territory && territory.isGrouped && (
        <TownPickerSheet
          open={townPickerOpen}
          onClose={() => setTownPickerOpen(false)}
          towns={territory.territory.towns}
          homeTownId={territory.territory.homeTownId}
          onSave={setHomeTown}
          lang={lang}
        />
      )}
    </>
  )
}

const inputCls =
  'h-11 w-full px-3 rounded-xl border-2 border-km0-blue-700/20 bg-background font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-km0-blue-700 transition-colors'

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <label className="flex flex-col gap-1">
    <span className="font-ui text-xs text-km0-blue-800/70 px-1">{label}</span>
    {children}
  </label>
)

export default Profile
