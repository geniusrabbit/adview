import React from "react";
import { AdLoadState, AdViewOptionalDataProps, AdViewUnitTemplateTypeProps } from "../types";
import { matchExpectedState } from "./utils";

type AdViewUnitDefaultTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'default';
  children?: React.ReactNode | ((props: AdViewOptionalDataProps) => React.ReactNode);
};

function AdViewUnitDefaultTemplate({ type='default', data, state, children, ...props }: AdViewUnitDefaultTemplateProps) {
  if (data) {
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

  if (typeof children === 'function') {
    return <>{children({ data, state, ...props })}</>;
  }

  return (
    children ? <>{children}</> : (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        <p>🔄 Default content for ad unit</p>
        <p>Data: {JSON.stringify(data)}</p>
        <p>State: {JSON.stringify(state)}</p>
      </div>
    )
  );
}

AdViewUnitDefaultTemplate.defaults = {
  type: 'default',
};

export default AdViewUnitDefaultTemplate;
