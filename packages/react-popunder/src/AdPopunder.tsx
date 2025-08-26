import React, { useEffect } from 'react';
import { AdPopunderProps } from './types';
import PopUnder from '@adview/popunder';

const AdPopunder: React.FC<AdPopunderProps> = ({ config }) => {
  useEffect(() => {
    // @ts-ignore
    new PopUnder(config);
  }, []);

  return null;
};

export default AdPopunder;
