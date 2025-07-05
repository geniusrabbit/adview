'use client';

import { executeImpressionsTracking } from '@adview/core/utils';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

type AdViewUnitTrackingProps = {
  impressions?: string[];
  views?: string[];
  clicks?: string[];
  children: React.ReactNode;
};

function AdViewUnitTracking({
  impressions,
  views,
  clicks,
  children,
}: AdViewUnitTrackingProps) {
  const isServer = typeof window === 'undefined';
  const wrapperRef = useRef<HTMLDivElement>(null);
  const executeImpressionsTrackingHandler = useCallback(
    () => executeImpressionsTracking(impressions),
    [impressions],
  );
  const trackingObserverInstanceHandler = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          executeImpressionsTracking(views);
          trackingObserverInstance?.unobserve(wrapperRef.current!);
        }
      });
    },
    [views],
  );
  const trackingObserverInstance = useMemo<IntersectionObserver | null>(() => {
    return !isServer
      ? new IntersectionObserver(trackingObserverInstanceHandler)
      : null;
  }, [isServer, trackingObserverInstanceHandler]);
  const clickTrackerHandler = useCallback(() => {
    executeImpressionsTracking(clicks);

    wrapperRef.current?.removeEventListener('click', clickTrackerHandler);
  }, [clicks]);

  useEffect(() => {
    if (wrapperRef.current && trackingObserverInstance) {
      executeImpressionsTrackingHandler();
      wrapperRef.current?.addEventListener('click', clickTrackerHandler);
      trackingObserverInstance?.observe(wrapperRef.current);

      return () => {
        wrapperRef.current?.removeEventListener('click', clickTrackerHandler);
        if (wrapperRef.current)
          trackingObserverInstance?.unobserve(wrapperRef.current);
      };
    }

    return () => {};
  }, [
    trackingObserverInstance,
    executeImpressionsTrackingHandler,
    clickTrackerHandler,
  ]);

  return <div ref={wrapperRef}>{children}</div>;
}

export default AdViewUnitTracking;
