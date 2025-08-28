import { useEffect } from 'react';
import { AdPopunderProps } from './types';
import PopUnder from '@adview/popunder';

function AdPopunder({ ...config }: AdPopunderProps) {
  useEffect(() => {
    // @ts-ignore
    new PopUnder(config);
  }, []);

  return null;
}

export default AdPopunder;
