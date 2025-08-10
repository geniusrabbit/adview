import React from "react";
import { AdViewOptionalDataProps, AdViewUnitTemplateTypeProps } from "../types";

type AdViewUnitDefaultTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'default';
  children?: React.ReactNode | ((props: AdViewOptionalDataProps) => React.ReactNode);
};

function AdViewUnitDefaultTemplate({ type='default', data, state, children, ...props }: AdViewUnitDefaultTemplateProps) {
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

AdViewUnitDefaultTemplate.defaultProps = {
  type: 'default',
  children: null,
};

export default AdViewUnitDefaultTemplate;
