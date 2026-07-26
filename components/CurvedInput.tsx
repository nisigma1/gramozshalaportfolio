"use client";

import { useId, useRef, useState } from "react";

type CurvedInputProps = {
  defaultValue?: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit?: (value: string) => void;
  submitHref?: string;
  className?: string;
};

export function CurvedInput({
  defaultValue = "",
  placeholder = "Enter your email",
  buttonText = "Send email",
  onSubmit,
  submitHref,
  className = "",
}: CurvedInputProps) {
  const id = useId().replace(/:/g, "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const textPathId = `curved-text-${id}`;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.(value);
    if (submitHref) window.location.href = submitHref;
  };

  return (
    <form className={`curved-input ${focused ? "is-focused" : ""} ${className}`} onSubmit={submit}>
      <svg className="curved-input-svg" viewBox="0 0 720 92" role="presentation" aria-hidden="true">
        <defs>
          <path id={textPathId} d="M 35 49 Q 275 4 492 42" />
        </defs>
        <rect className="curved-input-shell" x="1.5" y="15" width="717" height="62" rx="31" />
        <path className="curved-input-accent" d="M 35 49 Q 275 4 492 42" />
        <text className="curved-input-text">
          <textPath href={`#${textPathId}`} startOffset="0%">
            {value || placeholder}
          </textPath>
        </text>
        <rect className="curved-input-button" x="535" y="22" width="169" height="48" rx="24" />
        <text className="curved-input-button-label" x="619" y="52" textAnchor="middle">{buttonText}</text>
      </svg>
      <label className="sr-only" htmlFor={`curved-email-${id}`}>{placeholder}</label>
      <input
        ref={inputRef}
        id={`curved-email-${id}`}
        className="curved-input-field"
        type="email"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={placeholder}
        autoComplete="email"
      />
      <button className="curved-input-hit-area" type="submit" aria-label={buttonText} />
    </form>
  );
}
