import AdViewProvider from './AdViewUnit/AdViewProvider';
import AdViewUnitClient from './AdViewUnit/AdViewUnit.client';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';

const AdView = {
  Provider: AdViewProvider,
  UnitClient: AdViewUnitClient,
  UnitTypeSwitch: AdViewUnitTypeSwitch,
  UnitBanner: AdViewUnitBanner,
  UnitNative: AdViewUnitNative,
  UnitProxy: AdViewUnitProxy,
};

export {
  AdViewProvider, AdViewUnitBanner,
  AdViewUnitClient, AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitTypeSwitch
};

export default AdView;
