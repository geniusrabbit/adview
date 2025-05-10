# AdView - React
AdView is a React library for displaying ads in your application. It provides a simple and flexible way to integrate ads into your app, with support for different ad formats and customization options.

# Documentation
## Table of Contents
* [AdUnit return values](#adunit-return-values)
* [AdUnit configuration fields](#adunit-configuration-fields)
* [Client](#client)
  * [Simple use case of a single ad unit.](#simple-use-case-of-a-single-ad-unit)
  * [Multiple configurations of ad units to use provider.](#multiple-configurations-of-ad-units-to-use-provider)
  * [The fallback ad unit is used when the ad fails to load or an empty response is received.](#the-fallback-ad-unit-is-used-when-the-ad-fails-to-load-or-an-empty-response-is-received)
  * [The controller is used to control the ad unit.](#the-controller-is-used-to-control-the-ad-unit)
  * [Style customization by class name tokens.](#style-customization-by-class-name-tokens)
* [Server](#server)
  * [Server simple use case of a single ad unit.](#server-simple-use-case-of-a-single-ad-unit)
  * [Server style customization by class name tokens


## AdUnit return values
* For the simplest case, it will return the default template related to the ad unit format: `AdViewUnitBanner`, `AdViewUnitNative`, `AdViewUnitProxy`, and execute `onDefault` if it is defined.
* If `children` is defined as a `ReactNode`, it will return the `children` with the following props:
  * `data`: The ad data returned from the ad server.
  * `state`: The state of the ad unit will return only for the *client* widgets. This can be one of the following:
    * `isInitial`: The ad is in the initial state.
    * `isLoading`: The ad is loading.
    * `isComplete`: The ad has loaded.
    * `isError`: There was an error loading the ad.
  * `error`: The error message if there was an error loading the ad.
  * `onDefault`: A function that can be called to execute the default ad template.
* If `children` is defined as a `function`, it will return the result of the function with the same props as above.


## AdUnit configuration fields
* `children`: The children of the ad unit. This is an optional field.
    * Can be *ReactNode*, will pass props like `data`, `state`, `error`, `onDefault?`
    * Can be a function that returns a *ReactNode* and accepts the same arguments `data`, `state`, `error`, `onDefault?`
* `unitId`: The ad unit ID for the ad to be displayed. This is a required field.
* `format`: The format of the ad. This is a optional field. Can be one of the following:
  * `banner`
  * `native`
  * `proxy`
* `srcURL`: The URL of the ad source. This is a required field. `{<id>}` will be replaced with the ad unit ID.
* `onDefault`: The default ad to be displayed if the ad fails to load or an empty response. This is an optional field.

## Client

### Simple use case of a single ad unit.
```jsx
  import {AdViewUnitClient} from '@adview/react';

  <AdViewUnitClient
    format="banner"
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
  />
```

### Multiple configurations of ad units to use provider.
```jsx
  import AdView from '@adview/react';

  <AdView.AdViewProvider
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
  >
    <AdViewUnitClient
      format="banner"
      unitId={adUnitId}
    />
    {'...'}
    <AdViewUnitClient
      format="native"
      unitId={adUnitId}
    />
  </AdView.AdViewProvider>
```

### The fallback ad unit is used when the ad fails to load or an empty response is received.
```jsx
  import {AdViewUnitClient} from '@adview/react';

  <AdViewUnitClient
    format="banner"
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
    onDefault={<FallbackAd />}
  />
  {'...'}
  <AdViewUnitClient
    format="banner"
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
    onDefault={() => <FallbackAd />}
  />
```

### The controller is used to control the ad unit.
```jsx
  import {AdViewUnitClient} from '@adview/react';

  <AdViewUnitClient
    format="banner"
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
    onDefault={<FallbackAd />}
  >
    {({data, state, error, onDefault}) => {
      const {
        isInitial,
        isLoading,
        isComplete,
        isError,
      } = state;

      if (isLoading) return <AdSpinner />;
      if (isInitial) return <AdPlaceholder />;
      if (isComplete) return <MyCustomAdWidget data={data} />;

      return onDefault();
    }}
  </AdViewUnitClient>
```

### Style customization by class name tokens.
Here is using the `AdViewUnitTypeSwitch` to customize the style through the className of the ad native widget.

Structure of the style class names tokens by fields of the data:
```typescript
  type AdViewStyleTokensNative = {
    container?: string;
    imageLink?: string;
    image?: string;
    label?: string;
    titleLink?: string;
    descriptionLink?: string;
    brandNameLink?: string;
    phoneLink?: string;
    urlLink?: string;
  };
```

Example with tailwind class names:
```jsx
  import {AdViewUnitClient} from '@adview/react';

  <AdViewUnitClient
    unitId={adUnitId}
    format="native"
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
    onDefault={() => (
      <div className="text-center">
        <h4>Default template</h4>
        My custom fallback ad
      </div>
    )}
  >
    <AdViewUnitTypeSwitch
      classNames={{
        native: {
          container: 'flex flex-col gap-2 bg-gray-600 shadow-md rounded-lg p-4',
          label: 'text-correct-500 text-back text-xs font-bold px-2 py-1 rounded',
          titleLink: 'block text-lg',
          descriptionLink: 'block text-sm text-gray-500',
        }
      }}
    />
  </AdViewUnitClient>
```

## Server
The server approach to implement the ad unit is similar to the client approach.
The only difference is that the server approach does not have the `state` of load the ad data that passed into the `children` props.
The server will be responsible for fetching the ad data and passing it to the ad unit.

### Server simple use case of a single ad unit.

```jsx
  import {AdViewUnitServer} from '@adview/react/server';

  <AdViewUnitServer
    format="banner"
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
  />
```

### Server style customization by class name tokens with tailwind.

```jsx
  <AdViewUnitServer
    unitId={adUnitId}
    srcURL="https://as1.revolvesyndicate.net/b/dynamic/{<id>}"
    onDefault={() => (
      <div className="text-center">
        <h4>Default template</h4>
        My custom fallback ad
      </div>
    )}
    >
    <AdViewUnitTypeSwitch
      classNames={{
        native: {
          container: 'flex flex-col gap-2 bg-gray-600 shadow-md rounded-lg p-4',
          label: 'text-correct-500 text-back text-xs font-bold px-2 py-1 rounded',
          titleLink: 'block text-lg',
          descriptionLink: 'block text-sm text-gray-500',
        }
      }}
    />
  </AdViewUnitServer>
```
