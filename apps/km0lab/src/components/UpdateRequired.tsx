import { appPlatform, env, t, useUpdateRequired } from '@km0lab/app'

import { useLang } from '@/contexts/LangContext'

/**
 * UpdateRequired — pantalla de «actualiza la app».
 *
 * Sale cuando el servidor contesta que esta versión ya no está admitida
 * (ver `docs/VERSIONES.md`). Tapa toda la app: con una versión que el
 * servidor rechaza no hay nada que se pueda usar.
 *
 * Es de producción (bloqueada en el manifest del porte). Es mínima a
 * propósito: su diseño definitivo es un encargo pendiente para Lovable.
 */
export default function UpdateRequired() {
  const required = useUpdateRequired()
  const { lang } = useLang()

  if (!required) return null

  const platform = appPlatform()
  const storeUrl =
    platform === 'android'
      ? env.androidStoreUrl
      : platform === 'ios'
        ? env.iosStoreUrl
        : undefined

  const act = () => {
    if (storeUrl) {
      window.open(storeUrl, '_system')
      return
    }
    window.location.reload()
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="update-required-title"
      aria-describedby="update-required-body"
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-5 bg-background px-8 text-center"
    >
      <h1
        id="update-required-title"
        className="font-brand text-2xl text-km0-blue-700"
      >
        {t('update.title', lang)}
      </h1>
      <p
        id="update-required-body"
        className="max-w-xs font-body text-base text-foreground"
      >
        {t(storeUrl ? 'update.body' : 'update.body_web', lang)}
      </p>
      <button
        type="button"
        onClick={act}
        className="rounded-2xl bg-primary px-6 py-3 font-ui text-sm font-semibold text-primary-foreground transition-all hover:bg-km0-blue-600 active:scale-95"
      >
        {t(storeUrl ? 'update.cta' : 'update.cta_web', lang)}
      </button>
    </div>
  )
}
