import { useState } from 'react'

import { useNotifications } from '../hooks/useNotifications'

export function useNotificationsPanel() {
  const notifications = useNotifications()
  const [open, setOpen] = useState(false)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const show = () => {
    notifications.markAllSeen()
    setOpen(true)
  }
  return {
    ...notifications,
    open,
    show,
    close: () => setOpen(false),
    container,
    setContainer,
  }
}
