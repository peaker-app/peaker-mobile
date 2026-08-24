import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
};

const fillStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const Image = ({
  fill,
  priority: _priority,
  quality: _quality,
  unoptimized: _unoptimized,
  style,
  ...props
}: ImageProps) => (
  <img {...props} style={fill ? { ...fillStyle, ...style } : style} />
);

export default Image;
