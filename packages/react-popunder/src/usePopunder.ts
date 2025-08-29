import { useRef, useEffect, useState } from 'react';
import PopUnder from '@adview/popunder';
import { PopunderProps } from './types';

function usePopunder(config: PopunderProps) {
  const instanceRef = useRef<typeof PopUnder | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !instanceRef.current) {
      // @ts-ignore
      instanceRef.current = new PopUnder(config);
      setIsReady(true);
    }
  }, [config]);

  return isReady ? instanceRef.current : null;
}

export default usePopunder;
