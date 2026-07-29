import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Tag } from 'lucide-react'
import type { Evento } from '@km0lab/app'

interface EventCardProps {
  evento: Evento
  index: number
}

const EventCard = ({ evento, index }: EventCardProps) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const formatTime = (timeStr: string) => timeStr?.slice(0, 5) ?? ''

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-3 shadow-sm space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
    >
      <h4 className="font-brand text-sm font-bold text-foreground leading-tight">
        {evento.titulo}
      </h4>

      <p className="font-body text-xs text-muted-foreground leading-snug">
        {evento.descripcion_corta}
      </p>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-ui">
        {evento.fecha_inicio && (
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-accent" />
            {formatDate(evento.fecha_inicio)}
          </span>
        )}
        {evento.hora_inicio && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-accent" />
            {formatTime(evento.hora_inicio)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-accent" />
          {evento.lugar_nombre}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {evento.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[10px] font-ui"
            >
              <Tag size={9} />
              {tag.replace('#', '')}
            </span>
          ))}
        </div>

        {evento.es_gratuito ? (
          <span className="text-[10px] font-ui font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            Gratis
          </span>
        ) : evento.precio_euros ? (
          <span className="text-[10px] font-ui font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-full">
            {evento.precio_euros.toFixed(2)} €
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}

export default EventCard
