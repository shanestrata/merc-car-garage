/** The stop on the pit wall's board: running while `ms` is absent, then its time. */
export type PitStop = { id: number; tool: string; startedAt: number; ms?: number; colour?: string }

/** A race-control flag shown above the prompt. */
export type Flag = { kind: 'yellow' | 'red'; text: string }

declare module 'claude-code' {
  interface PluginState {
    'merc-car-garage': {
      /** True while Claude is working on a turn: the garage runs in race mode. */
      racing: boolean
      /** Start lights: 0 hidden, 1 to 5 lights on, 6 lights out. */
      lights: number
      /** The flag being shown, or null. */
      flag: Flag | null
      /** True for the moment after lights out while the launch car crosses. */
      launching: boolean
      /** The pit stop board: the current or last tool call, or null when the board is off. */
      pitstop: PitStop | null
    }
  }
}
