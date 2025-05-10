import {
  AdViewDataClient,
  AdViewStyleTokens,
  AdViewUnitDefault,
} from '../types';
import AdViewUnitNative from './AdViewUnitNative';
import AdViewUnitProxy from './AdViewUnitProxy';
import AdViewUnitBanner from './AdViewUnitBanner';
import React from 'react';

type AdViewUnitDefaultProps = {
  data?: AdViewDataClient;
  classNames?: AdViewStyleTokens;
  onDefault?: AdViewUnitDefault;
};

function AdViewUnitTypeSwitch({
  data,
  classNames,
  onDefault,
}: AdViewUnitDefaultProps) {
  switch (data?.type) {
    case 'native':
      return <AdViewUnitNative {...data} classNames={classNames?.native} />;
    case 'proxy':
      return <AdViewUnitProxy {...data} classNames={classNames?.proxy} />;
    case 'banner':
      return <AdViewUnitBanner {...data} classNames={classNames?.banner} />;
    default:
      if (React.isValidElement(onDefault)) {
        return React.cloneElement(onDefault);
      }

      if (typeof onDefault === 'function') {
        return onDefault();
      }

      return null;
  }
}

export default AdViewUnitTypeSwitch;
