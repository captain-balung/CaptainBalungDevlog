"use client";

import { useState } from "react";

export type DocItem = {
  filename: string;
  title: string;
  html: string;
};

export function DocsSection({ docs }: { docs: DocItem[] }) {
  const [openFilename, setOpenFilename] = useState<string | null>(null);
  if (docs.length === 0) return null;

  const open = docs.find((d) => d.filename === openFilename) ?? null;

  return (
    <section className="docs-section">
      <p className="docs-label">相關文件</p>
      <div className="docs-grid">
        {docs.map((d) => (
          <button
            key={d.filename}
            type="button"
            className={`doc-card${openFilename === d.filename ? " open" : ""}`}
            onClick={() =>
              setOpenFilename((cur) => (cur === d.filename ? null : d.filename))
            }
            aria-expanded={openFilename === d.filename}
          >
            <span className="doc-title">{d.title}</span>
            <span className="doc-meta">{d.filename}</span>
          </button>
        ))}
      </div>
      {open ? (
        <div className="doc-preview">
          <div className="doc-preview-head">
            <span>{open.filename}</span>
            <button
              type="button"
              className="close-doc"
              onClick={() => setOpenFilename(null)}
            >
              收合
            </button>
          </div>
          <div className="md" dangerouslySetInnerHTML={{ __html: open.html }} />
        </div>
      ) : null}
    </section>
  );
}
