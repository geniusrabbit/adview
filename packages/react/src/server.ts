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

class AdView {
  static Banner = AdViewUnitBanner;
  static Native = AdViewUnitNative;
  static Proxy = AdViewUnitProxy;
  static Server = AdViewUnitServer;
  static TypeSwitch = AdViewUnitTypeSwitch;
};

export default AdView;
