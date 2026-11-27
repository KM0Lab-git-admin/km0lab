import { useSyncExternalStore } from 'react'

import {
  getUpdateRequired,
  subscribeUpdateRequired,
  type UpdateRequired,
} from '../services/appUpdate'

/** La versión mínima que exige el servidor, o null si esta app vale. */
export const useUpdateRequired = (): UpdateRequired =>
  useSyncExternalStore(
    subscribeUpdateRequired,
    getUpdateRequired,
    getUpdateRequired
  )
