import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs, ThemeSound, ThemeStyle, Timer } from 'claude-code'

import type { Flag } from '../types'
import { makeColors } from './make-colors.js'
import { atTime, GARAGE_IDLE, GARAGE_LAUNCH, GARAGE_RACE } from './scene.js'

const racing = atom({ plugin: 'merc-car-garage', key: 'racing' } as const, false)
const lights = atom({ plugin: 'merc-car-garage', key: 'lights' } as const, 0)
const flag = atom({ plugin: 'merc-car-garage', key: 'flag' } as const, null)
const launching = atom({ plugin: 'merc-car-garage', key: 'launching' } as const, false)

// Pit Garage: carbon-black surfaces, brushed-silver text, a teal team accent.
// A dark look by design: garages are lit by screens and strip lights.
const { theme, problems } = makeColors({
  label: 'Pit Garage',
  only: 'dark',
  roles: { accent: '#19b5a8', danger: '#e0463c', success: '#4fbf6a', warning: '#e3a21a', pro: '#8fa8c8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b0e10',
        'surface-1': '#12171a',
        'surface-2': '#181e21',
        'surface-3': '#1d2427',
        'text-primary': '#eef2f3',
        'text-secondary': '#c3cbcf',
        'text-muted': '#97a2a7',
      },
    },
  },
})

const SOUND: ThemeSound = {
  ambience: {
    reverb: 0.35,
    layers: [
      // Ventilation and the hum of the garage.
      { wave: 'brown', drone: true, gain: 0.22, filter: { type: 'lowpass', hz: 380, to: 520 } },
      // Generators and the server rack.
      { wave: 'sine', notes: ['A1', 'E2'], drone: true, gain: 0.08, tremolo: { hz: 0.15, depth: 0.3 } },
      // The odd tool set down on a bench somewhere.
      { wave: 'crackle', scatter: 0.06, gain: 0.12, release: 0.25, filter: { type: 'bandpass', hz: 2400 }, pan: -0.4 },
      // A distant wheel gun, now and then.
      { wave: 'white', scatter: 0.025, gain: 0.07, attack: 0.01, release: 0.5, filter: { type: 'bandpass', hz: 1400, to: 900 }, pan: 0.5 },
    ],
  },
  cues: {
    send: { layers: [{ wave: 'saw', notes: ['A3'], glide: 12, gain: 0.12, release: 0.35, filter: { type: 'lowpass', hz: 1200, to: 3000 } }] },
    tool: { layers: [{ wave: 'triangle', notes: ['E6'], gain: 0.07, release: 0.06 }] },
    done: { reverb: 0.3, layers: [{ wave: 'bell', notes: ['E5', 'B5'], step: 0.12, gain: 0.25, release: 0.9 }] },
    ask: { layers: [{ wave: 'sine', notes: ['A5', 'A5'], step: 0.18, gain: 0.2, release: 0.15 }] },
    error: { layers: [{ wave: 'square', notes: ['C3', 'G2'], step: 0.15, gain: 0.12, release: 0.3, filter: { type: 'lowpass', hz: 900 } }] },
    compact: { layers: [{ wave: 'white', gain: 0.1, attack: 0.05, release: 0.6, filter: { type: 'lowpass', hz: 3000, to: 400 } }] },
  },
}

const STYLE: ThemeStyle = {
  Text: { fontFamily: ['sans'], fontSize: 15, lineHeight: 23 },
  Heading: { fontFamily: ['sans'], fontWeight: 'bold', letterSpacing: 1, color: '#e9f6f5' },
  // The engineer on the pit wall: teal-edged panel.
  UserMessage: {
    color: '#eef2f3',
    backgroundColor: '#0e2a29',
    borderColor: '#19b5a8',
    borderWidth: 1,
    radius: [10, 2, 10, 10],
    paddingX: 14,
    paddingY: 10,
    shadow: { y: 4, blur: 14, color: '#00000088' },
  },
  // Replies on a carbon panel with a silver edge.
  AssistantMessage: {
    color: '#eef2f3',
    backgroundColor: '#12171af2',
    borderColor: '#3a4448',
    borderWidth: 1,
    radius: [2, 10, 10, 10],
    paddingX: 16,
    paddingY: 12,
    shadow: { y: 4, blur: 14, color: '#00000088' },
  },
  // Tool calls read like a timing screen.
  ToolUse: { color: '#7fe0d6', fontFamily: ['mono'], backgroundColor: '#061012ee', borderColor: '#1d4542', borderWidth: 1, radius: 3, paddingX: 8 },
}

const BASE: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'garage', glass: { blur: 18, tint: '#0b0e10', opacity: 0.55 } },
}

// Timers for the start lights and the yellow flag; cancelled when a new one starts.
let lightTimers: Timer[] = []
let flagTimer: Timer | undefined
// Whether Claude is mid-turn, and whether the start lights are still counting down.
// Race mode (and the launch) starts at lights out, or at once for a turn with no lights.
let turnActive = false
let lightsRunning = false

async function startLights($: EngineInterface): Promise<void> {
  lightTimers.forEach(t => t.cancel())
  lightTimers = []
  lightsRunning = true
  await update($, lights, () => 1)
  for (let n = 2; n <= 5; n++) {
    lightTimers.push($.clock.after((n - 1) * 700, () => void update($, lights, () => n)))
  }
  // A random hold before the lights go out, like the real start.
  const out = 4 * 700 + 400 + Math.floor(Math.random() * 900)
  lightTimers.push($.clock.after(out, () => void lightsOut($)))
  lightTimers.push($.clock.after(out + 2600, () => void update($, lights, () => 0)))
}

let launchTimer: Timer | undefined

// Race mode on, with the launch car shown for its one pass only.
async function goRacing($: EngineInterface): Promise<void> {
  launchTimer?.cancel()
  await update($, launching, () => true)
  await update($, racing, () => true)
  launchTimer = $.clock.after(1600, () => void update($, launching, () => false))
}

async function lightsOut($: EngineInterface): Promise<void> {
  lightsRunning = false
  await update($, lights, () => 6)
  if (turnActive) {
    await goRacing($)
  }
}

async function showFlag($: EngineInterface, next: Flag): Promise<void> {
  flagTimer?.cancel()
  flagTimer = undefined
  await update($, flag, () => next)
  if (next.kind === 'yellow') {
    flagTimer = $.clock.after(7000, () => void update($, flag, current => (current?.kind === 'yellow' ? null : current)))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    let set
    try {
      set = await $.theme.set({ ...BASE, sound: SOUND, style: STYLE })
    } catch (error) {
      // An older build may not take sound or style: keep the colors and the garage.
      $.ui.log(String(error))
      set = await $.theme.set(BASE)
    }
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    await update($, racing, () => false)
    await update($, launching, () => false)

    return next(e)
  })

  // Lights out: five reds on send, then away we go. A new message clears an old red flag.
  on('prompt.submit', async ($, e, next) => {
    await update($, flag, () => null)
    void startLights($)

    return next(e)
  })

  // Race mode while Claude works on the main conversation.
  on('turn.start', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      turnActive = true
      if (!lightsRunning) {
        await goRacing($)
      }
    }

    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) {
      return result
    }
    turnActive = false
    await update($, launching, () => false)
    await update($, racing, () => false)
    if (e.reason === 'aborted') {
      await showFlag($, { kind: 'red', text: 'RED FLAG  ·  Session stopped' })
    } else if (e.reason === 'error') {
      await showFlag($, { kind: 'red', text: 'RED FLAG  ·  The turn ended on an error' })
    } else if (e.reason === 'refusal') {
      await showFlag($, { kind: 'red', text: 'RED FLAG  ·  Race control stopped this one' })
    }

    return result
  })

  // Yellow flag when a tool call fails or is blocked.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if (result.deny !== undefined || result.isError === true) {
      await showFlag($, { kind: 'yellow', text: `YELLOW FLAG  ·  ${e.tool} ${result.deny !== undefined ? 'was blocked' : 'failed'}` })
    }

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const lit = await read($, lights)
    const shown = await read($, flag)
    if (e.props.hasSurvey || (lit === 0 && shown === null)) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" gap="xs">
        {lit > 0 && (
          <Box key="lights" flexDirection="row" gap="sm" alignItems="center">
            {lit === 6 ? (
              <Text key="out" bold color="#2fd3c4">LIGHTS OUT AND AWAY WE GO!</Text>
            ) : (
              [1, 2, 3, 4, 5].map(n => (
                <Text key={`l${n}`} bold color={n <= lit ? '#e0463c' : '#3a4448'}>●●</Text>
              ))
            )}
          </Box>
        )}
        {shown !== null && (
          <Box key="flag" paddingX="sm" backgroundColor={shown.kind === 'red' ? '#7a1d17' : '#6b5208'} borderStyle="round" borderColor={shown.kind === 'red' ? '#e0463c' : '#e3a21a'}>
            <Text bold color={shown.kind === 'red' ? '#ffe1dd' : '#fff4d1'}>{shown.text}</Text>
          </Box>
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'garage') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const isRacing = await read($, racing)
    const isLaunching = await read($, launching)

    return (
      <Svg
        source={atTime(isRacing ? (isLaunching ? GARAGE_LAUNCH : GARAGE_RACE) : GARAGE_IDLE, await $.clock.now())}
        alt={isRacing ? 'The garage in race mode: live telemetry, a shuffling timing tower and busy team radio' : 'A pixel-art racing garage waiting for data, with a pit wall crew on headsets'}
        isInteractive
      />
    )
  })
}
