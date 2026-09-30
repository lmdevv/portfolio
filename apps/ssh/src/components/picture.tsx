import { TextAttributes, type ImageFit } from "@opentui/core";
import { useEffect, useState } from "react";
import { loadImage, type LoadedImage } from "../content/images.ts";
import { useApp } from "../state.tsx";
import { theme } from "../theme.ts";
import "./ascii-image.tsx";

type PictureProps = {
  /** Embedded image path; when missing, the alt text is shown instead. */
  path: string | undefined;
  alt: string;
  width: number;
  maxHeight?: number;
  /** Force a cell aspect (width / height in cells) instead of the image's own, e.g. 2 for a square. */
  cellAspect?: number;
  fit?: ImageFit;
  caption?: boolean;
};

function size(image: LoadedImage | null, props: PictureProps) {
  const aspect = props.cellAspect ?? (image ? (image.width / image.height) * 2 : 2);
  let width = props.width;
  let height = Math.max(1, Math.round(width / aspect));
  if (props.maxHeight && height > props.maxHeight) {
    height = props.maxHeight;
    width = Math.max(1, Math.round(height * aspect));
  }
  return { width, height };
}

/**
 * An image that degrades gracefully: Kitty/Sixel graphics, then Unicode blocks, then ASCII art,
 * then a bordered alt-text card. The active mode is user-selectable with `i`.
 */
export function Picture(props: PictureProps) {
  const { imageMode } = useApp();
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(!props.path);
    if (!props.path) return;
    loadImage(props.path).then(
      (loaded) => !cancelled && setImage(loaded),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [props.path]);

  const { width, height } = size(image, props);
  const showCaption = props.caption !== false && props.alt.trim() !== "";

  if (imageMode === "alt" || failed) {
    return <AltText alt={props.alt} width={Math.min(props.width, 60)} />;
  }

  return (
    <box flexDirection="column" flexShrink={0} alignSelf="flex-start">
      {!image ? (
        <box width={width} height={height} justifyContent="center" alignItems="center" backgroundColor={theme.surface}>
          <text fg={theme.subtle}>loading image…</text>
        </box>
      ) : imageMode === "ascii" ? (
        <ascii-image source={image.bytes} width={width} height={height} />
      ) : (
        <image
          source={image.bytes}
          protocol={imageMode === "blocks" ? "blocks" : "auto"}
          fit={props.fit ?? "fit"}
          width={width}
          height={height}
          onError={() => setFailed(true)}
        />
      )}
      {showCaption && (
        <text fg={theme.subtle} attributes={TextAttributes.ITALIC} width={width}>
          {props.alt}
        </text>
      )}
    </box>
  );
}

function AltText(props: { alt: string; width: number }) {
  return (
    <box
      border
      borderStyle="rounded"
      borderColor={theme.faint}
      title=" image "
      paddingX={1}
      width={props.width}
      flexShrink={0}
      alignSelf="flex-start"
    >
      <text fg={theme.muted} attributes={TextAttributes.ITALIC}>
        {props.alt.trim() || "Image without a description"}
      </text>
    </box>
  );
}
