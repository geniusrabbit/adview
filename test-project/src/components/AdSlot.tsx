'use client';

import React from 'react';

type AdSlotProps = {
  data?: {
    id?: string;
    type?: string;
    fields?: { [key: string]: unknown };
    assets?: { name?: string; path: string }[];
  } | null;
  state?: {
    isLoading?: boolean;
    isComplete?: boolean;
    isError?: boolean;
  };
  error?: Error | null;
};

export default function AdSlot({ data, state, error }: AdSlotProps) {
  const image = data?.assets?.find(a => a.name === 'main') || data?.assets?.[0];

  return (
    <div>
      <div className="state-row">
        <span className={`chip${state?.isLoading ? ' warn' : ''}`}>
          loading {state?.isLoading ? 'yes' : 'no'}
        </span>
        <span className={`chip${state?.isComplete ? ' on' : ''}`}>
          complete {state?.isComplete ? 'yes' : 'no'}
        </span>
        <span className={`chip${state?.isError || error ? ' err' : ''}`}>
          error {state?.isError || error ? 'yes' : 'no'}
        </span>
        {data?.type && <span className="chip">{data.type}</span>}
      </div>

      <div className="preview-stage">
        {error && <p className="muted">Error: {error.message}</p>}
        {!error && !data && (
          <p className="muted">
            {state?.isLoading ? 'Fetching ad…' : 'No ad to display'}
          </p>
        )}
        {data && (
          <article className="ad-card">
            {image?.path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.path} alt={String(data.fields?.title || 'Ad')} />
            )}
            <div className="ad-body">
              <div className="ad-label">
                Sponsored · {data.id}
                {data.fields?.sourceName != null && (
                  <>
                    {' '}
                    · source:{' '}
                    <span style={{ color: 'var(--accent)' }}>
                      {String(data.fields.sourceName)}
                    </span>
                  </>
                )}
              </div>
              <h4>{String(data.fields?.title || 'Untitled ad')}</h4>
              {data.fields?.description != null && (
                <p>{String(data.fields.description)}</p>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
