import AdViewUnitServer from './AdViewUnit/AdViewUnit.server';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';

const AdView = {
  UnitServer: AdViewUnitServer,
  UnitTypeSwitch: AdViewUnitTypeSwitch,
  UnitBanner: AdViewUnitBanner,
  UnitNative: AdViewUnitNative,
  UnitProxy: AdViewUnitProxy,
};

export {
  AdViewUnitBanner,
  AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitServer,
  AdViewUnitTypeSwitch
};

export default AdView;
