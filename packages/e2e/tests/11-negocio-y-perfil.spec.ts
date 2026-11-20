/**
 * Recorridos 11 y 12 · Alta de negocio y perfil.
 */
import { me, qaLogin } from '../support/api'
import { qaPostalCode, qaTownName, runId } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Alta de negocio @qa', () => {
  test('un negocio se da de alta y su dueño puede entrar', async ({
    app,
    newEmail,
  }) => {
    // FALLO CONOCIDO (20-11-2026). El formulario no llega a enviarse: la
    // pantalla sale de `submit` si `form.formState.isSubmitting` es cierto,
    // y con React 19 ya lo es cuando se la llama. No hay petición ni aviso.
    // La pantalla es de Lovable: se arregla allí (encargo 10) y se porta.
    // Cuando esté arreglado esta prueba pasará «inesperadamente»: entonces
    // se quita esta marca.
    test.fail(true, 'Alta de negocio: el formulario no se envía (encargo 10)')

    const email = newEmail('negocio')
    const label = (key: Parameters<typeof app.tr>[0]) =>
      app.page.getByLabel(app.tr(key), { exact: true })

    await app.start(qaPostalCode, qaTownName)
    await app.open('/business-signup')
    await expect(app.heading('business.title')).toBeVisible()

    await label('business.name').fill(`[QA] Negocio ${runId}`)
    await label('business.tax_id').fill('B12345678')
    await label('business.category').click()
    await app.page.getByRole('option').first().click()
    await label('business.short_description').fill(
      'Negocio creado por una prueba automática.'
    )
    await label('business.address').fill('Carrer de les Proves, 9')
    const town = label('business.town')
    if ((await town.inputValue()) === '') await town.fill(qaTownName)
    await label('business.contact_name').fill('[QA] Persona De Proves')
    await label('business.email').fill(email)
    await app.page.getByRole('checkbox').check()
    await app.button('business.submit').click()

    await expect(app.heading('business.success.title')).toBeVisible()
    await expect(app.text('business.error.submit')).toHaveCount(0)

    // El dueño entra con su correo y ya es comercio.
    const owner = await qaLogin(email)
    expect(owner.user.roles).toContain('merchant')
    expect(owner.user.shop_id).toBeTruthy()
  })
})

test.describe('Perfil @qa', () => {
  test('guardar un dato y volver a verlo', async ({ app, newEmail }) => {
    const email = newEmail('perfil')
    const name = `[QA] Nom ${runId.slice(-6)}`

    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })
    await app.closeWelcome()

    await app.tab('profile')
    await expect(app.heading('profile.title')).toBeVisible()
    const field = app.page.getByLabel(app.tr('profile.first_name'), {
      exact: true,
    })
    await field.fill(name)
    await app.button('profile.save').click()
    await expect(app.toast('profile.toast_saved')).toBeVisible()

    const session = await qaLogin(email)
    const saved = await me(session.access_token)
    expect(saved.first_name).toBe(name)
    // Guardar el perfil no puede sacar al vecino de su municipio.
    expect(saved.postal_code).toBe(qaPostalCode)

    await app.page.reload()
    await expect(field).toHaveValue(name)
  })
})
