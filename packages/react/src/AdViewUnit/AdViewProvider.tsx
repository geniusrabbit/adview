'use client';

import React, { createContext } from 'react';
import { type AdViewConfig } from '../types';

type AdViewProviderContextProps = AdViewConfig;

export const AdViewProviderContext = createContext<AdViewProviderContextProps>(
  {} as AdViewProviderContextProps,
);

type AdViewProviderProps = {
  children: React.ReactNode;
} & AdViewProviderContextProps;

const AdViewProvider = ({ children, ...props }: AdViewProviderProps) => {
  return (
    <AdViewProviderContext.Provider value={props}>
      {children}
    </AdViewProviderContext.Provider>
  );
};

export default AdViewProvider;
