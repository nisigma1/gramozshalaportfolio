"use client";

import {
  type ImgHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type DiscloseImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  doorClassName?: string;
  vertical?: boolean;
  wrapperClassName?: string;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function DiscloseImage({
  alt,
  className,
  doorClassName,
  onLoad,
  vertical = false,
  wrapperClassName,
  ...props
}: DiscloseImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<number | null>(null);
  const hasStartedRevealRef = useRef(false);

  const startReveal = useCallback(() => {
    if (hasStartedRevealRef.current) return;
    hasStartedRevealRef.current = true;
    setImageLoaded(true);

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = window.requestAnimationFrame(() => {
        setRevealed(true);
      });
    });
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      startReveal();
    }

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [startReveal]);

  const handleLoad: ImgHTMLAttributes<HTMLImageElement>["onLoad"] = (event) => {
    startReveal();
    onLoad?.(event);
  };

  return (
    <div
      className={classNames(
        "disclose-image",
        vertical ? "is-vertical" : "is-horizontal",
        imageLoaded && "is-loaded",
        revealed && "is-revealed",
        wrapperClassName,
      )}
    >
      {/* Direct image delivery avoids a runtime optimizer dependency. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        alt={alt ?? ""}
        onLoad={handleLoad}
        {...props}
        className={classNames("disclose-image-media", className)}
      />
      <span
        className={classNames(
          "disclose-door disclose-door-start",
          doorClassName,
        )}
        aria-hidden="true"
      />
      <span
        className={classNames(
          "disclose-door disclose-door-end",
          doorClassName,
        )}
        aria-hidden="true"
      />
    </div>
  );
}
