import { ReactNode } from 'react'
import { Home as HomeIcon, User, Coins, Gift, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from '@/contexts/LangContext'
import { t } from '@km0lab/app'

export type HomeTab = 'home' | 'actions' | 'puntos' | 'rewards' | 'perfil'

export interface BottomTabsProps {
  activeTab: HomeTab
  /** Si hay sesión, los tabs no-home responden con su handler real; si no, redirigen a login. */
  isAuthed: boolean
  onLogin: () => void
  onHome: () => void
  onProfile: () => void
  onPoints: () => void
  onRewards: () => void
  onActions: () => void
}

const BottomTabs = ({
  activeTab,
  isAuthed,
  onLogin,
  onHome,
  onProfile,
  onPoints,
  onRewards,
  onActions,
}: BottomTabsProps) => {
  const { lang } = useLang()

  const handleClick = (tab: HomeTab, action: () => void) => {
    // Actions e Inicio están disponibles para todos; el resto requiere sesión.
    if (!isAuthed && tab !== 'home' && tab !== 'actions') {
      onLogin()
      return
    }
    action()
  }

  const isActive = (tab: HomeTab) =>
    (isAuthed || tab === 'home' || tab === 'actions') && activeTab === tab

  const isAvailable = (tab: HomeTab) =>
    isAuthed || tab === 'home' || tab === 'actions'

  return (
    <nav
      className="shrink-0 bg-white border-t border-km0-beige-200 px-1 pt-2 pb-3 grid grid-cols-5"
      aria-label="Navegación principal"
    >
      <TabItem
        icon={<HomeIcon size={20} strokeWidth={2.2} />}
        label={t('tabs.home', lang)}
        active={isActive('home')}
        available={isAvailable('home')}
        onClick={() => handleClick('home', onHome)}
      />
      <TabItem
        icon={<Sparkles size={20} strokeWidth={2.2} />}
        label={t('tabs.actions', lang)}
        active={isActive('actions')}
        available={isAvailable('actions')}
        onClick={() => handleClick('actions', onActions)}
      />
      <TabItem
        icon={<Coins size={20} strokeWidth={2.2} />}
        label={t('tabs.points', lang)}
        active={isActive('puntos')}
        available={isAvailable('puntos')}
        onClick={() => handleClick('puntos', onPoints)}
      />
      <TabItem
        icon={<Gift size={20} strokeWidth={2.2} />}
        label={t('tabs.rewards', lang)}
        active={isActive('rewards')}
        available={isAvailable('rewards')}
        onClick={() => handleClick('rewards', onRewards)}
      />
      <TabItem
        icon={<User size={20} strokeWidth={2.2} />}
        label={t('tabs.profile', lang)}
        active={isActive('perfil')}
        available={isAvailable('perfil')}
        onClick={() => handleClick('perfil', onProfile)}
      />
    </nav>
  )
}

interface TabItemProps {
  icon: ReactNode
  label: string
  active: boolean
  available: boolean
  onClick: () => void
}

const TabItem = ({ icon, label, active, available, onClick }: TabItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    aria-disabled={!available}
    className={cn(
      'flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform',
      active
        ? 'text-km0-blue-700'
        : available
          ? 'text-km0-blue-800/50'
          : 'text-km0-blue-800/25'
    )}
  >
    <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
    <span className="font-ui font-bold text-[9px] leading-tight">{label}</span>
  </button>
)

export default BottomTabs
