import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { siDiscord, siPatreon, siSteam } from 'simple-icons'

type Group = { title: string; features: string[] }
type Milestone = { number: string; title: string; summary: string; groups: Group[] }

const milestones: Milestone[] = [
  { number:'01', title:'Foundation', summary:'Explore, fight, gear up, and grow through quests.', groups:[
    {title:'World',features:['New biome & enemy type','Central city & quests']},
    {title:'Character',features:['Character creator 2.0','Level-up attributes','Inventory & character UI','Armor & item stats']},
    {title:'Combat',features:['Consumables & preparation','Combat feel & feedback']},
  ]},
  { number:'02', title:'Fellowship', summary:'Find your people and face greater challenges together.', groups:[
    {title:'Together',features:['Party system','Basic guilds','Emotes']},
    {title:'Challenges',features:['Roaming bosses','Dungeons']},
  ]},
  { number:'03', title:'Craft & Trade', summary:'Gather, craft, and trade in a player-driven economy.', groups:[
    {title:'Professions',features:['Gathering','Crafting']},
    {title:'Markets',features:['Regional auctions with tax','Direct player trading']},
    {title:'Economy',features:['Player-led supply & demand']},
  ]},
  { number:'04', title:'Mastery', summary:'Define your role and shape your long-term build.', groups:[
    {title:'Classes',features:['More playable classes']},
    {title:'Builds',features:['More build choices']},
    {title:'Growth',features:['Deeper progression']},
  ]},
]

const wishes = [
  { label:'Your support', className:'wish-support' },
  { label:'Consoles', className:'wish-consoles' },
  { label:'Housing', className:'wish-housing' },
  { label:'Races', className:'wish-races' },
  { label:'Mounts', className:'wish-mounts' },
  { label:'Mobile', className:'wish-mobile' },
  { label:'Offline mode', className:'wish-offline' },
  { label:'Ironman / hardcore', className:'wish-hardcore' },
  { label:'Pets', className:'wish-pets' },
  { label:'Private servers', className:'wish-private' },
  { label:'Advanced guilds', className:'wish-guilds' },
  { label:'Customizable UI', className:'wish-ui' },
  { label:'World events', className:'wish-events' },
  { label:'Raids', className:'wish-raids' },
  { label:'PvP', className:'wish-pvp' },
]

const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z]+/g, '-')

// Diameters follow the supplied priority reference, independently of the theme.
const wishSizes = [190, 144, 128, 94, 140, 100, 88, 118, 82, 108, 132, 98, 116, 84, 132]
const wishLabels = [
  ['Your', 'support'], ['Consoles'], ['Housing'], ['Races'], ['Mounts'], ['Mobile'],
  ['Offline', 'mode'], ['Ironman /', 'hardcore'], ['Pets'], ['Private', 'servers'],
  ['Advanced', 'guilds'], ['Customizable', 'UI'], ['World', 'events'], ['Raids'], ['PvP'],
]
// Evenly spaced rings keep a regular circular silhouette.
const packedWishes = (() => {
  const order = [1, 4, 14, 10, 2, 7, 3, 9, 12, 13, 11, 5, 6, 8]
  const side = 760
  const nodes = wishes.map((_, index) => {
    if (index === 0) return { x: side / 2, y: side / 2 }
    const position = order.indexOf(index)
    const inner = position < 6
    const angle = (inner ? position / 6 : (position - 6) / 8) * Math.PI * 2 - Math.PI / 2
    const radius = inner ? 174 : 365 - wishSizes[index] / 2
    return { x: side / 2 + Math.cos(angle) * radius, y: side / 2 + Math.sin(angle) * radius }
  })
  // Reserve room for both bubbles' movement and their largest selected size.
  for (let pass = 0; pass < 120; pass++) {
    let overlap = 0
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x
      const dy = nodes[j].y - nodes[i].y
      const distance = Math.hypot(dx, dy)
      const correction = (wishSizes[i] + wishSizes[j]) * .54 + 76 - distance
      if (correction <= 0) continue
      overlap = Math.max(overlap, correction)
      const share = i === 0 ? 0 : .5
      nodes[i].x -= dx / distance * correction * share
      nodes[i].y -= dy / distance * correction * share
      nodes[j].x += dx / distance * correction * (1 - share)
      nodes[j].y += dy / distance * correction * (1 - share)
    }
    if (overlap < .01) break
  }
  const extent = Math.max(...nodes.map((node, i) => Math.hypot(node.x - side / 2, node.y - side / 2) + wishSizes[i] * .54)) + 40
  return { side: extent * 2, nodes: nodes.map(node => ({ x: node.x - side / 2 + extent, y: node.y - side / 2 + extent })) }
})()

function WishGraph() {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(reduced.matches)
    update()
    reduced.addEventListener('change', update)
    return () => reduced.removeEventListener('change', update)
  }, [])
  const width = packedWishes.side
  const height = packedWishes.side
  const nodes = wishes.map((wish, index) => {
    const { x, y } = packedWishes.nodes[index]
    const dx = pointer ? x - pointer.x : 0
    const dy = pointer ? y - pointer.y : 0
    const distance = Math.hypot(dx, dy)
    const attraction = pointer && !reducedMotion ? Math.max(0, 1 - distance / 180) * 15 : 0
    const source = packedWishes.nodes[selected]
    const fieldX = x - source.x
    const fieldY = y - source.y
    const fieldDistance = Math.hypot(fieldX, fieldY)
    const gap = fieldDistance - (wishSizes[selected] * 1.08 + wishSizes[index]) / 2
    const repulsion = index !== selected && !reducedMotion ? Math.max(0, 1 - Math.max(0, gap) / 110) * 24 : 0
    const offsetX = -dx / (distance || 1) * attraction + fieldX / (fieldDistance || 1) * repulsion
    const offsetY = -dy / (distance || 1) * attraction + fieldY / (fieldDistance || 1) * repulsion
    const limit = Math.min(1, 18 / (Math.hypot(offsetX, offsetY) || 1))
    return { ...wish,
      x: x + offsetX * limit,
      y: y + offsetY * limit,
      size: wishSizes[index],
    }
  })
  const movement = reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 160, damping: 32 }
  return <div className="wish-graph-wrap"><svg className="wish-graph" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Future ambitions, sized by importance"
    onPointerMove={event => {
      if (event.pointerType !== 'mouse' || reducedMotion) return
      const svg = event.currentTarget
      const matrix = svg.getScreenCTM()
      if (!matrix) return
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      setPointer({ x: point.x, y: point.y })
    }} onPointerLeave={() => { setPointer(null); setHovered(null) }}>
    <defs>
      <radialGradient id="support-gold" cx="38%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#f0dc98" />
        <stop offset="55%" stopColor="#d1af61" />
        <stop offset="100%" stopColor="#9e773b" />
      </radialGradient>
    </defs>
    <g className="wish-graph-links" aria-hidden="true">
      {nodes.slice(1).map((node, index) => <motion.line key={node.label} initial={false} animate={{ x1: nodes[0].x, y1: nodes[0].y, x2: node.x, y2: node.y }} transition={movement} className={hovered === 0 || hovered === index + 1 ? 'is-lit' : ''} />)}
    </g>
    {nodes.map((node, index) => {
      const lines = wishLabels[index]
      const longestLine = Math.max(...lines.map(line => line.length))
      const fontSize = Math.min(node.size * .145, node.size * .7 / (longestLine * .62))
      return <motion.a key={node.label} href={index === 0 ? 'https://www.patreon.com/cw/LeoGameDev' : undefined} target={index === 0 ? '_blank' : undefined} rel={index === 0 ? 'noopener noreferrer' : undefined} className={`wish-graph-node${index === 0 ? ' wish-support' : ''}${hovered === index ? ' is-lit' : ''}`} initial={false} animate={{ x: node.x, y: node.y, scale: selected === index ? 1.08 : 1 }} style={{ transformOrigin: '0px 0px' }} transition={movement} tabIndex={0} role={index === 0 ? 'link' : 'button'} aria-label={index === 0 ? 'Your support — visit Patreon (opens in a new tab)' : node.label} aria-pressed={index === 0 ? undefined : selected === index}
        onPointerEnter={() => setHovered(index)} onFocus={() => { setHovered(index); setSelected(index) }} onBlur={() => setHovered(null)}
        onClick={() => setSelected(index)} onKeyDown={event => { if (index !== 0 && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelected(index) } }}>
        <circle r={node.size / 2} />
        <text textAnchor="middle" dominantBaseline="central" fontSize={fontSize} aria-hidden="true">
          {lines.map((line, i) => <tspan key={i} x="0" y={(i - (lines.length - 1) / 2) * fontSize * 1.2}>{line}</tspan>)}
        </text>
      </motion.a>
    })}
  </svg><p className="wish-graph-caption" aria-live="polite">{wishes[hovered ?? selected].label}</p></div>
}

const SteamMark = () => <svg className="steam-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siSteam.path} /></svg>
const PatreonMark = () => <svg className="patreon-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siPatreon.path} /></svg>
const DiscordMark = () => <svg className="discord-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siDiscord.path} /></svg>

function App() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const target = window.location.hash.slice(1)
    if (!target) return
    requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView())
  }, [])

  useEffect(() => {
    const cards = milestones.map(milestone => document.getElementById(slugOf(milestone.title)))
    let frame = 0
    const update = () => {
      frame = 0
      const readingLine = window.innerHeight * .35
      let current = 0
      cards.forEach((card, index) => { if (card && card.getBoundingClientRect().top <= readingLine) current = index })
      setActive(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [])

  return <main id="top">
    <a className="skip-link" href="#roadmap">Skip to roadmap</a>

    <header className="hero">
      <picture className="hero-mobile-art" aria-hidden="true"><img src="/assets/hero-mobile.webp" alt="" fetchPriority="high" /></picture>
      <video className="hero-film" autoPlay muted loop playsInline preload="metadata" poster="/assets/hero.webp" aria-hidden="true"><source src="/assets/world.webm" type="video/webm" /></video>
      <div className="hero-wash" />
      <nav className="masthead">
        <img src="/assets/logo.png" alt="Ichor Online" />
        <div className="platform-links">
          <a className="nav-steam" href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer"><SteamMark /><span>Steam</span></a>
          <a className="nav-patreon" href="https://www.patreon.com/c/LeoGameDev" target="_blank" rel="noreferrer"><PatreonMark /><span>Patreon</span></a>
          <a className="nav-discord" href="https://discord.gg/5dYE9NWxdb" target="_blank" rel="noreferrer"><DiscordMark /><span>Discord</span></a>
        </div>
      </nav>
      <div className="hero-copy">
        <div className="hero-logo"><img src="/assets/ichor_title.png" alt="Ichor Online" width="1042" height="528" fetchPriority="high" /></div>
        <h1>Experience Ichor Online take shape.</h1>
        <p>Follow the game from its first complete loop to a larger, player-driven world. Plans can change after playtests.</p>
        <div className="hero-actions">
          <a href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer"><SteamMark />Wishlist on Steam</a>
          <a href="https://www.patreon.com/c/LeoGameDev" target="_blank" rel="noreferrer"><PatreonMark />Support on Patreon</a>
        </div>
      </div>
    </header>

    <section className="roadmap-index" id="roadmap" aria-labelledby="roadmap-heading">
      <header>
        <h2 id="roadmap-heading">The road ahead</h2>
      </header>
      <div className="ornament-divider" aria-hidden="true"><img src="/assets/fantasy-divider.svg" alt="" /></div>
    </section>

    <section className="chapter-stack" aria-label="Milestone details">
      <div className="roadmap-steps">
        {milestones.map((milestone,index)=><div className={`roadmap-step${active===index?' active':''}`} key={milestone.title}>
          <a className="roadmap-step-marker" href={`#${slugOf(milestone.title)}`} onClick={()=>setActive(index)} aria-current={active === index ? 'step' : undefined} aria-label={`View ${milestone.title} milestone`}>
            <span className="rail-node"><span>{milestone.number}</span></span>
            <span className="rail-copy"><span>{milestone.title}</span></span>
          </a>
          <article className={`chapter-card chapter-${index}`} id={slugOf(milestone.title)}>
            <div className="chapter-title"><h2>{milestone.title}</h2><img className="ornament-half" src="/assets/fantasy-half-divider.svg" alt="" aria-hidden="true" /><p>{milestone.summary}</p></div>
            <div className="chapter-features">
              {milestone.groups.map(group=><section key={group.title}><h3>{group.title}</h3><ul>{group.features.map(feature=><li key={feature}>{feature}</li>)}</ul></section>)}
            </div>
          </article>
        </div>)}
      </div>
    </section>

    <section className="wishes">
      <div className="wishes-copy">
        <span>Beyond the road</span>
        <h2>If the gods of Ichor<br/>grant us more wishes</h2>
        <p>Some ambitions need more time, more players, or both.</p>
      </div>
      <WishGraph />
    </section>

    <section className="action">
      <div className="ornament-divider action-divider" aria-hidden="true"><img src="/assets/fantasy-divider.svg" alt="" /></div>
      <h2>Follow the road<br/>as it changes.</h2>
      <div className="action-links"><a className="primary" href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer"><SteamMark />Wishlist on Steam</a><a href="https://www.patreon.com/c/LeoGameDev" target="_blank" rel="noreferrer"><PatreonMark />Support on Patreon</a><a href="https://discord.gg/5dYE9NWxdb" target="_blank" rel="noreferrer"><DiscordMark />Join Discord</a></div>
    </section>

    <footer><span>Qilvo Games</span><p>Milestones show priorities, not release dates. Features may move when testing reveals a better path.</p></footer>
  </main>
}

export default App
