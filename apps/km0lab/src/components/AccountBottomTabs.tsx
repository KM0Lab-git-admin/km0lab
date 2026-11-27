import { useCallback, useState } from 'react'

import AccountAccessFlow from '@/components/AccountAccessFlow'
import BottomTabs, { type BottomTabsProps } from '@/components/BottomTabs'

/** All locked bottom tabs share the same contained mock account flow. */
const AccountBottomTabs = (props: BottomTabsProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const attach = useCallback((element: HTMLDivElement | null) => {
    setContainer(element?.parentElement ?? null)
  }, [])

  return (
    <AccountAccessFlow isAuthed={props.isAuthed} container={container}>
      {(access) => (
        <>
          <div ref={attach} className="shrink-0">
            <BottomTabs {...props} onLogin={access.open} />
          </div>
        </>
      )}
    </AccountAccessFlow>
  )
}

export default AccountBottomTabs
