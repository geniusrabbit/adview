import AdViewUnitClient from './AdViewUnit/AdViewUnit.client';
// import AdViewUnitServer from './AdViewUnit/AdViewUnit.server';
import AdViewProvider from './AdViewUnit/AdViewProvider';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';
// import AdViewUnitTracking from './AdViewUnit/AdViewUnitTracking';
// import AdViewUnitWrapperClient from '@/src/AdViewUnit/AdViewUnitWrapper.client';

const AdView = {
  UnitClient: AdViewUnitClient,
  Provider: AdViewProvider,
  UnitTypeSwitch: AdViewUnitTypeSwitch,
  UnitBanner: AdViewUnitBanner,
  UnitNative: AdViewUnitNative,
  UnitProxy: AdViewUnitProxy,
};

export {
  AdViewProvider, AdViewUnitBanner,
  // AdViewUnitServer,
  AdViewUnitClient, AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitTypeSwitch
};

export default AdView;
