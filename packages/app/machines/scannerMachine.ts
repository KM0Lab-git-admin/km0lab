/**
 * scannerMachine — Flux del escàner QR global.
 *
 * Estats:
 *   reading    → la càmera busca el QR (visor + càmera real / pujar imatge)
 *   validating → codi detectat, validant contra POST /scans
 *   error      → resultat KO (unió discriminada per `ScanErrorKind`)
 *   success    → resultat OK; la vista dispara la navegació a Confirmació
 *
 * Esdeveniments:
 *   DETECT { code }  → salta a validating
 *   RESET            → torna a reading
 */
import { assign, fromPromise, setup } from 'xstate'

import { mapScanError, mapScanOk, scanQr } from '../services/scans'
import { extractToken } from '../utils/qr'

import type { ScanErrorKind, ScanResult } from '../services/mock/scanner'

interface ScannerContext {
  code: string | null
  result: ScanResult | null
  errorKind: ScanErrorKind | null
  errorComercNom: string | null
  errorAvailableAt: string | null
}

type ScannerEvent = { type: 'DETECT'; code: string } | { type: 'RESET' }

export const scannerMachine = setup({
  types: {
    context: {} as ScannerContext,
    events: {} as ScannerEvent,
  },
  actors: {
    validate: fromPromise<ScanResult, { code: string }>(async ({ input }) => {
      const token = extractToken(input.code)
      if (!token) return { ok: false, kind: 'codi_no_valid' as ScanErrorKind }
      try {
        return mapScanOk(await scanQr(token))
      } catch (e) {
        return mapScanError(e)
      }
    }),
  },
  actions: {
    setCode: assign({
      code: (_, params: { code: string }) => params.code,
      result: null,
      errorKind: null,
      errorComercNom: null,
      errorAvailableAt: null,
    }),
    setSuccess: assign(({ event }) => {
      const output = (event as unknown as { output: ScanResult }).output
      return {
        result: output,
        errorKind: null,
        errorComercNom: null,
        errorAvailableAt: null,
      }
    }),
    setError: assign(({ event }) => {
      const output = (event as unknown as { output: ScanResult }).output
      if (output.ok === false) {
        return {
          result: output,
          errorKind: output.kind,
          errorComercNom: output.comercNom ?? null,
          errorAvailableAt: output.availableAt ?? null,
        }
      }
      return {}
    }),
    reset: assign({
      code: null,
      result: null,
      errorKind: null,
      errorComercNom: null,
      errorAvailableAt: null,
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
    errorAvailableAt: null,
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
