import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import {
  Home as HomeIcon,
  User,
  Coins,
  Gift,
  Sparkles,
  Lock,
} from 'lucide-react'

import type { ReactNode } from 'react'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

export type HomeTab = 'home' | 'actions' | 'puntos' | 'rewards' | 'perfil'

export interface BottomTabsProps {
  activeTab: HomeTab | null
  /** Si hay sesión, los tabs no-home responden con su handler real; si no, redirigen a login. */
  isAuthed: boolean
  onLogin: (tab?: HomeTab) => void
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
      onLogin(tab)
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
      className="relative z-20 shrink-0 rounded-t-[22px] bg-card px-1 pt-2 pb-3 grid grid-cols-5 shadow-[var(--shadow-bubble)]"
      aria-label={t('navigation.main', lang)}
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
  <Button
    variant="bubbleSurface"
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'h-auto min-h-14 min-w-0 flex-col justify-start gap-1 whitespace-normal rounded-xl px-0 py-1',
      active
        ? 'text-km0-blue-700'
        : available
          ? 'text-km0-blue-800/50'
          : 'text-km0-blue-800/60'
    )}
  >
    <span
      className={cn(
        'relative flex h-7 w-11 items-center justify-center rounded-full',
        active && 'bg-km0-yellow-500'
      )}
    >
      {icon}
      {!available && (
        <Lock
          aria-hidden
          className="absolute -right-0.5 -top-1 !h-3 !w-3 rounded-full bg-km0-beige-100 text-km0-blue-800"
        />
      )}
    </span>
    <span className="font-ui font-bold text-[11px] leading-tight">{label}</span>
  </Button>
)

export default BottomTabs
