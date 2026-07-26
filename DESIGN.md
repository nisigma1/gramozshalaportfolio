# Engineered with Purpose — design system

## Tokens

- Graphite `#0A0A0B`: primary dark canvas and high-contrast controls.
- Charcoal `#111316`: sectional separation, never a decorative gradient.
- Warm white `#F5F4F0`: light canvas and dark-theme primary text.
- Neutral gray `#A5A7AD`: supporting copy and metadata.
- Precision blue `#3B82F6`: restricted to focus, active navigation, signal states, and small interactive affordances.
- Geist carries editorial display and body copy; Geist Mono is reserved for technical metadata.

Display type uses tightly tracked `clamp()` scales with compact line-height. Section headings step down clearly, while body copy remains between 1rem and 1.3rem.

## Layout map

```text
HEADER        [name]                      [nav] [theme] [contact]
HERO          [role -------------------------- study status]
              [GRAMOZ --------------------------------------]
              [SHALA ---------------------------------------]
              [portrait --------] [thesis + copy + actions --]
ABOUT         [editorial statement --------] [two paragraphs]
EDUCATION     [status] [period] [institution + program ------]
FOCUS         [stage] [focus area --------] [focus area -----]
              [stage] [focus area --------] [focus area -----]
              [stage] [focus area --------] [focus area -----]
EXPERIENCE    [period + role] [expandable case history ------]
STUDIO        [quiet signature ----------------------- link ↗]
IMPACT        [verified values in a precise ledger ----------]
SKILLS        [four distinct capability columns ------------]
LANGUAGES     [editorial heading] [two factual rows ---------]
CERTIFICATES  [context] [single accordion archive -----------]
CONTACT       [invitation ------------] [direct actions -----]
```

## Signature

The memorable element is the Engineering Focus signal ledger: three ordered stages—Sense, Control, Apply—draw their signal path in sequence as the section enters view. The animation explains the content model and disappears under reduced-motion preferences.

## Rejected defaults and variants

- Rejected the centered hero stack and the familiar text-left/photo-right composition. The chosen full-width nameplate makes Gramoz the dominant identity, then places the portrait and thesis in a lower asymmetric stage.
- Rejected a portrait lane with typography over the face because it compromised readability and depended on fragile positioning.
- Rejected a radial engineering diagram because it required absolute positioning and degraded poorly on touch screens.
- Chose the signal ledger over a 3×2 icon-card grid. It keeps the six interests connected, readable, and structurally distinct from every other section.
- Avoided decorative section numbers, icon-card repetition, tag clouds, glass effects, and accent color outside purposeful states.
