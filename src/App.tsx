import { useEffect, useRef, useState } from 'react'
import { siDiscord, siPatreon, siSteam } from 'simple-icons'

type Group = { title: string; features: string[] }
type Milestone = { number: string; title: string; summary: string; image: string; mobileImage: string; imageAlt: string; groups: Group[] }

const milestones: Milestone[] = [
  { number:'01', title:'Foundation', summary:'Complete the core game loop: explore, fight, grow, equip, prepare, and follow quests.', image:'/assets/milestone-foundation.webp', mobileImage:'/assets/milestone-foundation-mobile.webp', imageAlt:'An adventurer exploring a sunlit forest settlement in Ichor Online', groups:[
    {title:'World',features:['New biome and enemy type','New central city','Quests']},
    {title:'Character',features:['Expanded character creator','Levels and assignable attributes','Inventory and character screen','Armor and item stats']},
    {title:'Combat',features:['Consumables and preparation','Combat feel and feedback']},
  ]},
  { number:'02', title:'Fellowship', summary:'Give players clear ways to meet, organize, and overcome larger challenges together.', image:'/assets/milestone-fellowship.webp', mobileImage:'/assets/milestone-fellowship-mobile.webp', imageAlt:'An adventurer fighting a group of enemies in a flower meadow', groups:[
    {title:'Together',features:['Party system','Basic guilds']},
    {title:'Challenges',features:['Roaming bosses','Dungeons']},
  ]},
  { number:'03', title:'Craft & Trade', summary:'Connect gathering, crafting, and regional trade in a player-driven economy.', image:'/assets/milestone-craft.webp', mobileImage:'/assets/milestone-craft-mobile.webp', imageAlt:'A woodland market area with crates and gathered goods', groups:[
    {title:'Professions',features:['Gathering','Crafting']},
    {title:'Markets',features:['Regional taxed auction houses','Player-to-player trading']},
    {title:'Economy',features:['Player-driven supply and demand']},
  ]},
  { number:'04', title:'Mastery', summary:'Let players define their role and develop a distinct long-term build.', image:'/assets/milestone-mastery.webp', mobileImage:'/assets/milestone-mastery-mobile.webp', imageAlt:'An adventurer testing a combat build against a training target', groups:[
    {title:'Classes',features:['More playable classes']},
    {title:'Builds',features:['Deeper build variety']},
    {title:'Growth',features:['Expanded progression']},
  ]},
]

const wishes = [
  { label:'PvP', className:'wish-pvp' },
  { label:'Consoles', className:'wish-consoles' },
  { label:'Housing', className:'wish-housing' },
  { label:'Mounts', className:'wish-mounts' },
  { label:'Mobile', className:'wish-mobile' },
  { label:'Ironman / hardcore', className:'wish-hardcore' },
  { label:'Pets', className:'wish-pets' },
  { label:'Advanced guilds', className:'wish-guilds' },
  { label:'World events', className:'wish-events' },
  { label:'Raids', className:'wish-raids' },
]

const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z]+/g, '-')

const SteamMark = () => <svg className="steam-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siSteam.path} /></svg>
const PatreonMark = () => <svg className="patreon-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siPatreon.path} /></svg>
const DiscordMark = () => <svg className="discord-mark" viewBox="0 0 24 24" aria-hidden="true"><path d={siDiscord.path} /></svg>

function App() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const target = window.location.hash.slice(1)
    if (!target) return
    requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView())
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 681px)').matches
    if (reduce) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return
      const gsap = gsapModule.default
      const { ScrollTrigger } = triggerModule
      gsap.registerPlugin(ScrollTrigger)
      const context = gsap.context(() => {
        if (desktop) {
          gsap.utils.toArray<HTMLElement>('.chapter-card').forEach((card, index) => {
            gsap.fromTo(card, { scale: .965 }, {
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 28%', scrub: .8 },
            })
            if (index < milestones.length - 1) {
              gsap.to(card, {
                scale: .92,
                opacity: .34,
                ease: 'none',
                scrollTrigger: { trigger: card, start: 'bottom 74%', end: 'bottom 18%', scrub: .8 },
              })
            }
          })

          gsap.utils.toArray<HTMLElement>('.chapter-image').forEach((frame) => {
            const image = frame.querySelector('img')
            gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 } })
              .fromTo(image, { scale: .82, opacity: .28 }, { scale: 1, opacity: 1, duration: .5, ease: 'none' })
              .to(image, { scale: 1.06, opacity: .24, duration: .5, ease: 'none' })
          })
        } else {
          gsap.utils.toArray<HTMLElement>('.chapter-image').forEach((frame) => {
            const image = frame.querySelector('img')
            gsap.fromTo(image, {
              scale: .96,
              opacity: .38,
            }, {
              scale: 1,
              opacity: 1,
              duration: .8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: frame,
                start: 'top 94%',
                toggleActions: 'play none none none',
                once: true,
              },
            })
          })
        }
      }, root)
      cleanup = () => context.revert()
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  const move = (direction: number) => setActive(current => (current + direction + milestones.length) % milestones.length)

  return <main ref={root} id="top">
    <a className="skip-link" href="#roadmap">Skip to roadmap</a>

    <header className="hero">
      <picture className="hero-mobile-art" aria-hidden="true"><img src="/assets/hero-mobile.webp" alt="" fetchPriority="high" /></picture>
      <video className="hero-film" autoPlay muted loop playsInline preload="metadata" poster="/assets/hero.webp"><source src="/assets/world.webm" type="video/webm" media="(min-width: 681px)" /></video>
      <div className="hero-wash" />
      <nav className="masthead">
        <img src="/assets/logo.png" alt="Ichor Online" />
        <a href="#roadmap">Pre-release roadmap</a>
        <div className="platform-links">
          <a className="nav-steam" href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer"><SteamMark /><span>Steam</span></a>
          <a className="nav-patreon" href="https://www.patreon.com/c/LeoGameDev" target="_blank" rel="noreferrer"><PatreonMark /><span>Patreon</span></a>
          <a className="nav-discord" href="https://discord.gg/5dYE9NWxdb" target="_blank" rel="noreferrer"><DiscordMark /><span>Discord</span></a>
        </div>
      </nav>
      <div className="hero-copy">
        <h1>See Ichor Online take shape.</h1>
        <p>Follow the game from its first complete loop to a larger, player-driven world. Plans can change after playtests.</p>
        <a className="hero-steam" href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer">
          <span>Wishlist Ichor Online</span><strong><SteamMark />On Steam</strong><i aria-hidden="true">↗</i>
        </a>
      </div>
      <a className="scroll-cue" href="#roadmap">Explore the road <i /></a>
    </header>

    <section className="roadmap-index" id="roadmap" aria-labelledby="roadmap-heading">
      <header>
        <h2 id="roadmap-heading">The road ahead</h2>
        <div className="index-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous milestone">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Next milestone">→</button>
        </div>
      </header>
      <div className={`milestone-accordion active-${active}`}>
        {milestones.map((milestone,index)=><article className={`accordion-panel panel-${index}${active===index?' active':''}`} key={milestone.title} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)}>
          <button type="button" onClick={()=>setActive(index)} aria-expanded={active===index}>
            <span>{milestone.number}</span>
            <h3>{milestone.title}</h3>
            <p>{milestone.summary}</p>
          </button>
          <a href={`#${slugOf(milestone.title)}`}>View milestone <span>↘</span></a>
        </article>)}
      </div>
    </section>

    <section className="chapter-stack" aria-label="Milestone details">
      {milestones.map((milestone,index)=><article className={`chapter-card chapter-${index}`} id={slugOf(milestone.title)} key={milestone.title}>
        <div className="chapter-image"><img src={milestone.image} srcSet={`${milestone.mobileImage} 720w, ${milestone.image} 1600w`} sizes="(max-width: 680px) 100vw, 46vw" alt={milestone.imageAlt} loading="lazy" decoding="async" /></div>
        <div className="chapter-title"><span>{milestone.number}</span><h2>{milestone.title}</h2><p>{milestone.summary}</p></div>
        <div className="chapter-features">
          {milestone.groups.map(group=><section key={group.title}><h3>{group.title}</h3><ul>{group.features.map(feature=><li key={feature}>{feature}</li>)}</ul></section>)}
        </div>
      </article>)}
    </section>

    <section className="wishes">
      <div className="wishes-copy">
        <span>Beyond the road</span>
        <h2>If the gods of Ichor<br/>grant us more wishes</h2>
        <p>Some ambitions need more time, more players, or both.</p>
      </div>
      <div className="wish-orbit" aria-label="Future ambitions">
        {wishes.slice(0, 2).map(wish=><span className={`wish-bubble ${wish.className}`} key={wish.label}>{wish.label}</span>)}
        <span className="wish-image wish-image-meadow" aria-hidden="true"><img src="/assets/wish-meadow-thumb.webp" alt="" loading="lazy" decoding="async" /></span>
        {wishes.slice(2, 6).map(wish=><span className={`wish-bubble ${wish.className}`} key={wish.label}>{wish.label}</span>)}
        <span className="wish-image wish-image-world" aria-hidden="true"><img src="/assets/wish-world-thumb.webp" alt="" loading="lazy" decoding="async" /></span>
        {wishes.slice(6).map(wish=><span className={`wish-bubble ${wish.className}`} key={wish.label}>{wish.label}</span>)}
      </div>
    </section>

    <section className="action">
      <img src="/assets/logo.png" alt="Ichor Online" />
      <h2>Follow the road<br/>as it changes.</h2>
      <div><a className="primary" href="https://store.steampowered.com/app/3338980" target="_blank" rel="noreferrer"><SteamMark />Wishlist on Steam</a><a href="https://www.patreon.com/c/LeoGameDev" target="_blank" rel="noreferrer"><PatreonMark />Support on Patreon</a><a href="https://discord.gg/5dYE9NWxdb" target="_blank" rel="noreferrer"><DiscordMark />Join Discord</a></div>
    </section>

    <footer><span>Qilvo Games</span><p>Milestones show priorities, not release dates. Features may move when testing reveals a better path.</p><a href="#top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Back to top ↑</a></footer>
  </main>
}

export default App
