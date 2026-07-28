import { t } from '@km0lab/app'
import { Home as HomeIcon, User, Coins, Gift } from 'lucide-react'

import type { ReactNode } from 'react'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

export type HomeTab = 'home' | 'puntos' | 'rewards' | 'perfil'

export interface BottomTabsProps {
  activeTab: HomeTab
  /** Si hay sesión, los tabs no-home responden con su handler real; si no, redirigen a login. */
  isAuthed: boolean
  onLogin: () => void
  onHome: () => void
  onProfile: () => void
  onPoints: () => void
  onRewards: () => void
}

const BottomTabs = ({
  activeTab,
  isAuthed,
  onLogin,
  onHome,
  onProfile,
  onPoints,
  onRewards,
}: BottomTabsProps) => {
  const { lang } = useLang()

  const handleClick = (tab: HomeTab, action: () => void) => {
    if (!isAuthed && tab !== 'home') {
      onLogin()
      return
    }
    action()
  }

  const isActive = (tab: HomeTab) =>
    (isAuthed || tab === 'home') && activeTab === tab

  return (
    <nav
      className="shrink-0 bg-white border-t border-km0-beige-200 px-2 pt-2 pb-3 grid grid-cols-4"
      aria-label="Navegación principal"
    >
      <TabItem
        icon={<HomeIcon size={20} strokeWidth={2.2} />}
        label={t('tabs.home', lang)}
        active={isActive('home')}
        onClick={() => handleClick('home', onHome)}
      />
      <TabItem
        icon={<Coins size={20} strokeWidth={2.2} />}
        label={t('tabs.points', lang)}
        active={isActive('puntos')}
        onClick={() => handleClick('puntos', onPoints)}
      />
      <TabItem
        icon={<Gift size={20} strokeWidth={2.2} />}
        label={t('tabs.rewards', lang)}
        active={isActive('rewards')}
        onClick={() => handleClick('rewards', onRewards)}
      />
      <TabItem
        icon={<User size={20} strokeWidth={2.2} />}
        label={t('tabs.profile', lang)}
        active={isActive('perfil')}
        onClick={() => handleClick('perfil', onProfile)}
      />
    </nav>
  )
}

interface TabItemProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

const TabItem = ({ icon, label, active, onClick }: TabItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      'flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform',
      active ? 'text-km0-blue-700' : 'text-km0-blue-800/40'
    )}
  >
    <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
    <span className="font-ui font-bold text-[10px] leading-tight">{label}</span>
  </button>
)

export default BottomTabs
