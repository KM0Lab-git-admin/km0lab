import { useAuth, t, createBusinessRegistration } from '@km0lab/app'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@km0lab/ui'
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import type { BusinessRegistrationInput } from '@km0lab/app'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'

type ScreenState =
  | 'loading'
  | 'empty'
  | 'error'
  | 'ready'
  | 'already'
  | 'success'

interface BusinessFormValues {
  businessName: string
  taxId: string
  category: string
  description: string
  website: string
  address: string
  town: string
  contactName: string
  email: string
  phone: string
  acceptedTerms: boolean
}

const inputClass =
  'h-11 w-full rounded-xl border-2 border-km0-blue-100 bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const BusinessSignup = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const forced = searchParams.get('state') as ScreenState | null
  const [screenState, setScreenState] = useState<ScreenState>(
    forced ?? 'loading'
  )
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoName, setLogoName] = useState<string | null>(null)
  const referralReference = searchParams.get('ref')
  const invitedTown = searchParams.get('town') ?? ''

  const schema = useMemo(
    () =>
      z.object({
        businessName: z
          .string()
          .trim()
          .min(1, t('business.error.required', lang))
          .max(120),
        taxId: z
          .string()
          .trim()
          .min(5, t('business.error.required', lang))
          .max(20),
        category: z.string().min(1, t('business.error.required', lang)),
        description: z
          .string()
          .trim()
          .min(1, t('business.error.required', lang))
          .max(500),
        website: z
          .string()
          .trim()
          .refine(
            (value) => !value || z.string().url().safeParse(value).success,
            t('business.error.url', lang)
          ),
        address: z
          .string()
          .trim()
          .min(1, t('business.error.required', lang))
          .max(180),
        town: z
          .string()
          .trim()
          .min(1, t('business.error.required', lang))
          .max(100),
        contactName: z
          .string()
          .trim()
          .min(1, t('business.error.required', lang))
          .max(100),
        email: z
          .string()
          .trim()
          .email(t('business.error.email', lang))
          .max(255),
        phone: z
          .string()
          .trim()
          .regex(/^[+\d][\d\s]{5,19}$|^$/, t('profile.error_phone', lang)),
        acceptedTerms: z
          .boolean()
          .refine((value) => value, t('business.error.terms', lang)),
      }),
    [lang]
  )

  const form = useForm<BusinessFormValues>({
    defaultValues: {
      businessName: '',
      taxId: '',
      category: '',
      description: '',
      website: '',
      address: '',
      town: invitedTown,
      contactName: '',
      email: user?.email ?? '',
      phone: '',
      acceptedTerms: false,
    },
  })

  useEffect(() => {
    if (forced) return
    const timer = window.setTimeout(() => setScreenState('ready'), 350)
    return () => window.clearTimeout(timer)
  }, [forced])

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    },
    [logoPreview]
  )

  const onLogoChange = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/') || file.size > 3_000_000)
      return
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
    setLogoName(file.name)
  }

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(null)
    setLogoName(null)
  }

  const submit = async (values: BusinessFormValues) => {
    if (form.formState.isSubmitting) return
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string' && field in values) {
          form.setError(field as keyof BusinessFormValues, {
            message: issue.message,
          })
        }
      })
      return
    }
    setScreenState('ready')
    const input: BusinessRegistrationInput = {
      businessName: values.businessName,
      taxId: values.taxId,
      category: values.category,
      description: values.description,
      website: values.website,
      address: values.address,
      town: values.town,
      contactName: values.contactName,
      email: values.email,
      phone: values.phone,
      acceptedTerms: values.acceptedTerms,
      logoName,
      referralReference,
    }
    try {
      const result = await createBusinessRegistration(input)
      setScreenState(result.status === 'created' ? 'success' : 'already')
    } catch {
      setScreenState('error')
    }
  }

  if (screenState === 'loading') {
    return (
      <BrandedFrame>
        <div className="flex min-h-full items-center justify-center">
          <Loader2
            className="animate-spin text-km0-blue-700"
            aria-label={t('common.loading', lang)}
          />
        </div>
      </BrandedFrame>
    )
  }

  if (screenState === 'success') {
    return (
      <BrandedFrame>
        <div className="flex min-h-full flex-col items-center justify-center px-3 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-km0-teal-100 text-km0-teal-700">
            <CheckCircle2 size={38} aria-hidden />
          </span>
          <h1 className="mt-5 font-brand text-2xl font-black text-km0-blue-900">
            {t('business.success.title', lang)}
          </h1>
          <p className="mt-2 font-body text-sm text-km0-blue-800/70">
            {t('business.success.description', lang)}
          </p>
          <Button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-6 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500"
          >
            {t('business.success.cta', lang)}
          </Button>
          <p className="mt-2 font-body text-[11px] text-km0-blue-800/50">
            {t('business.success.mock_note', lang)}
          </p>
        </div>
      </BrandedFrame>
    )
  }

  if (screenState === 'already') {
    return (
      <BrandedFrame
        onBack={() => setScreenState('ready')}
        backAriaLabel={t('common.back', lang)}
      >
        <div className="flex min-h-full flex-col items-center justify-center px-3 text-center">
          <AlertCircle size={42} className="text-km0-coral-400" aria-hidden />
          <h1 className="mt-4 font-brand text-xl font-black text-km0-blue-900">
            {t('business.already.title', lang)}
          </h1>
          <p className="mt-2 font-body text-sm text-km0-blue-800/70">
            {t('business.already.description', lang)}
          </p>
          <Button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-5 w-full"
          >
            {t('business.already.login', lang)}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setScreenState('ready')}
            className="mt-2 w-full"
          >
            {t('business.already.help', lang)}
          </Button>
        </div>
      </BrandedFrame>
    )
  }

  if (screenState === 'empty') {
    return (
      <BrandedFrame>
        <div className="flex min-h-full flex-col items-center justify-center text-center">
          <h1 className="font-brand text-xl text-km0-blue-900">
            {t('business.empty.title', lang)}
          </h1>
          <Button
            type="button"
            onClick={() => setScreenState('ready')}
            className="mt-4"
          >
            {t('business.empty.cta', lang)}
          </Button>
        </div>
      </BrandedFrame>
    )
  }

  return (
    <BrandedFrame
      onBack={() => navigate(-1)}
      backAriaLabel={t('common.back', lang)}
    >
      <div className="mx-auto w-full max-w-[420px] py-2">
        <header className="text-center">
          {referralReference && (
            <span className="inline-flex rounded-full bg-km0-teal-100 px-2.5 py-1 font-ui text-[11px] font-bold text-km0-teal-700">
              {t('invite.applied', lang)}
            </span>
          )}
          <h1 className="mt-2 font-brand text-2xl font-black text-km0-blue-900">
            {t('business.title', lang)}
          </h1>
          <p className="mt-1 font-body text-sm text-km0-blue-800/70">
            {t('business.description', lang)}
          </p>
        </header>

        {screenState === 'error' && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
          >
            <p className="font-body text-sm text-destructive">
              {t('business.error.submit', lang)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScreenState('ready')}
              className="mt-2 border-destructive/30 text-destructive"
            >
              <RefreshCw aria-hidden />
              {t('business.retry', lang)}
            </Button>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="mt-5 flex flex-col gap-5"
          >
            <fieldset className="flex flex-col gap-3 rounded-2xl border border-km0-blue-100 bg-card p-4">
              <legend className="px-1 font-brand text-base font-black text-km0-blue-900">
                {t('business.group.business', lang)}
              </legend>
              <TextField
                form={form}
                name="businessName"
                label={t('business.name', lang)}
              />
              <TextField
                form={form}
                name="taxId"
                label={t('business.tax_id', lang)}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.category', lang)}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass}>
                          <SelectValue
                            placeholder={t(
                              'business.category.placeholder',
                              lang
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['shop', 'food', 'service', 'culture'].map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(
                              `business.category.${value}` as 'business.category.shop',
                              lang
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <TextField
                form={form}
                name="description"
                label={t('business.short_description', lang)}
                multiline
              />
              <TextField
                form={form}
                name="website"
                label={t('business.website', lang)}
                inputMode="url"
              />
              <div>
                <span className="font-ui text-sm font-medium text-km0-blue-900">
                  {t('business.logo', lang)}
                </span>
                {logoPreview ? (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-km0-blue-100 p-2">
                    <img
                      src={logoPreview}
                      alt=""
                      className="h-14 w-14 rounded-lg object-contain"
                    />
                    <span className="min-w-0 flex-1 truncate font-body text-xs text-km0-blue-800/70">
                      {logoName}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeLogo}
                      aria-label={t('business.logo.remove', lang)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ) : null}
                <label className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-km0-blue-100 bg-background font-ui text-sm font-bold text-km0-blue-800 focus-within:ring-2 focus-within:ring-ring">
                  <ImagePlus size={16} aria-hidden />
                  {t(
                    logoPreview ? 'business.logo.replace' : 'business.logo.add',
                    lang
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => onLogoChange(event.target.files?.[0])}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3 rounded-2xl border border-km0-blue-100 bg-card p-4">
              <legend className="px-1 font-brand text-base font-black text-km0-blue-900">
                {t('business.group.location', lang)}
              </legend>
              <TextField
                form={form}
                name="address"
                label={t('business.address', lang)}
              />
              <TextField
                form={form}
                name="town"
                label={t('business.town', lang)}
              />
            </fieldset>

            <fieldset className="flex flex-col gap-3 rounded-2xl border border-km0-blue-100 bg-card p-4">
              <legend className="px-1 font-brand text-base font-black text-km0-blue-900">
                {t('business.group.contact', lang)}
              </legend>
              <TextField
                form={form}
                name="contactName"
                label={t('business.contact_name', lang)}
              />
              <TextField
                form={form}
                name="email"
                label={t('business.email', lang)}
                inputMode="email"
                disabled={Boolean(user)}
              />
              <p className="-mt-2 font-body text-[11px] text-km0-blue-800/60">
                {t(
                  user
                    ? 'business.email.session_hint'
                    : 'business.email.access_hint',
                  lang
                )}
              </p>
              <TextField
                form={form}
                name="phone"
                label={t('business.phone', lang)}
                inputMode="tel"
              />
              <FormField
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="font-body text-xs font-normal leading-snug text-km0-blue-800">
                        {t('business.terms', lang)}
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 w-full bg-km0-yellow-400 font-ui font-bold text-km0-blue-900 hover:bg-km0-yellow-500"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : null}
              {t(
                form.formState.isSubmitting
                  ? 'business.submitting'
                  : 'business.submit',
                lang
              )}
            </Button>
          </form>
        </Form>
      </div>
    </BrandedFrame>
  )
}

interface TextFieldProps {
  form: UseFormReturn<BusinessFormValues>
  name: Exclude<keyof BusinessFormValues, 'acceptedTerms'>
  label: string
  multiline?: boolean
  inputMode?: 'text' | 'email' | 'tel' | 'url'
  disabled?: boolean
}

const TextField = ({
  form,
  name,
  label,
  multiline = false,
  inputMode = 'text',
  disabled = false,
}: TextFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {multiline ? (
            <textarea
              {...field}
              rows={3}
              disabled={disabled}
              className="w-full rounded-xl border-2 border-km0-blue-100 bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <input
              {...field}
              type={
                inputMode === 'email'
                  ? 'email'
                  : inputMode === 'tel'
                    ? 'tel'
                    : 'text'
              }
              inputMode={inputMode}
              disabled={disabled}
              className={inputClass}
            />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default BusinessSignup
