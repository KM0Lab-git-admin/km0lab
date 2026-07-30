/**
 * Diccionario CP → población (mock).
 *
 * Fase de maquetación: sustituye la query a Supabase. Cuando se monte la
 * BD real en Railway, reemplazar el cuerpo de `lookupTown()` en
 * `src/lib/postalCodes.ts` por la llamada al backend correspondiente.
 *
 * Para añadir más CPs, simplemente extiende el objeto.
 */
export const MOCK_POSTAL_CODES: Record<string, string> = {
  '00000': 'Demo KM0',
  '08380': 'Malgrat de Mar',
  '08389': 'Palafolls',
  '08398': 'Santa Susanna',
  '08397': 'Pineda de Mar',
  '08370': 'Calella',
  '17300': 'Blanes',
  '17310': 'Lloret de Mar',
  '08001': 'Barcelona',
  '08002': 'Barcelona',
  '08003': 'Barcelona',
  '28001': 'Madrid',
  '28013': 'Madrid',
  '46001': 'València',
  '41001': 'Sevilla',
  '48001': 'Bilbao',
}
