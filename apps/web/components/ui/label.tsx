import * as React from "react";
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-sm text-foreground ${props.className ?? ""}`} {...props} />;
}

