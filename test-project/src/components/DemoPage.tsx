import React from 'react';

import CodeReveal from './CodeReveal';

type DemoPageProps = {
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
  code: string;
  codeTitle?: string;
  defaultCodeOpen?: boolean;
};

export default function DemoPage({
  kicker,
  title,
  description,
  children,
  code,
  codeTitle,
  defaultCodeOpen,
}: DemoPageProps) {
  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview</h3>
          </div>
          <div className="panel-body">{children}</div>
          <CodeReveal
            code={code}
            title={codeTitle}
            defaultOpen={defaultCodeOpen}
          />
        </section>
      </div>
    </article>
  );
}
