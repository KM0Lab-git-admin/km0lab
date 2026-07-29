import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { getProfile, updateProfile } from '@km0lab/app'
import { useAuth } from '@km0lab/app'
import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'
import BrandedFrame from '@/components/BrandedFrame'

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
  birth_date: string
}

const Profile = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
  })

  const todayIso = new Date().toISOString().slice(0, 10)

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
    birth_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$|^$/)
      .refine((v) => !v || v <= todayIso, {
        message: t('profile.error_max', lang),
      })
      .optional(),
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const data = await getProfile(user.id)
      if (cancelled) return
      if (data) {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          phone: data.phone ?? '',
          birth_date: data.birth_date ?? '',
        })
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

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
      birth_date: form.birth_date.trim() || null,
    })

    setSaving(false)
    if (error) {
      toast.error(t('profile.toast_save_fail', lang))
      return
    }
    toast.success(t('profile.toast_saved', lang))
  }

  const handleLogout = async () => {
    await signOut()
    toast.success(t('profile.toast_logout', lang))
    navigate('/home')
  }

  return (
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

            <Field label={t('profile.birth_date', lang)}>
              <input
                type="date"
                value={form.birth_date}
                onChange={handleChange('birth_date')}
                max={todayIso}
                autoComplete="bday"
                className={inputCls}
              />
              <span className="font-body text-[11px] text-km0-blue-800/60 px-1 mt-0.5">
                {t('profile.birth_date_hint', lang)}
              </span>
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="h-12 mt-2 rounded-xl bg-km0-yellow-500 hover:bg-km0-yellow-600 active:scale-[0.98] transition-all font-ui text-base text-km0-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? t('profile.saving', lang) : t('profile.save', lang)}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="h-11 mt-1 rounded-xl border-2 border-km0-blue-700/20 hover:bg-km0-beige-100 active:scale-[0.98] transition-all font-ui text-sm text-km0-blue-700 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              {t('profile.logout', lang)}
            </button>
          </form>
        )}
      </motion.div>
    </BrandedFrame>
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
