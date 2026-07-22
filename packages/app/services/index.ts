/**
 * @km0lab/app — services
 *
 * Re-exports de los services compartidos entre apps. Añadir aquí los services nuevos
 * importándolos desde su archivo y exportándolos.
 *
 * Convención: un archivo por services (kebab-case para ficheros de utils/data,
 * `useXxx.ts` para hooks).
 *
 * Nota: el subsistema de events-query (apiClient, apiSchemas, eventQueryApi,
 * eventsApi, newsApi) se portará en su propia tanda, junto con la reconciliación
 * del contrato real de la API.
 */
export * from './mock/auth'
export * from './mock/profile'
