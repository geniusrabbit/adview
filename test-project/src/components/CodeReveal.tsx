'use client';

import { Highlight, themes, type Language } from 'prism-react-renderer';
import React from 'react';

type CodeRevealProps = {
  title?: string;
  code: string;
  language?: Language;
  defaultOpen?: boolean;
};

export default function CodeReveal({
  title = 'Show example code',
  code,
  language = 'tsx',
  defaultOpen = false,
}: CodeRevealProps) {
  return (
    <details className="code-reveal" open={defaultOpen || undefined}>
      <summary>
        <span>{title}</span>
        <span className="chevron" aria-hidden />
      </summary>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`code-block ${className}`} style={{ ...style, background: '#080809' }}>
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </details>
  );
}
