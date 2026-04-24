import { clsx } from 'clsx'
import { cssInterop } from 'nativewind'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'
import type { LucideIcon } from 'lucide-react-native'
import type { GestureResponderEvent } from 'react-native'
import type { SvgProps } from 'react-native-svg'

export type Icon = (props: SvgProps) => React.JSX.Element

export function interopIcon(icon: Icon | LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ToggleGroupUtils = {
  getIsSelected(value: string | string[] | undefined, itemValue: string) {
    if (value === undefined) {
      return false
    }
    if (typeof value === 'string') {
      return value === itemValue
    }
    return value.includes(itemValue)
  },
  getNewSingleValue(
    originalValue: string | string[] | undefined,
    itemValue: string
  ) {
    if (originalValue === itemValue) {
      return undefined
    }
    return itemValue
  },
  getNewMultipleValue(
    originalValue: string | string[] | undefined,
    itemValue: string
  ) {
    if (originalValue === undefined) {
      return [itemValue]
    }
    if (typeof originalValue === 'string') {
      return originalValue === itemValue ? [] : [originalValue, itemValue]
    }
    if (originalValue.includes(itemValue)) {
      return originalValue.filter((v) => v !== itemValue)
    }
    return [...originalValue, itemValue]
  },
}

const EmptyGestureResponderEvent: GestureResponderEvent = {
  nativeEvent: {
    changedTouches: [],
    identifier: '0',
    locationX: 0,
    locationY: 0,
    pageX: 0,
    pageY: 0,
    target: '0',
    timestamp: 0,
    touches: [],
  },
  bubbles: false,
  cancelable: false,
  currentTarget: {} as any,
  defaultPrevented: false,
  eventPhase: 0,
  persist: () => {},
  isDefaultPrevented: () => false,
  isPropagationStopped: () => false,
  isTrusted: false,
  preventDefault: () => {},
  stopPropagation: () => {},
  target: {} as any,
  timeStamp: 0,
  type: '',
}

export { ToggleGroupUtils, EmptyGestureResponderEvent }
