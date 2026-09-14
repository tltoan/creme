# Misé: first design draft

## Direction

An editorial hospitality homepage followed by quiet, practical scheduling spaces. Black and white interface, soft neutral surfaces, rounded cards, generous spacing, sans-serif headlines with italic serif accents, and actual food photography. Press states, hover lift, focus rings, and short transitions make controls feel responsive. Supported devices receive a short vibration on button presses; reduced-motion preferences disable it and animated transitions.

The homepage explains the service before asking for details: promise, three steps, personalization, scheduling, cook recruitment, founders’ story, FAQs, and beta signup. Founder revenue and household numbers come from the supplied brief, not independently verified research. Images illustrate the experience and are not presented as actual Misé meals or team members.

## Research translated into decisions

- [CookUnity: how it works](https://www.cookunity.com/how-it-works): clear sequential service explanation and food-led presentation. Used a concise three-step section. Misé’s in-home service is distinct; no unsupported comparison with frozen meals or subscription policies.
- [Tovala](https://www.tovala.com/learn): appetizing photography and concrete explanation of the everyday benefit. Used real ingredient and preparation imagery with short supporting copy.
- [Linear: how we redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui): hierarchy, spacing, and restrained visual noise. Applied to the calendar, visit states, and role navigation.
- [Nielsen Norman Group: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): show information when it is needed. Kept the interest form in five focused steps and visit details in accessible dialogs.

## Prototype flow

Client requests a time → Misé matches an eligible cook (represented by a sample invitation) → cook accepts → client sees confirmed status. Clients do not choose a cook. This draft demonstrates the interaction, not automated matching or a live backend. All scheduling data is ephemeral sample data.

## Web-sourced photographs

Downloaded from Unsplash under the [Unsplash License](https://unsplash.com/license). No AI-generated food graphics are displayed.

| Asset                   | Photographer      | Original source                                                                           |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `public/mise-salad.jpg` | Anna Pelzer       | https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0                          |
| `public/mise-pasta.jpg` | Eaters Collective | https://unsplash.com/photos/pasta-dish-on-white-plate-ddZYOtZUnBk                         |
| `public/mise-cook.jpg`  | Or Hakim          | https://unsplash.com/photos/a-person-cutting-up-vegetables-on-a-cutting-board-S2Eql9vHN3o |

## Workshop next

1. Does the hospitality tone feel right for your audience?
2. What does Misé confirm before a cook accepts: menu, estimated duration, pay, groceries, and travel area?
3. What should a client see after requesting: a pending quote, an assignment, or a proposed time?
4. Which beta service area and pricing should be published once decided?
