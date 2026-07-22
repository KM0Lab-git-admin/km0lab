import { getProfile, updateProfile, useAuth, lookupTown } from '@km0lab/app'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import type { FormEvent } from 'react'

import BrandedFrame from '@/components/BrandedFrame'

/**
 * Profile — Edición y visualización del perfil del usuario.
 *
 * Campos:
 *  - Nombre, apellidos, código postal y población → editables
 *  - Email → solo lectura (viene de la sesión, cambiarlo rompería el login)
 *
 * Estados: loading (carga inicial del perfil), saving (al guardar),
 * error (toast). El email se obtiene de `user.email`.
 */

const profileSchema = z.object({
  first_name: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  last_name: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$|^$/, 'Código postal de 5 dígitos')
    .optional(),
})

type ProfileForm = {
  first_name: string
  last_name: string
  postal_code: string
}

const Profile = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    postal_code: '',
  })
  // Población derivada del CP (read-only). Se resuelve async vía Supabase.
  const [town, setTown] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    lookupTown(form.postal_code).then((t) => {
      if (!cancelled) setTown(t)
    })
    return () => {
      cancelled = true
    }
  }, [form.postal_code])

  // Cargar perfil al montar (RLS restringe a la fila del propio user).
  // Modo testing: si no hay user, dejamos el formulario vacío y editable.
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
          postal_code: data.postal_code ?? '',
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
      toast.error(parsed.error.issues[0]?.message ?? 'Datos no válidos')
      return
    }

    setSaving(true)
    const { error } = await updateProfile(user.id, {
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      postal_code: form.postal_code.trim() || null,
      town: town ?? null,
    })

    setSaving(false)
    if (error) {
      toast.error('No se pudo guardar')
      return
    }
    toast.success('Perfil actualizado')
  }

  const handleLogout = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/home')
  }

  return (
    <BrandedFrame onBack={() => navigate(-1)} backAriaLabel="Volver">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-4 horizontal-mobile:overflow-y-auto horizontal-desktop:overflow-y-auto"
      >
        <div className="text-center space-y-1 mt-2">
          <h1 className="font-brand text-2xl horizontal-mobile:text-xl text-km0-blue-700">
            Mi perfil
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Actualiza tus datos
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-km0-blue-700" size={28} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-3 mt-1">
            <Field label="Nombre">
              <input
                type="text"
                value={form.first_name}
                onChange={handleChange('first_name')}
                placeholder="Tu nombre"
                autoComplete="given-name"
                className={inputCls}
              />
            </Field>

            <Field label="Apellidos">
              <input
                type="text"
                value={form.last_name}
                onChange={handleChange('last_name')}
                placeholder="Tus apellidos"
                autoComplete="family-name"
                className={inputCls}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            </Field>

            <div className="grid grid-cols-[110px_1fr] gap-2">
              <Field label="C. postal">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={form.postal_code}
                  onChange={handleChange('postal_code')}
                  placeholder="08380"
                  className={inputCls}
                />
              </Field>
              <Field label="Población">
                <input
                  type="text"
                  value={town ?? ''}
                  readOnly
                  disabled
                  placeholder={
                    form.postal_code.length === 5
                      ? 'Sin coincidencia'
                      : 'Se rellena con el CP'
                  }
                  className={`${inputCls} opacity-60 cursor-not-allowed`}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="h-12 mt-2 rounded-xl bg-km0-yellow-500 hover:bg-km0-yellow-600 active:scale-[0.98] transition-all font-ui text-base text-km0-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="h-11 mt-1 rounded-xl border-2 border-km0-blue-700/20 hover:bg-km0-beige-100 active:scale-[0.98] transition-all font-ui text-sm text-km0-blue-700 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Cerrar sesión
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
