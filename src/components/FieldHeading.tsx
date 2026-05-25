// 欄位標題——採用 Claude Design 變體 A：small caps + accent + thin underline.
export function FieldHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="field-heading-a">{children}</h3>;
}
