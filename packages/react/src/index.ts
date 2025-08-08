import AdViewProvider from './AdViewUnit/AdViewProvider';
import AdViewUnitClient from './AdViewUnit/AdViewUnit.client';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';

export {
  AdViewProvider, AdViewUnitBanner,
  AdViewUnitClient, AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitTypeSwitch
};

type AdViewType = {
  Provider: typeof AdViewProvider;
  Unit: typeof AdViewUnitClient;
  Banner: typeof AdViewUnitBanner;
  Native: typeof AdViewUnitNative;
  Proxy: typeof AdViewUnitProxy;
  TypeSwitch: typeof AdViewUnitTypeSwitch;
};

let AdView: AdViewType = {
  Provider: AdViewProvider,
  Unit: AdViewUnitClient,
  Banner: AdViewUnitBanner,
  Native: AdViewUnitNative,
  Proxy: AdViewUnitProxy,
  TypeSwitch: AdViewUnitTypeSwitch,
};

export default AdView;
