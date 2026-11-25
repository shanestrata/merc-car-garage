# merc-car-garage

An old-school pixel-art Formula One garage theme for the Claude desktop and mobile apps.

- **A pixel-art garage behind the chat:** wall screens, a timing tower, tyre stacks, and a big pit wall where three engineers in headsets chat over team radio. A crew member walks between the screens checking the data, a helmeted driver wanders through, and the far-right engineer spins his chair round to watch the garage.
- **Practice vs. race:** between turns it's practice, with screens on "NO DATA" and "NO FEED" and relaxed setup radio. While Claude works, the garage goes live: helmet-cam onboards, scrolling telemetry, a shuffling timing tower and race radio ("PUSH PUSH", "PURPLE S2!").
- **Lights Out:** when you send a message, five red lights count down above the prompt box, then a car launches across the garage as the race starts.
- **Pit stop timer:** each tool call Claude makes shows on the pit wall's middle screen with a live timer, then its final time in sector colours: purple for the fastest stop, green for quick, amber for slow, red for a problem.
- **Flags:** a yellow flag when a tool call fails or is blocked, a red flag when a turn is stopped or ends on an error.
- **Look:** carbon-black surfaces, silver text and teal accents, with styled message panels and timing-screen tool rows (dark mode).
- **Sound:** quiet garage ambience and short cues. Turn it on with the speaker button in the session's title bar.

It draws in the desktop and mobile apps; the terminal shows no theme.

An unofficial fan theme. It is not affiliated with or endorsed by any Formula One team or sponsor, and uses no team logos or artwork.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install merc-car-garage --marketplace shanestrata/merc-car-garage
```

Answer `y` to add the marketplace, then pick a scope (user scope makes it load in every session).

From a shell:

```
claude plugin install merc-car-garage --marketplace shanestrata/merc-car-garage
```

In the desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `shanestrata/merc-car-garage`, then **Add plugin**.
