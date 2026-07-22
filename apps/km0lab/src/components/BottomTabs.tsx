import { t } from '@km0lab/app'
import { Home as HomeIcon, Info, Tag, User } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

export type HomeTab = 'home' | 'info' | 'ofertes' | 'perfil'

export interface BottomTabsProps {
  activeTab: HomeTab
  onTabChange: (t: HomeTab) => void
  /** Si hay sesión, el tab Perfil navega a /profile vía onProfile. */
  showProfile: boolean
  onLogin: () => void
  onProfile: () => void
}

const BottomTabs = ({
  activeTab,
  onTabChange,
  showProfile,
  onLogin,
  onProfile,
}: BottomTabsProps) => {
  const { lang } = useLang()
  return (
    <nav
      className="shrink-0 bg-white border-t border-km0-beige-200 px-2 pt-2 pb-3 grid grid-cols-4 horizontal-mobile:!pt-1 horizontal-mobile:!pb-1.5"
      aria-label="Navegación principal"
    >
      <TabItem
        icon={<HomeIcon size={20} strokeWidth={2.2} />}
        label={t('tabs.home', lang)}
        active={activeTab === 'home'}
        onClick={() => onTabChange('home')}
      />
      <TabItem
        icon={<Info size={20} strokeWidth={2.2} />}
        label={t('tabs.info', lang)}
        active={activeTab === 'info'}
        onClick={() => onTabChange('info')}
      />
      <TabItem
        icon={<Tag size={20} strokeWidth={2.2} />}
        label={t('tabs.offers', lang)}
        active={activeTab === 'ofertes'}
        onClick={() => onTabChange('ofertes')}
      />
      <TabItem
        icon={<User size={20} strokeWidth={2.2} />}
        label={
          showProfile ? t('tabs.profile', lang) : t('home.login_cta', lang)
        }
        active={activeTab === 'perfil'}
        onClick={() => {
          onTabChange('perfil')
          if (showProfile) onProfile()
          else onLogin()
        }}
      />
    </nav>
  )
}

interface TabItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

const TabItem = ({ icon, label, active, onClick }: TabItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="flex flex-col items-center gap-0.5 py-1 active:scale-95 transition-transform"
  >
    <span
      className={cn(
        'transition-colors',
        active ? 'text-km0-blue-700' : 'text-km0-blue-800/40'
      )}
    >
      {icon}
    </span>
    <span
      className={cn(
        'font-ui text-[10px] leading-none',
        active ? 'font-bold text-km0-blue-700' : 'text-km0-blue-800/55'
      )}
    >
      {label}
    </span>
  </button>
)

export default BottomTabs
