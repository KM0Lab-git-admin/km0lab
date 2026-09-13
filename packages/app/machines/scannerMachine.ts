/**
 * scannerMachine — Flux del escàner QR global.
 *
 * Estats:
 *   reading    → la càmera "busca" el QR (visor animat, sense càmera real)
 *   validating → codi detectat, validant contra el service mock
 *   error      → resultat KO (unió discriminada per `ScanErrorKind`)
 *   success    → resultat OK; la vista dispara la navegació a Confirmació
 *
 * Esdeveniments:
 *   DETECT { code }  → salta a validating
 *   RESET            → torna a reading
 *
 * La lectura real de càmera i la validació contra el backend viuen a
 * PRODUCCIÓ; aquí només s'invoca `scannerMockService.scan`.
 */
import { assign, fromPromise, setup } from 'xstate'

import {
  scannerMockService,
  type ScanErrorKind,
  type ScanResult,
} from '../services/mock/scanner'

interface ScannerContext {
  code: string | null
  result: ScanResult | null
  errorKind: ScanErrorKind | null
  errorComercNom: string | null
}

type ScannerEvent = { type: 'DETECT'; code: string } | { type: 'RESET' }

export const scannerMachine = setup({
  types: {
    context: {} as ScannerContext,
    events: {} as ScannerEvent,
  },
  actors: {
    validate: fromPromise<ScanResult, { code: string }>(({ input }) =>
      scannerMockService.scan(input.code)
    ),
  },
  actions: {
    setCode: assign({
      code: (_, params: { code: string }) => params.code,
      result: null,
      errorKind: null,
      errorComercNom: null,
    }),
    setSuccess: assign(({ event }) => {
      const output = (event as unknown as { output: ScanResult }).output
      return {
        result: output,
        errorKind: null,
        errorComercNom: null,
      }
    }),
    setError: assign(({ event }) => {
      const output = (event as unknown as { output: ScanResult }).output
      if (output.ok === false) {
        return {
          result: output,
          errorKind: output.kind,
          errorComercNom: output.comercNom ?? null,
        }
      }
      return {}
    }),
    reset: assign({
      code: null,
      result: null,
      errorKind: null,
      errorComercNom: null,
    }),
  },
  guards: {
    isOk: ({ event }) => {
      const output = (event as unknown as { output: ScanResult }).output
      return output.ok === true
    },
  },
}).createMachine({
  id: 'scanner',
  initial: 'reading',
  context: {
    code: null,
    result: null,
    errorKind: null,
    errorComercNom: null,
  },
  states: {
    reading: {
      on: {
        DETECT: {
          target: 'validating',
          actions: [
            {
              type: 'setCode',
              params: ({ event }) => ({ code: event.code }),
            },
          ],
        },
      },
    },
    validating: {
      invoke: {
        src: 'validate',
        input: ({ context }) => ({ code: context.code ?? '' }),
        onDone: [
          { target: 'success', guard: 'isOk', actions: 'setSuccess' },
          { target: 'error', actions: 'setError' },
        ],
        onError: {
          target: 'error',
          actions: assign({
            errorKind: () => 'sense_connexio' as ScanErrorKind,
          }),
        },
      },
    },
    error: {
      on: { RESET: { target: 'reading', actions: 'reset' } },
    },
    success: {
      on: { RESET: { target: 'reading', actions: 'reset' } },
    },
  },
})
