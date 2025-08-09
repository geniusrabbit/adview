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

const AdView = {};

const AdViewExport = Object.assign(AdView, {
  Provider: AdViewUnitServer,
  Unit: AdViewUnitServer,
  Banner: AdViewUnitBanner,
  Native: AdViewUnitNative,
  Proxy: AdViewUnitProxy,
  TypeSwitch: AdViewUnitTypeSwitch
});

export default AdViewExport;
