"use client";

import { useRef, useState } from "react";

function isMarkdownFile(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".md")) return true;
  if (file.type === "text/markdown") return true;
  return false;
}

export function DocUploadForm({
  action,
  sectionId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  sectionId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  function applyFile(file: File) {
    if (!isMarkdownFile(file)) {
      setClientError(`只接受 .md 檔，這個是「${file.name}」。`);
      setPickedName(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setClientError(null);
    setPickedName(file.name);
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (files.length > 1) {
      setClientError(`一次只能上傳一份，已採用第一份：${file.name}`);
    }
    applyFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPickedName(null);
      return;
    }
    applyFile(file);
  }

  return (
    <form action={action} className="admin-form admin-doc-upload">
      <div className="row">
        <label
          htmlFor={`${sectionId}-file`}
          className={`admin-dropzone${dragOver ? " is-drag-over" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <span className="admin-dropzone-title">上傳 Markdown 檔</span>
          <span className="admin-dropzone-hint">
            拖曳 <code>.md</code> 檔到此，或點擊選擇檔案
          </span>
          {pickedName ? (
            <span className="admin-dropzone-picked">已選：{pickedName}</span>
          ) : null}
          <input
            ref={inputRef}
            id={`${sectionId}-file`}
            name="file"
            type="file"
            accept=".md,text/markdown"
            required
            onChange={onChange}
            className="admin-dropzone-input"
          />
        </label>
        {clientError ? (
          <p className="admin-dropzone-error">{clientError}</p>
        ) : null}
        <p className="help">
          檔名規則：lowercase 英數、底線、點、hyphen，須以 .md 結尾。同名會覆蓋。
        </p>
      </div>
      <div className="row">
        <label htmlFor={`${sectionId}-title`}>標題（選填）</label>
        <input
          id={`${sectionId}-title`}
          name="title"
          type="text"
          placeholder="留空則用檔名（去掉 .md）"
        />
      </div>
      <div className="row">
        <label htmlFor={`${sectionId}-sort`}>排序（選填）</label>
        <input
          id={`${sectionId}-sort`}
          name="sort_order"
          type="number"
          step={1}
          placeholder="留空則接在最後面"
        />
      </div>
      <div className="admin-actions">
        <button type="submit" className="btn-primary">上傳</button>
      </div>
    </form>
  );
}
