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

class AdView {
  static Provider = AdViewProvider;
  static Unit = AdViewUnitClient;
  static Banner = AdViewUnitBanner;
  static Native = AdViewUnitNative;
  static Proxy = AdViewUnitProxy;
  static TypeSwitch = AdViewUnitTypeSwitch;
};

export default AdView;
