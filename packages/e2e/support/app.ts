/**
 * Lo que un vecino hace en la app, dicho una sola vez. Los recorridos se
 * leen como una lista de pasos («entra», «canjea», «mira el saldo») y si
 * una pantalla cambia se arregla aquí, no en doce ficheros.
 *
 * Los controles se buscan por su nombre accesible, tomado del diccionario
 * de la app (`tr('clave')`): un rediseño no rompe las pruebas, y un botón
 * sin nombre para lectores de pantalla sí.
 */
import { expect, type Locator, type Page } from '@playwright/test'

import { demoPostalCode, fixedCode } from './env'
import {
  containing,
  exactly,
  translator,
  type Lang,
  type TKey,
  type Translate,
} from './i18n'

const LANGUAGE_KEY: Record<Lang, TKey> = {
  ca: 'language.catalan',
  es: 'language.spanish',
  en: 'language.english',
}

export type Tab = 'home' | 'actions' | 'points' | 'rewards' | 'profile'

export class App {
  readonly tr: Translate

  constructor(
    readonly page: Page,
    readonly lang: Lang = 'es'
  ) {
    this.tr = translator(lang)
  }

  // ── Localizadores por nombre ───────────────────────────────────────

  button(key: TKey): Locator {
    return this.page.getByRole('button', { name: exactly(this.tr(key)) })
  }

  heading(key: TKey): Locator {
    return this.page.getByRole('heading', { name: exactly(this.tr(key)) })
  }

  text(key: TKey): Locator {
    return this.page.getByText(this.tr(key), { exact: true })
  }

  dialog(): Locator {
    return this.page.getByRole('dialog').last()
  }

  toast(key: TKey): Locator {
    return this.page
      .getByRole('region', { name: /notifications/i })
      .getByText(this.tr(key))
  }

  // ── Entrada: idioma, bienvenida, código postal ─────────────────────

  async open(path = '/') {
    await this.page.goto(path)
  }

  async chooseLanguage() {
    await this.page
      .getByRole('button', {
        name: containing(this.tr(LANGUAGE_KEY[this.lang])),
      })
      .click()
    await this.page.waitForURL(/\/onboarding/)
  }

  async skipOnboarding() {
    await this.button('onboarding.skip').click()
    await this.page.waitForURL(/\/postal-code/)
  }

  postalInput(): Locator {
    return this.page.getByPlaceholder(this.tr('postal.placeholder'))
  }

  async typePostalCode(postalCode: string) {
    await this.postalInput().fill(postalCode)
  }

  async enterPostalCode(postalCode: string, townName?: string) {
    await this.typePostalCode(postalCode)
    // El código de demostración no es un pueblo: abre la lista.
    if (postalCode === demoPostalCode) {
      await this.enterShowcase()
      return
    }
    if (townName) {
      await expect(
        this.page.getByRole('heading', { name: containing(townName) })
      ).toBeVisible()
    }
    await this.button('common.continue').click()
    await this.page.waitForURL(/\/home/)
  }

  /** La lista que abre el 00000, con las poblaciones que da el servidor. */
  showcaseList(): Locator {
    return this.page.getByRole('radiogroup', {
      name: exactly(this.tr('demo.title')),
    })
  }

  /** Elige una opción de la lista (la primera si no se dice cuál) y entra. */
  async enterShowcase(choiceName?: string) {
    const options = this.showcaseList().getByRole('radio')
    const option = choiceName
      ? options.filter({ hasText: choiceName })
      : options.first()
    await option.click()
    await this.button('demo.enter').click()
    await this.page.waitForURL(/\/home/)
  }

  /** Idioma → bienvenida → código postal → Home, como un vecino nuevo. */
  async start(postalCode: string, townName?: string) {
    await this.open('/')
    await this.chooseLanguage()
    await this.skipOnboarding()
    await this.enterPostalCode(postalCode, townName)
    await this.expectHome(townName)
  }

  async expectHome(townName?: string) {
    await expect(this.heading('home.section.quick')).toBeVisible()
    if (townName) {
      await expect(
        this.page.getByRole('banner').getByRole('heading', { name: townName })
      ).toBeVisible()
    }
  }

  // ── Acceso ──────────────────────────────────────────────────────────

  /** Desde Home sin sesión: pide el código para ese correo. */
  async requestCode(email: string) {
    await this.button('home.login_cta').first().click()
    await this.page.waitForURL(/\/login/)
    await expect(this.heading('login.title')).toBeVisible()
    await this.page
      .getByPlaceholder(this.tr('login.email_placeholder'))
      .fill(email)
    await this.button('login.submit').click()
    await this.page.waitForURL(/\/check-email/)
    await expect(this.heading('otp.title')).toBeVisible()
    await expect(this.page.getByText(email)).toBeVisible()
  }

  /**
   * Ya en la pantalla de entrar porque la app lo ha traído aquí (por
   * ejemplo, tras abrir el enlace de un comercio): correo y código.
   */
  async loginFromLoginScreen(email: string) {
    await this.page.waitForURL(/\/login/)
    await expect(this.heading('login.title')).toBeVisible()
    await this.page
      .getByPlaceholder(this.tr('login.email_placeholder'))
      .fill(email)
    await this.button('login.submit').click()
    await this.page.waitForURL(/\/check-email/)
    // La pantalla del código tiene que estar puesta antes de teclear.
    await expect(this.heading('otp.title')).toBeVisible()
    await expect(this.page.getByText(email)).toBeVisible()
    await this.typeCode(fixedCode)
  }

  async typeCode(code: string) {
    const boxes = this.page.getByRole('textbox')
    await boxes.first().click()
    await this.page.keyboard.type(code, { delay: 40 })
  }

  /**
   * Entra con una cuenta de prueba (código fijo). Si la cuenta es nueva,
   * el servidor la da de alta y la app enseña el aviso de bienvenida.
   */
  async login(email: string, opts: { expectWelcome?: boolean } = {}) {
    await this.requestCode(email)
    await this.typeCode(fixedCode)
    await this.page.waitForURL(/\/home/)
    if (opts.expectWelcome === true) {
      await expect(this.dialog()).toBeVisible()
    } else if (opts.expectWelcome === false) {
      await expect(this.heading('home.section.quick')).toBeVisible()
      await expect(this.page.getByRole('dialog')).toHaveCount(0)
    }
  }

  async closeWelcome() {
    const dialog = this.dialog()
    await dialog
      .getByRole('button', { name: exactly(this.tr('redeem.cta_done')) })
      .click()
    await expect(this.page.getByRole('dialog')).toHaveCount(0)
  }

  // ── Navegación ──────────────────────────────────────────────────────

  async tab(tab: Tab) {
    await this.page
      .getByRole('navigation', { name: this.tr('navigation.main') })
      .getByRole('button', { name: exactly(this.tr(`tabs.${tab}` as TKey)) })
      .click()
  }

  async quickAccess(key: TKey) {
    await this.button(key).click()
  }

  // ── Saldo ───────────────────────────────────────────────────────────

  /** «N puntos» tal como lo escribe la app (1000 → «1000», 12500 → «12.500»). */
  pointsLabel(points: number): RegExp {
    const plain = String(points)
    const grouped = plain.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const unit = this.tr('common.points')
    return new RegExp(
      `(^|\\D)(${plain}|${grouped.replace('.', '\\.')})\\s*${unit}`,
      'i'
    )
  }

  /** El saldo que enseña la cabecera de Home. */
  async expectHomeBalance(points: number) {
    await expect(
      this.page.getByRole('button', { name: this.pointsLabel(points) }).first()
    ).toBeVisible()
  }

  /** El saldo que enseña «Mis puntos». Deja la app en esa pantalla. */
  async expectHistoryBalance(points: number) {
    await this.open('/points-history')
    await expect(this.heading('points.history.title')).toBeVisible()
    await expect(this.text('points.history.balance')).toBeVisible()
    await expect(
      this.page.getByText(this.pointsLabel(points)).first()
    ).toBeVisible()
  }

  /** El saldo que enseña el catálogo de premios. Deja la app ahí. */
  async expectCatalogBalance(points: number) {
    await this.open('/rewards')
    await expect(this.heading('rewards.title')).toBeVisible()
    await expect(
      this.page.getByText(
        this.tr('rewards.balance_label').replace('{n}', String(points))
      )
    ).toBeVisible()
  }

  // ── Premios ─────────────────────────────────────────────────────────

  rewardCard(name: string): Locator {
    return this.page.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: containing(name) }),
    })
  }

  /** Abre el catálogo y pide el canje de un premio. Devuelve el diálogo. */
  async redeem(rewardName: string): Promise<Locator> {
    await this.open('/rewards')
    await expect(this.heading('rewards.title')).toBeVisible()
    await this.rewardCard(rewardName)
      .getByRole('button', { name: exactly(this.tr('rewards.cta.redeem')) })
      .click()
    const confirm = this.dialog()
    await expect(confirm).toContainText(rewardName)
    await confirm
      .getByRole('button', {
        name: exactly(this.tr('redeem_merch.cta_request')),
      })
      .click()
    const done = this.page.getByRole('dialog', {
      name: this.tr('redeem_merch.title_pending'),
    })
    await expect(done).toBeVisible()
    return done
  }

  // ── Escaneo ─────────────────────────────────────────────────────────

  /** Lo que hace la cámara al leer un QR: abrir su enlace. */
  async scan(qrToken: string) {
    await this.open(`/scan?c=${encodeURIComponent(qrToken)}`)
  }
}
