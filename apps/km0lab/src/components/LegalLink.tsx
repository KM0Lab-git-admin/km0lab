import { Link, useLocation } from 'react-router-dom'

import type { ReactNode } from 'react'

interface LegalLinkProps {
  to: string
  children: ReactNode
  className?: string
}

/** Opens the legal route over the current route so local form state stays mounted. */
const LegalLink = ({ to, children, className }: LegalLinkProps) => {
  const location = useLocation()
  return (
    <Link
      to={to}
      state={{ backgroundLocation: location }}
      className={className}
    >
      {children}
    </Link>
  )
}

export default LegalLink
