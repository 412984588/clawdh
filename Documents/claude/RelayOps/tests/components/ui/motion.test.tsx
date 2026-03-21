import { render, screen } from '@testing-library/react'
import {
  FadeIn,
  MotionProvider,
  MOTION_DURATIONS,
  SlideUp,
  StaggerItem,
  StaggerList,
} from '@/components/ui/motion'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

describe('motion primitives', () => {
  it('keeps all shared motion durations under 300ms', () => {
    expect(MOTION_DURATIONS.fast).toBeLessThan(0.3)
    expect(MOTION_DURATIONS.base).toBeLessThan(0.3)
    expect(MOTION_DURATIONS.slow).toBeLessThan(0.3)
  })

  it('renders fade, slide, and stagger wrappers with motion metadata', () => {
    mockMatchMedia(false)

    render(
      <MotionProvider>
        <FadeIn data-testid="fade">Fade</FadeIn>
        <SlideUp data-testid="slide">Slide</SlideUp>
        <StaggerList data-testid="list">
          <StaggerItem data-testid="item">Row</StaggerItem>
        </StaggerList>
      </MotionProvider>
    )

    expect(screen.getByTestId('fade')).toHaveAttribute('data-motion', 'fade-in')
    expect(screen.getByTestId('slide')).toHaveAttribute('data-motion', 'slide-up')
    expect(screen.getByTestId('list')).toHaveAttribute('data-motion', 'stagger-list')
    expect(screen.getByTestId('item')).toHaveAttribute('data-motion', 'stagger-item')
  })

  it('marks wrappers as reduced-motion aware when the user prefers reduced motion', () => {
    mockMatchMedia(true)

    render(
      <MotionProvider>
        <SlideUp data-testid="slide">Reduced</SlideUp>
      </MotionProvider>
    )

    expect(screen.getByTestId('slide')).toHaveAttribute('data-reduced-motion', 'true')
  })

  it('supports table semantics for stagger list wrappers', () => {
    mockMatchMedia(false)

    const { container } = render(
      <MotionProvider>
        <table>
          <StaggerList as="tbody" data-testid="tbody-list">
            <StaggerItem as="tr" data-testid="table-row">
              <td>Cell</td>
            </StaggerItem>
          </StaggerList>
        </table>
      </MotionProvider>
    )

    expect(screen.getByTestId('tbody-list').tagName).toBe('TBODY')
    expect(screen.getByTestId('table-row').tagName).toBe('TR')
    expect(container.querySelector('tbody[data-motion="stagger-list"]')).not.toBeNull()
    expect(container.querySelector('tr[data-motion="stagger-item"]')).not.toBeNull()
  })
})
