import type { ReactNode } from 'react'
import type { Metric } from './three/scenes/CompareScene'

export type SceneKey = 'title' | 'shortcut' | 'panama' | 'suez' | 'grand' | 'compare' | 'jobs' | 'others' | 'finale'

export type SlideCtx = {
  metric: Metric
  setMetric: (m: Metric) => void
  name: string
  setName: (n: string) => void
}

export type SlideDef = {
  nav: string
  scene: SceneKey
  caption: string
  render: (ctx: SlideCtx) => ReactNode
}

/** Renders **highlighted** fragments in the accent colour. */
function hl(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-bold text-[#ff8a4a]">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

let order = 0
/** Restart the entrance stagger for a freshly rendered slide. */
export const resetRise = () => {
  order = 0
}
const rise = () => ({ animationDelay: `${0.08 + order++ * 0.07}s` })

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="rise mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#ff8a4a]" style={rise()}>
      <span className="h-px w-8 bg-[#ff6a1a]" />
      {children}
    </p>
  )
}

function Title({ children, size = 'md' }: { children: ReactNode; size?: 'md' | 'lg' | 'xl' }) {
  return (
    <h1
      className={`rise font-display font-semibold leading-[1.05] tracking-tight text-white ${
        size === 'xl'
          ? 'text-5xl sm:text-6xl xl:text-7xl'
          : size === 'lg'
            ? 'text-4xl sm:text-5xl'
            : 'text-3xl sm:text-4xl xl:text-[2.75rem]'
      }`}
      style={rise()}
    >
      {children}
    </h1>
  )
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="rise mt-5 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-base" style={rise()}>
      {children}
    </p>
  )
}

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-7 grid max-w-md grid-cols-2 gap-2.5">
      {items.map(([label, value]) => (
        <div key={label} className="rise rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur" style={rise()}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</dt>
          <dd className="mt-1 font-display text-xl font-semibold text-white">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rise mt-5 max-w-md border-l-2 border-[#ff6a1a] pl-4 text-sm leading-relaxed text-white/65" style={rise()}>
      {children}
    </p>
  )
}

const COMPARISONS: Record<Metric, string[]> = {
  length: [
    'The Grand Canal is **the longest** canal of the three.',
    'The Suez Canal is **longer than** the Panama Canal, but it is **much shorter than** the Grand Canal.',
    'The Panama Canal is **the shortest**, but it is **more complicated than** the Suez Canal — it has locks.',
    'The Grand Canal is **more than 20 times longer than** the Panama Canal.',
  ],
  age: [
    'The Grand Canal is **the oldest** — it is over 2,500 years old.',
    'The Suez Canal is **older than** the Panama Canal.',
    'The Panama Canal is **the newest** of the three.',
    'The Suez Canal is **not as old as** the Grand Canal.',
  ],
}

const JOBS: [string, string[]][] = [
  ['Planning', ['engineers', 'architects', 'surveyors', 'geologists']],
  ['Building', ['construction workers', 'machine operators', 'crane operators', 'truck drivers', 'welders', 'divers']],
  ['Support', ['doctors', 'cooks', 'electricians', 'managers']],
  ['After it opens', ['lock operators', 'ship pilots', 'tugboat crews', 'maintenance workers']],
]

const OTHERS: [string, string, string, string][] = [
  ['A', 'Kiel Canal', 'Germany · 98 km · 1895', 'Links the North Sea and the Baltic Sea.'],
  ['B', 'Corinth Canal', 'Greece · 6.4 km · 1893', 'One of the narrowest: only about 21 m wide.'],
  ['C', 'Volga–Don Canal', 'Russia · 101 km · 1952', 'Links the Volga and the Don rivers.'],
  ['D', 'White Sea–Baltic Canal', 'Russia · 227 km · 1933', 'Links the White Sea and the Baltic Sea.'],
  ['E', 'Erie Canal', 'USA · 584 km · 1825', 'Links New York with the Great Lakes.'],
]

export const SLIDES: SlideDef[] = [
  {
    nav: 'Title',
    scene: 'title',
    caption: 'Drag the globe to rotate it',
    render: ({ name, setName }) => (
      <>
        <Kicker>English · Unit 3.2 · Lead-in</Kicker>
        <Title size="xl">
          Large-scale
          <br />
          projects
        </Title>
        <p className="rise mt-4 font-display text-lg text-[#ff8a4a] sm:text-xl" style={rise()}>
          The world's great shipping canals
        </p>
        <Lead>
          Why do countries spend billions on canals? Let's look at three famous examples and{' '}
          <strong className="text-white">compare</strong> them.
        </Lead>
        <ol className="mt-6 flex flex-wrap gap-2">
          {['The Panama Canal', 'The Suez Canal', 'The Grand Canal'].map((c, i) => (
            <li
              key={c}
              className="rise flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] py-1 pl-1 pr-3 text-[13px] font-semibold text-white"
              style={rise()}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ff6a1a] text-[11px] font-bold">{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
        <label className="rise mt-8 block max-w-xs" style={rise()}>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Presented by</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name"
            className="mt-1 w-full border-b border-white/20 bg-transparent py-1.5 font-display text-lg text-white outline-none placeholder:text-white/25 focus:border-[#ff6a1a]"
          />
        </label>
      </>
    ),
  },
  {
    nav: 'Why canals?',
    scene: 'shortcut',
    caption: 'The orange ship takes the canal — the other sails around the continent',
    render: () => (
      <>
        <Kicker>Question 1</Kicker>
        <Title>Why do governments build shipping canals?</Title>
        <Lead>A canal is a shortcut. Instead of sailing around a whole continent, ships go straight through it.</Lead>
        <ul className="mt-6 max-w-md space-y-3">
          {[
            ['Shorter routes', 'Ships save time and fuel.'],
            ['Cheaper trade', 'Goods travel faster and transport costs less.'],
            ['Money for the country', 'Every ship pays a fee to use the canal.'],
            ['Growth', 'New ports, cities, businesses and jobs.'],
          ].map(([t, d], i) => (
            <li key={t} className="rise flex gap-4" style={rise()}>
              <span className="font-display text-sm font-semibold text-[#ff6a1a]">0{i + 1}</span>
              <span className="text-[15px] text-white/70">
                <strong className="font-semibold text-white">{t}.</strong> {d}
              </span>
            </li>
          ))}
        </ul>
        <div className="rise mt-7 inline-flex items-baseline gap-3 rounded-2xl bg-[#ff6a1a] px-5 py-3 text-white" style={rise()}>
          <span className="font-display text-2xl font-semibold">≈13,000 km</span>
          <span className="text-xs font-semibold leading-tight text-white/85">
            shorter: New York → San Francisco
            <br />
            through the Panama Canal
          </span>
        </div>
      </>
    ),
  },
  {
    nav: 'Panama',
    scene: 'panama',
    caption: 'Animation: a ship rises through three lock chambers',
    render: () => (
      <>
        <Kicker>Photo 1 · Central America</Kicker>
        <Title>The Panama Canal</Title>
        <Lead>
          It links the Atlantic and the Pacific Oceans. Ships go up and down through giant water “steps” called{' '}
          <strong className="text-white">locks</strong>.
        </Lead>
        <Facts
          items={[
            ['Opened', '1914'],
            ['Length', '82 km'],
            ['Locks lift ships', '26 m'],
            ['Ships a year', '≈14,000'],
          ]}
        />
        <Note>How a lock works: the gates close, water fills the chamber and the ship rises to the next level.</Note>
      </>
    ),
  },
  {
    nav: 'Suez',
    scene: 'suez',
    caption: 'Animation: a convoy of ships crossing the desert',
    render: () => (
      <>
        <Kicker>Photo 2 · Egypt</Kicker>
        <Title>The Suez Canal</Title>
        <Lead>It links the Mediterranean Sea and the Red Sea — the shortest sea route between Europe and Asia.</Lead>
        <Facts
          items={[
            ['Opened', '1869'],
            ['Length', '193 km'],
            ['Locks', 'None'],
            ['World trade', '≈12%'],
          ]}
        />
        <Note>Before the canal, ships from Europe had to sail all the way around Africa.</Note>
      </>
    ),
  },
  {
    nav: 'Grand Canal',
    scene: 'grand',
    caption: 'Animation: a water town on the Grand Canal',
    render: () => (
      <>
        <Kicker>Photo 3 · China</Kicker>
        <Title>The Grand Canal</Title>
        <Lead>
          The oldest and the longest artificial waterway in the world. It links Beijing in the north with Hangzhou in the
          south.
        </Lead>
        <Facts
          items={[
            ['Started', '5th c. BC'],
            ['Length', '≈1,776 km'],
            ['Rivers linked', '5'],
            ['UNESCO site', '2014'],
          ]}
        />
        <Note>It connects five big rivers, including the Yellow River and the Yangtze.</Note>
      </>
    ),
  },
  {
    nav: 'Compare',
    scene: 'compare',
    caption: '3D chart — drag to look around',
    render: ({ metric, setMetric }) => (
      <>
        <Kicker>Lesson outcome · Making comparisons</Kicker>
        <Title>Let's compare the canals</Title>
        <div className="rise mt-6 inline-flex rounded-full border border-white/12 bg-white/[0.05] p-1" style={rise()}>
          {(['length', 'age'] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`rounded-full px-5 py-2 text-[13px] font-bold capitalize transition-colors ${
                metric === m ? 'bg-[#ff6a1a] text-white shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {m === 'length' ? 'Length (km)' : 'Age (years)'}
            </button>
          ))}
        </div>
        <ul key={metric} className="mt-6 max-w-md space-y-3">
          {COMPARISONS[metric].map((s, i) => (
            <li key={s} className="rise flex gap-3 text-[15px] leading-relaxed text-white/80" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6a1a]" />
              <span>{hl(s)}</span>
            </li>
          ))}
        </ul>
        <div className="rise mt-7 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[13px] text-white/60" style={rise()}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Grammar</p>
          <p>
            short → <span className="text-white">shorter</span> → <span className="text-white">the shortest</span>
          </p>
          <p>
            old → <span className="text-white">older</span> → <span className="text-white">the oldest</span>
          </p>
          <p>
            complicated → <span className="text-white">more complicated</span> →{' '}
            <span className="text-white">the most complicated</span>
          </p>
        </div>
      </>
    ),
  },
  {
    nav: 'Jobs',
    scene: 'jobs',
    caption: 'Animation: a canal construction site',
    render: () => (
      <>
        <Kicker>Question 2</Kicker>
        <Title>Who works on a big canal-building project?</Title>
        <Lead>
          Tens of thousands of people. Building the Panama Canal took 10 years (1904–1914) — and so did the Suez Canal
          (1859–1869).
        </Lead>
        <div className="mt-6 max-w-md space-y-4">
          {JOBS.map(([group, list]) => (
            <div key={group} className="rise" style={rise()}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((j) => (
                  <span key={j} className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[13px] text-white/85">
                    {j}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    nav: 'Other canals',
    scene: 'others',
    caption: 'Drag the globe to explore',
    render: () => (
      <>
        <Kicker>Question 3</Kicker>
        <Title>Can you name any other shipping canals?</Title>
        <ul className="mt-7 max-w-md divide-y divide-white/10 border-y border-white/10">
          {OTHERS.map(([tag, name, meta, desc]) => (
            <li key={name} className="rise flex gap-4 py-3" style={rise()}>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ff6a1a] text-[11px] font-bold text-white">
                {tag}
              </span>
              <div>
                <p className="font-semibold text-white">
                  {name} <span className="ml-1 text-xs font-medium text-white/45">{meta}</span>
                </p>
                <p className="text-sm text-white/60">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    nav: 'Thank you',
    scene: 'finale',
    caption: 'Thank you!',
    render: ({ name }) => (
      <>
        <Kicker>Conclusion</Kicker>
        <Title size="lg">Thank you for your attention!</Title>
        <Lead>Canals make the world smaller: shorter routes, cheaper trade and thousands of jobs.</Lead>
        <ul className="mt-6 max-w-md space-y-2 text-[15px] text-white/75">
          {[
            'The Grand Canal — **the oldest** and **the longest**.',
            'The Suez Canal — no locks, **the shortest route** from Europe to Asia.',
            'The Panama Canal — **the shortest**, but with locks.',
          ].map((s) => (
            <li key={s} className="rise flex gap-3" style={rise()}>
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6a1a]" />
              <span>{hl(s)}</span>
            </li>
          ))}
        </ul>
        <p className="rise mt-8 font-display text-2xl text-[#ff8a4a]" style={rise()}>
          Any questions?
        </p>
        {name && (
          <p className="rise mt-2 text-sm text-white/50" style={rise()}>
            {name}
          </p>
        )}
      </>
    ),
  },
]
