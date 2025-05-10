import React from 'react';
import AdViewUnitClient, { AdViewUnitClientProps } from './AdViewUnit.client';
import AdViewUnitServer, { AdViewUnitServerProps } from './AdViewUnit.server';

export type AdViewUnitProps = typeof window extends undefined
  ? AdViewUnitServerProps
  : AdViewUnitClientProps;

function AdViewUnit(props: AdViewUnitProps) {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return <AdViewUnitServer {...(props as AdViewUnitServerProps)} />;
  }

  return <AdViewUnitClient {...(props as AdViewUnitClientProps)} />;
}

export default AdViewUnit;
