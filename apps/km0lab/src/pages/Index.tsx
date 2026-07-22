/**
 * Index = punto de entrada de la ruta "/".
 *
 * Mantiene el contrato del router estable: si mañana la pantalla inicial
 * cambia (p. ej. Splash, Login, Home…), basta con cambiar el componente
 * que se renderiza aquí. El resto del proyecto no se entera.
 *
 * Hoy: la pantalla inicial es la selección de idioma.
 */
import Language from './Language'

const Index = () => <Language />

export default Index
