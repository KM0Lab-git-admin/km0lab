/**
 * @km0lab/app — services
 *
 * Servicios reales contra km0lab-api (auth OTP + JWT, perfil) más el
 * subsistema events-query sincronizado desde Lovable (apiSchemas,
 * eventsApi, newsApi).
 *
 * apiClient es de bajo nivel y propiedad de producción (env real, sin el
 * proxy Supabase de Lovable); no se re-exporta para evitar colisiones de
 * ApiError/apiFetch con km0labClient.
 *
 * eventQueryApi/types de Lovable no se sincronizan: duplican
 * Evento/QueryResponse de apiSchemas y llaman a Supabase directamente.
 */
export * from './km0labClient'
export * from './auth'
export * from './profile'
export * from './points'
export * from './rewards'
export * from './promotions'
export * from './shops'
export * from './shopCategories'
export * from './towns'
export * from './redemptions'
export * from './scans'
export * from './invites'
export * from './apiSchemas'
export * from './eventsApi'
export * from './newsApi'
export * from './businessRegistration'
export * from './accountEvents'
export * from './appUpdate'
export type { ApiReward } from './rewardsApi'
export * from './municipalListings'
export * from './territory'
export * from './territoryCategories'
