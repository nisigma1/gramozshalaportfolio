"use client";

import {
  type ImgHTMLAttributes,
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
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  const handleLoad: ImgHTMLAttributes<HTMLImageElement>["onLoad"] = (event) => {
    setImageLoaded(true);
    onLoad?.(event);
  };

  return (
    <div
      className={classNames(
        "disclose-image",
        vertical ? "is-vertical" : "is-horizontal",
        imageLoaded && "is-loaded",
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
