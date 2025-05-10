import React from 'react';
import AdViewUnitTypeSwitch from './/AdViewUnitTypeSwitch';

import {
  AdViewUnitDefault,
  AdViewUnitServerChildren,
  AdViewUnitServerChildrenProps,
} from '../types';

export type AdViewUnitWrapperServerProps = AdViewUnitServerChildrenProps & {
  children?: AdViewUnitServerChildren;
  onDefault?: AdViewUnitDefault;
};

async function AdViewUnitWrapperServer({
  data,
  children,
  onDefault,
}: AdViewUnitWrapperServerProps) {
  const isChildrenReactNode = React.isValidElement(children);
  const isChildrenFunction = typeof children === 'function';
  const isLoadingError = data instanceof Error;

  if (isChildrenReactNode) {
    return React.cloneElement(children, { data, onDefault });
  }

  if (isChildrenFunction) {
    return children({ data, onDefault });
  }

  if (!children && !isLoadingError) {
    return <AdViewUnitTypeSwitch data={data} onDefault={onDefault} />;
  }

  if (React.isValidElement(onDefault)) {
    return React.cloneElement(onDefault);
  }

  if (typeof onDefault === 'function') {
    return onDefault();
  }

  return null;
}

export default AdViewUnitWrapperServer;
