/**
 * @km0lab/app — services
 *
 * Servicios reales contra km0lab-api (auth OTP + JWT, perfil). Sustituyen a
 * los mocks. El cliente HTTP compartido vive en km0labClient.
 *
 * Nota: el subsistema de events-query (apiClient, apiSchemas, eventQueryApi,
 * eventsApi, newsApi) se portará en su propia tanda, junto con la
 * reconciliación del contrato real de esa API.
 */
export * from './km0labClient'
export * from './auth'
export * from './profile'
// apiClient es de bajo nivel (lo usan eventsApi/newsApi por ruta relativa);
// no se re-exporta para evitar colisiones de ApiError/apiFetch con km0labClient.
export * from './apiSchemas'
export * from './eventsApi'
export * from './newsApi'
