import { useEffect, useRef } from 'react'

type ScrollAxis = 'horizontal' | 'vertical'

/** Mouse-only enhancement: touch, wheel and keyboard keep native scrolling. */
export function useDragScroll(axis: ScrollAxis) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let start: { id: number; x: number; y: number; scroll: number } | null =
      null
    let dragging = false
    let suppressClick = false

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if (
        event.target instanceof Element &&
        event.target.closest('input, textarea, select, [contenteditable=true]')
      )
        return
      suppressClick = false
      start = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        scroll: axis === 'horizontal' ? element.scrollLeft : element.scrollTop,
      }
    }

    const onMove = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      const delta = axis === 'horizontal' ? dx : dy
      const crossDelta = axis === 'horizontal' ? dy : dx
      if (!dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
        // Nested carousels and their parent each own only their axis.
        if (Math.abs(crossDelta) > Math.abs(delta)) {
          start = null
          return
        }
        dragging = true
        suppressClick = true
        element.dataset.dragging = 'true'
        element.setPointerCapture(event.pointerId)
      }
      event.preventDefault()
      if (axis === 'horizontal') element.scrollLeft = start.scroll - delta
      else element.scrollTop = start.scroll - delta
    }

    const onEnd = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId)
      start = null
      dragging = false
      delete element.dataset.dragging
    }

    const onClick = (event: MouseEvent) => {
      // Keyboard activation has detail=0 and must remain available.
      if (!suppressClick || event.detail === 0) return
      event.preventDefault()
      event.stopImmediatePropagation()
      suppressClick = false
    }
    const onNativeDrag = (event: DragEvent) => {
      if (start) event.preventDefault()
    }

    element.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
    element.addEventListener('click', onClick, true)
    element.addEventListener('dragstart', onNativeDrag)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      element.removeEventListener('click', onClick, true)
      element.removeEventListener('dragstart', onNativeDrag)
      delete element.dataset.dragging
    }
  }, [axis])

  return ref
}
