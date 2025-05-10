'use client';

import React from 'react';
import AdViewUnitTypeSwitch from './AdViewUnitTypeSwitch';
import {
  AdViewUnitClientChildren,
  AdViewUnitClientChildrenProps,
  AdViewUnitDefault,
} from '../types';

export type AdViewUnitWrapperClientProps = AdViewUnitClientChildrenProps & {
  children?: AdViewUnitClientChildren;
  onDefault: AdViewUnitDefault;
};

function AdViewUnitWrapperClient({
  data,
  state,
  error,
  children,
  onDefault,
}: AdViewUnitWrapperClientProps) {
  const { isLoading, isError } = state;
  const isChildrenReactNode = React.isValidElement(children);
  const isChildrenFunction = typeof children === 'function';

  if (isChildrenReactNode) {
    return React.cloneElement(children, {
      data,
      state,
      error,
      onDefault,
    });
  }

  if (isChildrenFunction) {
    return children({
      data,
      state,
      error,
      onDefault,
    });
  }

  if (isLoading) {
    return null;
  }

  if (!children && !isError && data) {
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

export default AdViewUnitWrapperClient;
