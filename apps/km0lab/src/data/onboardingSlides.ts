import {
  HeartHandshake,
  CalendarDays,
  TicketPercent,
  BotMessageSquare,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

import slide1 from '@/assets/onboarding/01_connecta_barri.jpg'
import slide2 from '@/assets/onboarding/02_agenda_avisos.jpg'
import slide3 from '@/assets/onboarding/03_punts_recompenses.jpg'
import slide4 from '@/assets/onboarding/04_assistent_247.jpg'
import slide5 from '@/assets/onboarding/05_municipi_sostenible.jpg'

export interface Slide {
  id: string
  step: number
  xp: number
  titleCa: string
  titleEs: string
  titleEn: string
  descCa: string
  descEs: string
  descEn: string
  altCa: string
  altEs: string
  altEn: string
  /** Fondo del área de imagen (token KM0 hsl). */
  color: string
  /** Ilustración local (import Vite → URL). */
  image: string
  /** Icono lucide usado en el thumbnail. */
  icon: LucideIcon
}

export const slides: Slide[] = [
  {
    id: 'connecta_barri',
    step: 1,
    xp: 10,
    titleCa: 'Connecta amb el teu barri',
    titleEs: 'Conecta con tu barrio',
    titleEn: 'Connect with your neighborhood',
    descCa: 'Comerços, serveis i activitats locals en un sol lloc.',
    descEs: 'Comercios, servicios y actividades locales en un solo lugar.',
    descEn: 'Local shops, services and activities in one place.',
    altCa: "Dues persones saludant-se davant d'un comerç local de barri.",
    altEs: 'Dos personas saludándose delante de un comercio local de barrio.',
    altEn: 'Two people high-fiving in front of a local neighborhood shop.',
    color: 'hsl(var(--km0-beige-100))',
    image: slide1,
    icon: HeartHandshake,
  },
  {
    id: 'agenda_avisos',
    step: 2,
    xp: 10,
    titleCa: 'No et perdis res important',
    titleEs: 'No te pierdas nada importante',
    titleEn: "Don't miss anything important",
    descCa: "Agenda d'esdeveniments, notícies i avisos del teu municipi.",
    descEs: 'Agenda de eventos, noticias y avisos de tu municipio.',
    descEn: 'Events, news and alerts from your town.',
    altCa: 'Calendari local amb activitats, mercat, cultura i esports.',
    altEs: 'Calendario local con actividades, mercado, cultura y deportes.',
    altEn: 'Local calendar with activities, market, culture and sports.',
    color: 'hsl(var(--km0-teal-100))',
    image: slide2,
    icon: CalendarDays,
  },
  {
    id: 'punts_recompenses',
    step: 3,
    xp: 10,
    titleCa: 'Guanya punts i obté recompenses',
    titleEs: 'Gana puntos y consigue recompensas',
    titleEn: 'Earn points and get rewards',
    descCa:
      'Visita, participa i compra local per sumar punts i bescanviar cupons i descomptes.',
    descEs:
      'Visita, participa y compra local para sumar puntos y canjear cupones y descuentos.',
    descEn:
      'Visit, take part and shop local to earn points and redeem coupons and discounts.',
    altCa: 'Persona celebrant punts, cupons i recompenses locals.',
    altEs: 'Persona celebrando puntos, cupones y recompensas locales.',
    altEn: 'Person celebrating local points, coupons and rewards.',
    color: 'hsl(var(--km0-yellow-100))',
    image: slide3,
    icon: TicketPercent,
  },
  {
    id: 'assistent_247',
    step: 4,
    xp: 10,
    titleCa: 'Assistent intel·ligent 24/7',
    titleEs: 'Asistente inteligente 24/7',
    titleEn: 'Smart assistant 24/7',
    descCa: 'Responem els teus dubtes sobre tràmits, serveis i molt més.',
    descEs: 'Respondemos tus dudas sobre trámites, servicios y mucho más.',
    descEn: 'We answer your questions about paperwork, services and much more.',
    altCa: "Assistent virtual KM0 responent preguntes des d'un ordinador.",
    altEs: 'Asistente virtual KM0 respondiendo preguntas desde un ordenador.',
    altEn: 'KM0 virtual assistant answering questions from a laptop.',
    color: 'hsl(var(--km0-blue-100))',
    image: slide4,
    icon: BotMessageSquare,
  },
  {
    id: 'municipi_sostenible',
    step: 5,
    xp: 10,
    titleCa: 'Fem créixer el nostre municipi',
    titleEs: 'Hagamos crecer nuestro municipio',
    titleEn: "Let's grow our town together",
    descCa:
      'Col·laborant, consumint local i participant, fem un municipi més pròsper i sostenible.',
    descEs:
      'Colaborando, consumiendo local y participando, hacemos un municipio más próspero y sostenible.',
    descEn:
      'By collaborating, buying local and taking part, we build a more prosperous and sustainable town.',
    altCa:
      'Escena de municipi viu amb comerç local, serveis, salut i sostenibilitat.',
    altEs:
      'Escena de municipio vivo con comercio local, servicios, salud y sostenibilidad.',
    altEn:
      'Lively town scene with local commerce, services, health and sustainability.',
    color: 'hsl(var(--km0-coral-100))',
    image: slide5,
    icon: BarChart3,
  },
]
