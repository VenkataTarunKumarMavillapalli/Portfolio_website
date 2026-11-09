// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryPanel from '../src/components/StoryPanels';
import { chapters, memorySlots } from '../src/data/biography';
import { retrievalSources } from '../src/lib/demoData';

// Only the test process receives synthetic photo configuration. No biography
// source file, approved photo or external system is modified by these fixtures.
const originalMemorySlots = structuredClone(memorySlots);
afterEach(() => {
  cleanup();
  memorySlots.forEach((slot, index) => Object.assign(slot, originalMemorySlots[index]));
});

const show = (kind: string) => render(<StoryPanel kind={kind} motionEnabled={false}/>);
async function laboratory(name: RegExp) {
  const user = userEvent.setup();
  const result = show('laboratory');
  await user.click(screen.getByRole('button', { name }));
  return { ...result, user };
}
function element(container: HTMLElement, selector: string) {
  const result = container.querySelector<HTMLElement>(selector);
  expect(result, `Missing ${selector}`).not.toBeNull();
  return result!;
}

describe('accessible chapter explorations', () => {
  it.each(chapters)('renders chapter $number via its $panelKind route in static mode', chapter => {
    const { container } = show(chapter.panelKind);
    expect(element(container, '.story-panel')).toHaveAttribute('data-motion', 'off');
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
    expect(screen.queryByText('This exploration is not available. Use the journey menu to choose a chapter.')).not.toBeInTheDocument();
  });

  it('routes a selected city to its associated chapter rather than inventing an itinerary', async () => {
    const user = userEvent.setup(), onNavigate = vi.fn();
    render(<StoryPanel kind="world" motionEnabled={false} onNavigate={onNavigate}/>);
    await user.click(screen.getByRole('button', { name: 'Philadelphia' }));
    expect(screen.getByRole('button', { name: 'Philadelphia' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/May–July 2019. Separate from the undergraduate study experiences/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Visit this chapter' }));
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('world');
  });

  it('updates the Naples shape and its parent callback with the selected parameter', () => {
    const onStructureChange = vi.fn();
    const { container } = render(<StoryPanel kind="reinvention" motionEnabled={false} onStructureChange={onStructureChange}/>);
    const before = container.querySelector('polyline')!.getAttribute('points');
    const slider = screen.getByRole('slider', { name: /Explore a mathematical structure/ });
    fireEvent.change(slider, { target: { value: '0.87' } });
    expect(slider).toHaveValue('0.87');
    expect(onStructureChange).toHaveBeenCalledExactlyOnceWith(0.87);
    expect(screen.getByRole('img', { name: /complexity 87 percent/ })).toBeInTheDocument();
    expect(container.querySelector('polyline')!.getAttribute('points')).not.toBe(before);
    expect(screen.getByText(/each adjustment selects a static pose/)).toBeInTheDocument();
  });

  it('provides an honest fallback for an unknown panel', () => {
    show('unknown');
    expect(screen.getByText(/This exploration is not available/)).toBeInTheDocument();
  });
});

describe('source retrieval interaction', () => {
  it('requires Retrieve answer, shows the exact selected source and clears stale answers on a new question', async () => {
    const { user, container } = await laboratory(/Source-grounded retrieval/);
    const question = screen.getByRole('combobox', { name: /Choose a question/ });
    expect(container.querySelector('.retrieval-result')).toBeNull();
    await user.selectOptions(question, 'review');
    expect(container.querySelector('.retrieval-result')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Retrieve answer' }));
    const result = within(element(container, '.retrieval-result'));
    expect(result.getByText(/PREPARED ANSWER · SOURCE AVAILABLE/)).toBeInTheDocument();
    expect(result.getByText(retrievalSources[1].text)).toBeInTheDocument();
    expect(result.getByText(/SYN-H02/)).toBeInTheDocument();
    await user.selectOptions(question, 'access');
    expect(container.querySelector('.retrieval-result')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Retrieve answer' }));
    expect(within(element(container, '.retrieval-result')).getByText(retrievalSources[2].text)).toBeInTheDocument();
  });

  it('returns no result source for a real-investigation question', async () => {
    const { user, container } = await laboratory(/Source-grounded retrieval/);
    await user.selectOptions(screen.getByRole('combobox', { name: /Choose a question/ }), 'unsupported');
    await user.click(screen.getByRole('button', { name: 'Retrieve answer' }));
    const result = element(container, '.retrieval-result');
    expect(within(result).getByText('NO SUPPORTING SOURCE')).toBeInTheDocument();
    expect(within(result).getByText(/No answer has been invented/)).toBeInTheDocument();
    expect(result.querySelector('.source-passage')).toBeNull();
    expect(result.querySelector('blockquote')).toBeNull();
  });
});

describe('data cleaning controls', () => {
  it('applies three explicit rules, shows 5→0 issues and three retained rows, and resets faithfully', async () => {
    const user = userEvent.setup();
    const { container } = show('public-service');
    expect(within(element(container, '.quality-summary')).getByText('5 → 5')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7);
    for (const name of [/Normalise collection names/, /Quarantine invalid counts/, /Remove duplicate identifiers/]) {
      await user.click(screen.getByRole('checkbox', { name }));
    }
    expect(screen.getByRole('status')).toHaveTextContent('Rules changed. Apply them');
    expect(within(element(container, '.quality-summary')).getByText('5 → 5')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply selected rules' }));
    expect(within(element(container, '.quality-summary')).getByText('5 → 0')).toBeInTheDocument();
    expect(element(container, '.quality-summary')).toHaveTextContent('3retained rows2quarantined1duplicates removed');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
    expect(within(screen.getByRole('table')).getAllByText('Passes these checks')).toHaveLength(3);
    await user.click(screen.getByText('Inspect the change log'));
    expect(screen.getByText(/DEMO-02: quarantined because the count is missing. No value was imputed/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reset dataset' }));
    expect(within(element(container, '.quality-summary')).getByText('5 → 5')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7);
    expect(screen.getAllByRole('checkbox').every(input => !(input as HTMLInputElement).checked)).toBe(true);
  });
});

describe('service engineering workflow', () => {
  it('advances three times, stops at human resolution and resets to receipt', async () => {
    const user = userEvent.setup();
    const { container } = show('engineering');
    expect(screen.getByRole('button', { name: 'Reset workflow' })).toBeDisabled();
    for (const title of ['Classify', 'Route', 'Human resolution']) {
      await user.click(screen.getByRole('button', { name: 'Run next step' }));
      expect(within(element(container, '.process-output')).getByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Workflow complete' })).toBeDisabled();
    expect(screen.getByText(/No account or preference has changed/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset workflow' }));
    expect(within(element(container, '.process-output')).getByRole('heading', { name: 'Receive' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset workflow' })).toBeDisabled();
  });
});

describe('briefing preparation and human review', () => {
  it('requires preparation and a review checkbox, then invalidates the draft when a source changes', async () => {
    const { user, container } = await laboratory(/Briefing & documents/);
    expect(container.querySelector('.briefing-draft')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Prepare briefing' }));
    expect(element(container, '.briefing-draft').querySelectorAll('.citation')).toHaveLength(3);
    expect(screen.getByText('DRAFT · HUMAN REVIEW REQUIRED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark draft reviewed' })).toBeDisabled();
    const review = screen.getByRole('checkbox', { name: /I have checked the selected sources/ });
    await user.click(review);
    await user.click(screen.getByRole('button', { name: 'Mark draft reviewed' }));
    expect(screen.getByText('REVIEWED IN THIS SIMULATION')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review recorded locally' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('No document has been sent, published or saved');
    await user.click(screen.getByRole('checkbox', { name: /SYN-B01 · Collection note/ }));
    expect(container.querySelector('.briefing-draft')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Prepare briefing' }));
    expect(element(container, '.briefing-draft').querySelectorAll('.citation')).toHaveLength(2);
    expect(within(element(container, '.briefing-draft')).queryByText('[SYN-B01]')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /I have checked the selected sources/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Mark draft reviewed' })).toBeDisabled();
  });

  it('clears review on checkbox reversal, clears the draft on format changes and refuses unsourced drafts', async () => {
    const { user, container } = await laboratory(/Briefing & documents/);
    await user.click(screen.getByRole('button', { name: 'Prepare briefing' }));
    const review = screen.getByRole('checkbox', { name: /I have checked the selected sources/ });
    await user.click(review);
    await user.click(screen.getByRole('button', { name: 'Mark draft reviewed' }));
    await user.click(review);
    expect(screen.getByText('DRAFT · HUMAN REVIEW REQUIRED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark draft reviewed' })).toBeDisabled();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Draft format' }), 'technical');
    expect(container.querySelector('.briefing-draft')).toBeNull();
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox);
    expect(screen.getByRole('button', { name: 'Prepare briefing' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('No unsourced draft will be prepared');
  });
});

describe('agentic human gate', () => {
  async function reachGate(user: ReturnType<typeof userEvent.setup>) {
    for (const name of ['Prepare request', 'Retrieve fictional sources', 'Create review draft']) {
      await user.click(screen.getByRole('button', { name }));
    }
    expect(screen.getByRole('heading', { name: 'Stopped for human review' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete simulation' })).not.toBeInTheDocument();
  }

  it('stops at human review, requires explicit approval and separately requires explicit completion', async () => {
    const { user } = await laboratory(/Agentic workflows/);
    await reachGate(user);
    expect(screen.getByRole('list', { name: 'Workflow history' }).children).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'I approve this fictional draft' }));
    expect(screen.getByRole('heading', { name: 'Human approval recorded' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Simulation complete' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Complete simulation' }));
    expect(screen.getByRole('heading', { name: 'Simulation complete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete simulation' })).not.toBeInTheDocument();
    expect(screen.getByText(/No message, document, approval or action was sent/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset simulation' }));
    expect(screen.getByRole('list', { name: 'Workflow history' }).children).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Reset simulation' })).toBeDisabled();
  });

  it('can return for revision without completion, then fully resets when switching demonstrations', async () => {
    const { user } = await laboratory(/Agentic workflows/);
    await reachGate(user);
    await user.click(screen.getByRole('button', { name: 'Return for revision' }));
    expect(screen.getByRole('heading', { name: 'Returned for revision' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete simulation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'I approve this fictional draft' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Source-grounded retrieval/ }));
    await user.click(screen.getByRole('button', { name: /Agentic workflows/ }));
    expect(screen.getByRole('heading', { name: 'Ready to prepare' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Workflow history' }).children).toHaveLength(1);
  });
});

describe('governance safeguards', () => {
  it('requires all three choices, clears enabled state on uncheck and resets all controls', async () => {
    const { user } = await laboratory(/Architecture & governance/);
    const checks = screen.getAllByRole('checkbox');
    expect(screen.getByRole('button', { name: 'Simulate deployment' })).toBeDisabled();
    for (const checkbox of checks.slice(0, 2)) await user.click(checkbox);
    expect(screen.getByRole('button', { name: 'Simulate deployment' })).toBeDisabled();
    await user.click(checks[2]);
    expect(screen.getByRole('button', { name: 'Simulate deployment' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Simulate deployment' }));
    expect(screen.getByText('SIMULATION ENABLED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simulation active' })).toBeDisabled();
    await user.click(checks[0]);
    expect(screen.queryByText('SIMULATION ENABLED')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simulate deployment' })).toBeDisabled();
    expect(screen.getByText('A named human review gate is missing.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset safeguards' }));
    expect(checks.every(checkbox => !(checkbox as HTMLInputElement).checked)).toBe(true);
    expect(screen.getByText('Source references are not preserved.')).toBeInTheDocument();
  });
});

describe('archive navigation and approved-material configuration', () => {
  it('wraps previous/next, responds to arrow keys from gallery controls and selects named entries', async () => {
    const user = userEvent.setup();
    show('origins');
    const previous = screen.getByRole('button', { name: 'Previous archive entry' });
    const next = screen.getByRole('button', { name: 'Next archive entry' });
    expect(screen.getByRole('heading', { name: 'Childhood memories' })).toBeInTheDocument();
    await user.click(previous);
    expect(screen.getByRole('heading', { name: 'Personal milestones' })).toBeInTheDocument();
    await user.click(next);
    expect(screen.getByRole('heading', { name: 'Childhood memories' })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'School experiences' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('heading', { name: 'Childhood memories' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Family influences/ }));
    expect(screen.getByRole('heading', { name: 'Family influences' })).toBeInTheDocument();
    expect(screen.getByText('Photograph not yet supplied')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a local synthetic fixture with descriptive alt text, caption and supplied story', () => {
    Object.assign(memorySlots[0], {
      src: 'images/test-fixture.webp', alt: 'Synthetic test fixture: an archival frame',
      caption: 'Test-only caption; not an owner photograph.', story: 'Test-only supplied narrative.',
    });
    show('origins');
    const image = screen.getByRole('img', { name: 'Synthetic test fixture: an archival frame' });
    expect(image).toHaveAttribute('src', '/images/test-fixture.webp');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText('Test-only caption; not an owner photograph.')).toBeInTheDocument();
    expect(screen.getByText('Test-only supplied narrative.')).toBeInTheDocument();
    expect(screen.queryByText(memorySlots[0].placeholder)).not.toBeInTheDocument();
    fireEvent.error(image);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Photograph unavailable')).toBeInTheDocument();
    expect(screen.getByText('Test-only supplied narrative.')).toBeInTheDocument();
  });

  it('withholds configured photographs until descriptive alternative text is present', () => {
    Object.assign(memorySlots[0], { src: 'images/test-fixture.webp', alt: '' });
    show('origins');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(/withheld until descriptive alternative text is supplied/)).toBeInTheDocument();
  });
});

describe('analytical inspection', () => {
  it('filters visible document totals and exposes the selected graph node limitation', async () => {
    const { user, container } = await laboratory(/Analytics & relationships/);
    expect(element(container, '.chart-summary')).toHaveTextContent('8fictional documents');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter document review status' }), 'Pending');
    expect(element(container, '.chart-summary')).toHaveTextContent('3pending fictional documents');
    await user.click(screen.getByRole('button', { name: 'Team Cedar' }));
    expect(element(container, '.graph-detail')).toHaveTextContent('not ownership, responsibility or an allegation');
    expect(screen.getByRole('button', { name: 'Team Cedar' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('reverses chronology order while preserving the selected exact source and limitation', async () => {
    const { user, container } = await laboratory(/Forensic chronology/);
    await user.click(screen.getByRole('button', { name: /A review note was attached/ }));
    expect(element(container, '.forensic-detail')).toHaveTextContent('not evidence that confirmation or circulation occurred');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Chronology order' }), 'newest');
    const buttons = within(element(container, '.forensic-timeline')).getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Archive index was updated');
    expect(buttons.at(-1)).toHaveTextContent('Draft entered the archive');
    expect(element(container, '.forensic-detail')).toHaveTextContent('SELECTED RECORD · SYN-NOTE-03');
  });
});
