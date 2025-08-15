import React from 'react';
import { AdLoadState, AdViewUnitTemplateTypeProps } from '../types';
import { matchExpectedState } from './utils';

type AdViewUnitProxyTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'proxy';
  className?: string;
  style?: React.CSSProperties;
};

function AdViewUnitProxyTemplate({className, style, data, state, ...props}: AdViewUnitProxyTemplateProps) {
  if (!data) {
    return null;
  }

  const expectState: AdLoadState =
    (props?.isInitial || props?.isLoading || props?.isError || props?.isComplete) ? {
      isInitial: props?.isInitial,
      isLoading: props?.isLoading,
      isError: props?.isError,
      isComplete: props?.isComplete
    } : {isComplete: true};

  // Check if the expected state matches the current state
  if (!matchExpectedState(expectState, state)) {
    return null;
  }

  const { url, fields } = data;
  const iframeSrc = fields?.url || url;

  if (!iframeSrc) {
    return null;
  }

  return (
    <iframe
      className={className}
      width="100%"
      height="100%"
      frameBorder="0"
      marginWidth={0}
      marginHeight={0}
      allowTransparency={true}
      scrolling="no"
      allowFullScreen={true}
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
      src={iframeSrc}
    ></iframe>
  );
}

AdViewUnitProxyTemplate.defaults = {
  type: 'proxy',
};

export default AdViewUnitProxyTemplate;
