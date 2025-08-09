import AdViewProvider from './AdViewUnit/AdViewProvider';
import AdViewUnitClient from './AdViewUnit/AdViewUnit.client';
import AdViewUnitBanner from './AdViewUnit/AdViewUnitBanner';
import AdViewUnitNative from './AdViewUnit/AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnit/AdViewUnitProxy';
import AdViewUnitTypeSwitch from './AdViewUnit/AdViewUnitTypeSwitch';

export {
  AdViewProvider, AdViewUnitBanner,
  AdViewUnitClient, AdViewUnitNative,
  AdViewUnitProxy, AdViewUnitTypeSwitch,
  AdViewUnitBanner as Banner,
  AdViewUnitClient as Client,
  AdViewUnitNative as Native,
  AdViewUnitProxy as Proxy,
  AdViewUnitTypeSwitch as TypeSwitch
};

const AdView = {};

const AdViewExport = Object.assign(AdView, {
  Provider: AdViewProvider,
  Unit: AdViewUnitClient,
  Banner: AdViewUnitBanner,
  Native: AdViewUnitNative,
  Proxy: AdViewUnitProxy,
  TypeSwitch: AdViewUnitTypeSwitch
});

export default AdViewExport;
