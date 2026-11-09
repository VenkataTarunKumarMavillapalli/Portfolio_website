// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { chapters, getYearMilestones } from '../src/data/biography';

// App integration only: animation engines and renderers are doubles. The dialog
// polyfill emits native-style events but is not OS, Safari, WebGL or real-browser
// Escape/focus-trap validation. StoryPanels have their own unmocked DOM tests.
const doubles = vi.hoisted(() => ({
  webglFails: false,
  webgl: vi.fn(),
  software: vi.fn(),
  timeline: vi.fn(),
  refresh: vi.fn(),
  registerPlugin: vi.fn(),
}));

vi.mock('gsap', () => ({ default: { registerPlugin: doubles.registerPlugin, timeline: doubles.timeline } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: doubles.refresh } }));
vi.mock('../src/scene/SceneWorld', async () => {
  const { createElement, useEffect } = await import('react');
  return {
    default: function MockWebGL(props: { motionEnabled: boolean; onReady: () => void; onError: () => void }) {
      doubles.webgl(props);
      useEffect(() => {
        if (doubles.webglFails) props.onError(); else props.onReady();
      }, [props.onReady, props.onError]);
      return createElement('div', { 'data-testid': 'webgl-double', 'data-motion': String(props.motionEnabled) });
    },
  };
});
vi.mock('../src/scene/SoftwareScene', async () => {
  const { createElement } = await import('react');
  return {
    default: function MockSoftware(props: { motionEnabled: boolean }) {
      doubles.software(props);
      return createElement('div', { 'data-testid': 'software-double', 'data-motion': String(props.motionEnabled) });
    },
  };
});
vi.mock('../src/components/StoryPanels', async () => {
  const { createElement } = await import('react');
  return { default: (props: { kind: string; motionEnabled: boolean }) => createElement('div', {
    'data-testid': 'panel-double', 'data-kind': props.kind, 'data-motion': String(props.motionEnabled),
  }, `Test panel: ${props.kind}`) };
});
vi.mock('motion/react', async () => {
  const { createElement } = await import('react');
  return {
    MotionConfig: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }: {
        children: React.ReactNode; initial?: unknown; animate?: unknown; transition?: unknown;
      }) => createElement('div', props, children),
    },
  };
});

import App from '../src/App';

type FakeTimeline = {
  to: ReturnType<typeof vi.fn>;
  kill: ReturnType<typeof vi.fn>;
  scrollTrigger: { kill: ReturnType<typeof vi.fn> };
};
let reduced = true;
const preferenceListeners = new Set<EventListener>();
const timelines: FakeTimeline[] = [];
let scrollIntoView: ReturnType<typeof vi.fn>;
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');

beforeEach(() => {
  reduced = true;
  preferenceListeners.clear();
  timelines.splice(0);
  doubles.webglFails = false;
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  doubles.timeline.mockImplementation(() => {
    const timeline: FakeTimeline = { to: vi.fn(), kill: vi.fn(), scrollTrigger: { kill: vi.fn() } };
    timeline.to.mockReturnValue(timeline);
    timelines.push(timeline);
    return timeline;
  });
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return query === '(prefers-reduced-motion: reduce)' && reduced; },
    media: query, onchange: null,
    addEventListener: (_event: string, callback: EventListener) => preferenceListeners.add(callback),
    removeEventListener: (_event: string, callback: EventListener) => preferenceListeners.delete(callback),
    addListener: (callback: EventListener) => preferenceListeners.add(callback),
    removeListener: (callback: EventListener) => preferenceListeners.delete(callback),
    dispatchEvent: () => true,
  })));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => window.clearTimeout(handle));
  scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
      this.querySelector<HTMLElement>('button, [href], input, select, [tabindex]')?.focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      if (!this.open) return;
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  for (const [prototype, name, original] of [
    [HTMLDialogElement.prototype, 'showModal', originalShowModal],
    [HTMLDialogElement.prototype, 'close', originalClose],
    [HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView],
  ] as const) {
    if (original) Object.defineProperty(prototype, name, original);
    else Reflect.deleteProperty(prototype, name);
  }
  document.body.classList.remove('dialog-open');
  delete document.body.dataset.motion;
  document.documentElement.style.scrollBehavior = '';
  window.history.replaceState(null, '', '/');
  localStorage.clear();
});

function setDeviceReducedMotion(value: boolean) {
  act(() => {
    reduced = value;
    preferenceListeners.forEach(listener => listener(new Event('change')));
  });
}

describe('App reduced-motion contract', () => {
  it('forces motion off despite a saved on preference and cannot be overridden by the motion button', async () => {
    const user = userEvent.setup();
    localStorage.setItem('becoming-motion', 'on');
    const storageWrites = vi.spyOn(Storage.prototype, 'setItem');
    render(<App/>);
    expect(await screen.findByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    const control = screen.getByRole('button', { name: 'Enable motion' });
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(document.body.dataset.motion).toBe('off');
    expect(document.documentElement.style.scrollBehavior).toBe('auto');
    await user.click(control);
    expect(screen.getByRole('button', { name: 'Enable motion' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Reduced motion follows your device preference');
    expect(storageWrites).not.toHaveBeenCalled();
    expect(localStorage.getItem('becoming-motion')).toBe('on');
  });

  it('responds to device changes while preserving an explicit stored motion-off choice', async () => {
    reduced = false;
    localStorage.setItem('becoming-motion', 'off');
    const user = userEvent.setup();
    render(<App/>);
    expect(await screen.findByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    setDeviceReducedMotion(true);
    setDeviceReducedMotion(false);
    expect(screen.getByRole('button', { name: 'Enable motion' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Enable motion' }));
    expect(screen.getByRole('button', { name: 'Pause motion' })).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('becoming-motion')).toBe('on');
    setDeviceReducedMotion(true);
    expect(screen.getByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    expect(document.documentElement.style.scrollBehavior).toBe('auto');
    setDeviceReducedMotion(false);
    expect(screen.getByTestId('webgl-double')).toHaveAttribute('data-motion', 'true');
    expect(document.documentElement.style.scrollBehavior).toBe('smooth');
  });

  it('passes reduced motion through the simulated graphics-failure fallback and open explorations', async () => {
    doubles.webglFails = true;
    const user = userEvent.setup();
    const { container } = render(<App/>);
    expect(await screen.findByTestId('software-double')).toHaveAttribute('data-motion', 'false');
    expect(container.querySelector('.app')).toHaveAttribute('data-renderer', 'software');
    expect(screen.queryByTestId('webgl-double')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Open the memory archive/ }));
    expect(await screen.findByTestId('panel-double')).toHaveAttribute('data-motion', 'false');
    expect(screen.getByTestId('panel-double')).toHaveAttribute('data-kind', 'origins');
  });

  it('pauses the active renderer during an overlay and resumes the user setting after close', async () => {
    reduced = false;
    const user = userEvent.setup();
    render(<App/>);
    expect(await screen.findByTestId('webgl-double')).toHaveAttribute('data-motion', 'true');
    await user.click(screen.getByRole('button', { name: 'Open journey menu' }));
    expect(screen.getByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    await user.click(screen.getByRole('button', { name: 'Close exploration' }));
    expect(screen.getByTestId('webgl-double')).toHaveAttribute('data-motion', 'true');
  });
});

describe('graphics-off reading mode and complete navigation', () => {
  it('bypasses both renderer components via graphics=off while retaining all ten accessible sections', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const { container } = render(<App/>);
    await act(async () => {});
    expect(container.querySelector('.app')).toHaveAttribute('data-renderer', 'reading');
    expect(doubles.webgl).not.toHaveBeenCalled();
    expect(doubles.software).not.toHaveBeenCalled();
    expect(screen.queryByTestId('webgl-double')).not.toBeInTheDocument();
    expect(screen.queryByTestId('software-double')).not.toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('region')).toHaveLength(10);
    expect(Array.from(main.querySelectorAll(':scope > section')).map(section => section.id)).toEqual(['introduction', ...chapters.map(chapter => chapter.id)]);
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(main).getAllByRole('heading', { level: 2 })).toHaveLength(9);
    expect(timelines[0].to).toHaveBeenCalledTimes(9);
    expect(document.body.dataset.motion).toBe('off');
  });

  it('exposes all 28 selectable years and preserves honest missing-year content', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    const { container } = render(<App/>);
    await user.click(screen.getByRole('button', { name: /Open living timeline/ }));
    const dialog = screen.getByRole('dialog');
    const yearButtons = within(dialog).getAllByRole('button', { name: /^\d{4}$/ });
    expect(yearButtons.map(button => button.textContent)).toEqual(Array.from({ length: 28 }, (_, index) => String(1999 + index)));
    for (let year = 1999; year <= 2026; year++) {
      const button = within(dialog).getByRole('button', { name: String(year) });
      await user.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(yearButtons.filter(item => item.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
      const result = container.querySelector<HTMLElement>('.year-result')!;
      const supplied = getYearMilestones(year);
      if (!supplied.length) {
        expect(result).toHaveTextContent(`No specific milestone for ${year} has been supplied. Nothing has been invented to fill the gap.`);
      } else {
        expect(within(result).getAllByRole('article')).toHaveLength(supplied.length);
        supplied.forEach(entry => expect(within(result).getByRole('heading', { name: entry.title })).toBeInTheDocument());
      }
    }
  });

  it('offers all nine chapter routes plus the introduction and focuses the chosen section after navigation', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('button', { name: 'Open journey menu' }));
    const navigation = screen.getByRole('navigation', { name: 'Chapters' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(10);
    await user.click(within(navigation).getByRole('button', { name: /The AI consultant/ }));
    await waitFor(() => expect(document.getElementById('laboratory')).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('dialog-open');
  });

  it('can enter cinematic mode from reading mode without overriding the reduced-motion preference', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole('button', { name: 'Cinematic mode →' }));
    expect(await screen.findByTestId('webgl-double')).toHaveAttribute('data-motion', 'false');
    expect(screen.getByRole('button', { name: 'Enable motion' })).toHaveAttribute('aria-pressed', 'false');
    expect(doubles.software).not.toHaveBeenCalled();
  });
});

describe('overlay cleanup and focus-return contract', () => {
  it('cleans up and restores the invoking button through repeated close-button cycles', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    render(<App/>);
    const opener = screen.getByRole('button', { name: 'Open journey menu' });
    for (let cycle = 0; cycle < 2; cycle++) {
      await user.click(opener);
      expect(screen.getByRole('dialog')).toBeVisible();
      expect(document.body).toHaveClass('dialog-open');
      expect(screen.getByRole('button', { name: 'Close exploration' })).toHaveFocus();
      await user.click(screen.getByRole('button', { name: 'Close exploration' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body).not.toHaveClass('dialog-open');
      expect(opener).toHaveFocus();
      expect(screen.queryByRole('heading', { name: 'Choose a chapter.' })).not.toBeInTheDocument();
    }
  });

  it('handles a simulated native cancel/close sequence and restores the original timeline control', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    render(<App/>);
    const opener = screen.getByRole('button', { name: /Open living timeline/ });
    await user.click(opener);
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;
    // Browsers perform this sequence after Escape; jsdom does not implement
    // that keyboard default action. Verify the app's native close handler only.
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    act(() => dialog.close());
    expect(dialog.open).toBe(false);
    expect(document.body).not.toHaveClass('dialog-open');
    expect(opener).toHaveFocus();
    expect(screen.queryByRole('button', { name: '2001' })).not.toBeInTheDocument();
  });

  it('removes scroll triggers, media listeners and the body lock when unmounted with a dialog open', async () => {
    window.history.replaceState(null, '', '/?graphics=off');
    const user = userEvent.setup();
    const { unmount } = render(<App/>);
    await user.click(screen.getByRole('button', { name: 'Open journey menu' }));
    expect(document.body).toHaveClass('dialog-open');
    expect(preferenceListeners.size).toBe(1);
    unmount();
    expect(document.body).not.toHaveClass('dialog-open');
    expect(preferenceListeners.size).toBe(0);
    expect(timelines[0].kill).toHaveBeenCalledOnce();
    expect(timelines[0].scrollTrigger.kill).toHaveBeenCalledOnce();
  });
});
