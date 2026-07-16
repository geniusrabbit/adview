'use client';

import * as AdView from '@adview/react';
import React from 'react';

/**
 * Shown when the Unit has no ad data (inventory miss / error path).
 * AdView.DefaultTemplate only renders when data is falsy.
 */
export default function EmptyDefaultTemplate() {
  return (
    <AdView.DefaultTemplate>
      <div className="preview-stage" data-template="default">
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p className="demo-kicker" style={{ marginBottom: '0.5rem' }}>
            DefaultTemplate
          </p>
          <p style={{ margin: 0, color: 'var(--ebony-100)' }}>
            No creatives matched — fallback UI
          </p>
          <p className="muted" style={{ marginTop: '0.45rem' }}>
            Use DefaultTemplate as the last child of Unit for empty states.
          </p>
        </div>
      </div>
    </AdView.DefaultTemplate>
  );
}

EmptyDefaultTemplate.defaults = { type: 'default' };
