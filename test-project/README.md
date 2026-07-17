# AdView Playground

Interactive demo app for developing and exploring `@adview/react`.

## Commands

```bash
# from repo root
make dev-project          # http://localhost:3002
make test-project         # integration tests

# or locally
npm run dev
npm test
```

## Features

Left navigation switches between demos:

- Provider + Unit basics
- Declarative `sources` / drivers
- Mix ads from multiple sources
- Conditional selection by `tags` or source name
- Selection plan (waterfall stages · parallel · weighted shuffle)
- Waterfall top-up until `limit`
- Custom `AdViewDataLoader` adapter
- Custom templates (multi-type + `*` + DefaultTemplate)
- Unit props (`query`, `wrapper`, `filterItems`, `acceptedFormatTypes`)
- Ad info (`adsourceInfo`, `adinfo`, `adsources`)
- Custom render props
- Built-in Banner / Native templates
- Tracking pixels

Each page includes a live preview and expandable syntax-highlighted example code.
