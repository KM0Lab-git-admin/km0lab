import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Points — el tab "Els meus punts" apunta a /points, però la pantalla
 * real d'historial viu a /historial-punts. Aquest component redirigeix
 * per mantenir la navegació coherent sense trencar enllaços antics.
 */
const Points = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/historial-punts', { replace: true })
  }, [navigate])

  return null
}

export default Points
