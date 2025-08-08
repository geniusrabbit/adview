import AdViewUnitServer from './AdViewUnit/AdViewUnit.server';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';

export {
  AdViewUnitBanner,
  AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitServer,
  AdViewUnitTypeSwitch
};

type AdViewType = {
  Banner: typeof AdViewUnitBanner;
  Native: typeof AdViewUnitNative;
  Proxy: typeof AdViewUnitProxy;
  Server: typeof AdViewUnitServer;
  TypeSwitch: typeof AdViewUnitTypeSwitch;
};  

let AdView: AdViewType = {
  Banner: AdViewUnitBanner,
  Native: AdViewUnitNative,
  Proxy: AdViewUnitProxy,
  Server: AdViewUnitServer,
  TypeSwitch: AdViewUnitTypeSwitch,
};

export default AdView;
