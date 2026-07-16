import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';

import AdViewProvider, {
  AdViewProviderContext,
} from '../AdViewUnit/AdViewProvider';

function Probe() {
  const config = useContext(AdViewProviderContext);
  return (
    <div>
      <span data-testid="src">{config.srcURL || ''}</span>
      <span data-testid="sources">{(config.sources || []).map(s => s.name).join(',')}</span>
    </div>
  );
}

describe('AdViewProvider', () => {
  it('provides config to descendants', () => {
    render(
      <AdViewProvider
        srcURL="https://ads.example/{<id>}"
        sources={[
          {
            name: 'primary',
            driver: 'dynamic',
            params: { url: 'https://ads.example/{<id>}' },
          },
        ]}
      >
        <Probe />
      </AdViewProvider>,
    );

    expect(screen.getByTestId('src')).toHaveTextContent(
      'https://ads.example/{<id>}',
    );
    expect(screen.getByTestId('sources')).toHaveTextContent('primary');
  });
});
