export interface Slide {
  id: number;
  xp: number;
  titleCa: string;
  titleEs: string;
  titleEn: string;
  descCa: string;
  descEs: string;
  descEn: string;
  color: string; // bg color for the image area
  emoji: string; // placeholder visual
}

export const slides: Slide[] = [
  {
    id: 1,
    xp: 10,
    titleCa: "CONNECTA AMB VEÏNS",
    titleEs: "CONECTA CON VECINOS",
    titleEn: "CONNECT WITH NEIGHBORS",
    descCa: "Tu comerç local, més a prop que mai. Descobreix una nova forma d'interactuar amb els teus veïns i donar suport al comerç de proximitat al teu barri, tot des d'una única plataforma dissenyada per a tu.",
    descEs: "Tu comercio local, más cerca que nunca. Descubre una nueva forma de interactuar con tus vecinos y apoyar el comercio de proximidad en tu barrio, todo desde una única plataforma diseñada para ti.",
    descEn: "Your local commerce, closer than ever. Discover a new way to interact with your neighbors and support local businesses in your neighborhood, all from a single platform designed for you.",
    color: "hsl(var(--km0-yellow-300))",
    emoji: "🤝",
  },
  {
    id: 2,
    xp: 20,
    titleCa: "DESCOBREIX EL MERCAT LOCAL",
    titleEs: "DESCUBRE EL MERCADO LOCAL",
    titleEn: "DISCOVER THE LOCAL MARKET",
    descCa: "Troba productes frescos i de proximitat al teu barri.",
    descEs: "Encuentra productos frescos y de proximidad en tu barrio.",
    descEn: "Find fresh, local products in your neighborhood.",
    color: "hsl(var(--km0-teal-300))",
    emoji: "🛒",
  },
  {
    id: 3,
    xp: 30,
    titleCa: "PARTICIPA EN ACTIVITATS",
    titleEs: "PARTICIPA EN ACTIVIDADES",
    titleEn: "JOIN ACTIVITIES",
    descCa: "Activitats per a tota la família, cada setmana.",
    descEs: "Actividades para toda la familia, cada semana.",
    descEn: "Activities for the whole family, every week.",
    color: "hsl(var(--km0-coral-300))",
    emoji: "🎯",
  },
  {
    id: 4,
    xp: 40,
    titleCa: "ACONSEGUEIX RECOMPENSES",
    titleEs: "CONSIGUE RECOMPENSAS",
    titleEn: "EARN REWARDS",
    descCa: "Guanya punts i bescanvia'ls per avantatges exclusius.",
    descEs: "Gana puntos y canjéalos por ventajas exclusivas.",
    descEn: "Earn points and redeem them for exclusive perks.",
    color: "hsl(var(--km0-blue-300))",
    emoji: "🏆",
  },
  {
    id: 5,
    xp: 50,
    titleCa: "APRÈN I CREIX",
    titleEs: "APRENDE Y CRECE",
    titleEn: "LEARN AND GROW",
    descCa: "Formació i recursos per millorar cada dia.",
    descEs: "Formación y recursos para mejorar cada día.",
    descEn: "Training and resources to improve every day.",
    color: "hsl(var(--km0-beige-300))",
    emoji: "📚",
  },
];
