import { useDragScroll, t, type Lang } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface BubbleSheetProps {
  open: boolean
  onClose: () => void
  title: string
  lang: Lang
  container?: HTMLElement | null
  children: ReactNode
  /** Fixed below the scrolling body. */
  footer?: ReactNode
}

const BubbleSheet = ({
  open,
  onClose,
  title,
  lang,
  container,
  children,
  footer,
}: BubbleSheetProps) => {
  const scrollRef = useDragScroll('vertical')
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay
          className={cn(
            'inset-0 z-40 bg-km0-blue-900/45',
            container ? 'absolute' : 'fixed'
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'bottom-0 left-1/2 z-50 flex max-h-[92%] w-full max-w-[430px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[28px] bg-km0-beige-50 shadow-[var(--shadow-bubble)] outline-none',
            container ? 'absolute' : 'fixed'
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 pt-4">
            <DialogPrimitive.Title className="font-brand text-xl font-black text-km0-blue-800">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button
                variant="bubbleSurface"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full bg-card text-km0-blue-800"
                aria-label={t('common.close', lang)}
              >
                <X aria-hidden className="!h-6 !w-6" />
              </Button>
            </DialogPrimitive.Close>
          </header>
          <div ref={scrollRef} className="min-h-0 overflow-y-auto px-5 pb-6">
            {children}
          </div>
          {footer && <div className="shrink-0 px-5 pb-5 pt-3">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default BubbleSheet
