# @adview/react

[![npm version](https://img.shields.io/npm/v/@adview/react.svg)](https://www.npmjs.com/package/@adview/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2F19-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE)

React components for displaying ads with declarative sources, multi-template rendering, built-in tracking, and SSR support. Built on [`@adview/core`](../core).

## Features

- **Declarative sources** — configure backends via `sources[]` (drivers, weights, tags)
- **Waterfall fill** — multiple sources top each other up until `limit` is met
- **Per-unit filters** — select sources by `tags`, `drivers`, or name priority
- **Custom templates** — several `AdView.Template` children per Unit, plus `type="*"` and `DefaultTemplate`
- **Built-in formats** — Banner, Native, Proxy templates
- **Tracking** — impression / view / click pixels via wrappers
- **SSR** — `@adview/react/server` for server components
- **Extensible drivers** — `registerDataLoader` for custom `AdViewDataLoader` adapters

## Installation

```bash
npm install @adview/react
# peer: react ^18 || ^19
# pulls in @adview/core
```

## Quick Start

```tsx
import * as AdView from '@adview/react';

function App() {
  return (
    <AdView.Provider
      sources={[
        {
          name: 'primary',
          driver: 'dynamic',
          params: { url: 'https://ads.example.com/b/dynamic/{<id>}' },
        },
      ]}
    >
      <AdView.Unit unitId="home-banner" format="banner" />
      <AdView.Unit unitId="sidebar" format="native" tags={['sidebar']} />
    </AdView.Provider>
  );
}
```

Legacy `srcURL` / `defaultAdData` / `sourceLoader` still work on Provider and Unit; prefer `sources` for new code.

## Table of Contents

- [@adview/react](#adviewreact)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Table of Contents](#table-of-contents)
  - [Exports](#exports)
  - [Configuration](#configuration)
    - [Declarative sources](#declarative-sources)
    - [Built-in drivers](#built-in-drivers)
    - [Custom drivers](#custom-drivers)
  - [AdView.Unit](#adviewunit)
    - [Props](#props)
    - [Source filters](#source-filters)
    - [Custom render props](#custom-render-props)
    - [Custom templates](#custom-templates)
  - [SSR](#ssr)
  - [Tracking](#tracking)
  - [Loading states](#loading-states)
  - [Playground](#playground)
  - [License](#license)

## Exports

```ts
import {
  Provider,           // AdViewProvider
  Unit,               // AdViewUnitClient
  Template,           // AdViewUnitTemplate
  DefaultTemplate,    // empty-inventory fallback
  BannerTemplate,
  NativeTemplate,
  ProxyTemplate,
} from '@adview/react';

import { Unit as UnitServer } from '@adview/react/server';
```

Types: `AdViewUnitTemplateTypeProps`, `AdViewUnitTemplateProps`, `AdViewUnitClientChildren`, …

Core utilities (drivers, registry):

```ts
import { registerDataLoader } from '@adview/core/utils';
import type {
  AdViewSourceItem,
  AdViewDataLoader,
  AdViewConfig,
} from '@adview/core/typings';
```

## Configuration

### Declarative sources

Pass `sources` on `AdView.Provider` (or on a Unit). Each entry:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique id; used by Unit `sources` filter / priority |
| `driver` | `string` | Registered driver name (`dynamic`, `static`, `function`, or custom) |
| `weight` | `number?` | Default order when Unit does not pass `sources` names (higher first) |
| `tags` | `string[]?` | Placement labels; filtered by Unit `tags` |
| `params` | `object?` | Passed into the driver constructor |

```tsx
<AdView.Provider
  sources={[
    {
      name: 'premium',
      driver: 'dynamic',
      weight: 30,
      tags: ['feed', 'sidebar'],
      params: {
        url: 'https://ads.example.com/{<id>}?limit={<limit>}',
        timeout: 5000,
      },
    },
    {
      name: 'house',
      driver: 'static',
      weight: 10,
      tags: ['feed'],
      params: { defaultData: houseAds },
    },
  ]}
>
  {/* units */}
</AdView.Provider>
```

When several sources match, their loaders are chained: each next one tops up the previous until `limit` is reached.

### Built-in drivers

| `driver` | Class | Main `params` |
|----------|--------|----------------|
| `dynamic` | `DynamicFetcherDataLoader` | `url`, `timeout`, `defaultData`, `dataPreparer` |
| `static` | `HardDataLoader` | `defaultData`, `version`, `adsourceInfo` |
| `function` | `FuncDataLoader` | `fetchAdData` |

URL placeholders for `dynamic`: `{<id>}`, `{<format>}`, `{<limit>}`, `{<locale>}`, `{<q.key>}` / `{<query.key>}` (other query keys are appended).

### Custom drivers

```ts
import { registerDataLoader } from '@adview/core/utils';
import type {
  AdViewData,
  AdViewDataLoader,
  AdViewSourceItem,
} from '@adview/core/typings';

class PartnerLoader implements AdViewDataLoader {
  constructor(private source: AdViewSourceItem) {}

  static matchDriver(source: AdViewSourceItem) {
    return Boolean(source.params?.apiKey);
  }

  async fetchAdData(
    unitId: string,
    limit = 1,
    format?: string | string[],
    query?: Record<string, unknown>,
  ): Promise<AdViewData | Error> {
    // fetch from your network using this.source.params
    return { version: '1', groups: [{ id: unitId, items: [] }] };
  }
}

// Call once at app bootstrap
registerDataLoader('partner', PartnerLoader);
// optional: registerDataLoader('partner', PartnerLoader, (s) => !!s.params?.apiKey)
```

```tsx
<AdView.Provider
  sources={[
    {
      name: 'partner-eu',
      driver: 'partner',
      params: { apiKey: '…', region: 'eu' },
    },
  ]}
>
  <AdView.Unit unitId="slot" format="native" />
</AdView.Provider>
```

Matching order: `source.driver === registeredName`, then optional `matcher` from `registerDataLoader`, then optional static `matchDriver` on the class.

## AdView.Unit

### Props

| Prop | Type | Description |
|------|------|-------------|
| `unitId` | `string` | Ad unit id (required) |
| `format` | `string \| string[]` | Requested format(s) |
| `limit` | `number` | Max items to fill (default `1`) |
| `query` | `object` | Extra request params |
| `sources` | `string[]` | Filter/prioritize by source **name** |
| `tags` | `string[]` | Keep sources whose tags intersect |
| `drivers` | `string[]` | Keep sources with these driver names |
| `acceptedFormatTypes` | `string[]` | Client-side item filter (`*` / `all` accepts any) |
| `selection` | `AdViewSelectionPlan` | Staged waterfall / parallel weighted-shuffle plan |
| `trackingWrapperClassName` | `string` | Class on tracking wrappers |
| `filterItems` | `(items) => items` | Post-fetch item filter |
| `wrapper` | `(params) => ReactNode` | Wrap rendered ad elements |
| `children` | render prop **or** templates | See below |

Also accepts legacy config fields: `srcURL`, `defaultAdData`, `sourceLoader`, `source`, `sources` (config array belongs on Provider; Unit’s `sources` prop is the name filter).

### Source filters

```tsx
{/* By placement tags */}
<AdView.Unit unitId="side" format="banner" tags={['sidebar']} />

{/* By name + priority (order = request order) */}
<AdView.Unit
  unitId="hero"
  format="native"
  sources={['premium', 'house']}
  limit={2}
/>
```

### Selection plan

`selection` describes **stages**. Stages run left-to-right while remaining slots `R = limit - taken > 0`. A string stage fetches one source (order preserved). An array stage fetches all listed sources in parallel, then **weighted-shuffles** the pool (default weight `1`) and takes up to `R`. Flat `sources={['a','b']}` ≡ `selection={['a','b']}`.

```tsx
{/* 1) Strict waterfall */}
<AdView.Unit
  unitId="hero"
  format="banner"
  limit={3}
  selection={['main', 'second', 'other']}
/>

{/* 2) main first; if short, parallel merge of second + other */}
<AdView.Unit
  unitId="hero"
  format="banner"
  limit={4}
  selection={['main', ['second', 'other']]}
/>

{/* 3) weighted shuffle of main+second, then other fallback */}
<AdView.Unit
  unitId="hero"
  format="banner"
  limit={5}
  selection={[
    [
      { source: 'main', weight: 90 },
      { source: 'second', weight: 20 },
    ],
    'other',
  ]}
/>
```

### Custom render props

```tsx
<AdView.Unit unitId="custom" format="native">
  {({ data, state, error }) => {
    if (state.isLoading) return <Skeleton />;
    if (error || !data) return <Fallback />;
    return (
      <article>
        <h3>{data.fields?.title}</h3>
        <p>{data.fields?.description}</p>
      </article>
    );
  }}
</AdView.Unit>
```

### Custom templates

A Unit can take several template children. The first whose `type` matches the ad wins; use `type="*"` as catch-all; put `DefaultTemplate` last for empty inventory.

```tsx
'use client';

import * as AdView from '@adview/react';
import type { AdViewUnitTemplateTypeProps } from '@adview/react';

function VideoPrerollTemplate({
  type = 'video',
  ...props
}: Omit<AdViewUnitTemplateTypeProps, 'type'> & { type?: 'video' }) {
  return (
    <AdView.Template type={type} {...props}>
      {({ data: ad }) => (
        <div>{/* render video preroll from ad */}</div>
      )}
    </AdView.Template>
  );
}

VideoPrerollTemplate.defaults = { type: 'video' };

function FeedSlot({ unitId }: { unitId: string }) {
  return (
    <AdView.Unit
      unitId={unitId}
      format={['native', 'banner', 'proxy', 'proxy_300x250', 'video']}
      limit={5}
      acceptedFormatTypes={['*']}
      trackingWrapperClassName="w-full h-full"
    >
      <VideoPrerollTemplate />
      <AdView.BannerTemplate />
      <AdView.NativeTemplate />

      {/* Catch-all for unmatched types */}
      <AdView.Template type="*">
        {({ data }) => <GeneralCard data={data} />}
      </AdView.Template>

      {/* No data */}
      <AdView.DefaultTemplate>
        <div>No ads available</div>
      </AdView.DefaultTemplate>
    </AdView.Unit>
  );
}
```

**Notes**

- Order matters: specific types before `type="*"`.
- If a `*` template renders for empty data, return `null` so `DefaultTemplate` can run.
- Set `Component.defaults = { type: '…' }` when the template is used without an explicit `type` prop.

## SSR

```tsx
import { Unit } from '@adview/react/server';

export default async function Page() {
  return (
    <Unit
      unitId="ssr-banner"
      format="banner"
      sources={[
        {
          name: 'primary',
          driver: 'dynamic',
          params: { url: 'https://ads.example.com/{<id>}' },
        },
      ]}
    />
  );
}
```

Or wrap with client `Provider` and use server `Unit` with inherited config where your framework allows.

## Tracking

Each ad item may include `tracker.impressions`, `tracker.views`, and `tracker.clicks`. The Unit wraps items in tracking that:

- fires **impressions** on mount
- fires **views** when the wrapper intersects the viewport
- fires **clicks** on wrapper click

```tsx
<AdView.Unit
  unitId="tracked"
  format="banner"
  trackingWrapperClassName="ad-track"
/>
```

## Loading states

```ts
type AdLoadState = {
  isInitial?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isComplete?: boolean;
};
```

Available in render-prop `state` and on template props.

## Playground

The monorepo includes an interactive playground (`test-project`) with ebony UI demos for sources, mix/waterfall, filters, custom drivers, and templates:

```bash
make dev-project   # http://localhost:3002
```

## License

Apache-2.0 — see [LICENSE](LICENSE).
