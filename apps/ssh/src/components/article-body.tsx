import { lexer, type Token } from "marked";
import { useMemo } from "react";
import type { Article } from "../content/types.ts";
import { markdownStyle } from "../theme.ts";
import { Picture } from "./picture.tsx";

type Block = { kind: "markdown"; content: string } | { kind: "image"; src: string; alt: string };

function isImageOnly(token: Token): token is Token & { tokens: Token[] } {
  if (token.type !== "paragraph" || !("tokens" in token) || !token.tokens) return false;
  const children = token.tokens as Token[];
  return (
    children.some((child) => child.type === "image") &&
    children.every(
      (child) =>
        child.type === "image" ||
        child.type === "br" ||
        (child.type === "text" && !child.raw.trim()),
    )
  );
}

/**
 * Splits a post into markdown runs and standalone images, so images can be real terminal
 * graphics while prose keeps OpenTUI's markdown rendering.
 */
function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let pending = "";
  const flush = () => {
    if (pending.trim()) blocks.push({ kind: "markdown", content: pending.trim() });
    pending = "";
  };

  for (const token of lexer(body)) {
    if (isImageOnly(token)) {
      flush();
      for (const child of token.tokens) {
        if (child.type === "image")
          blocks.push({ kind: "image", src: child.href, alt: child.text });
      }
    } else {
      pending += token.raw;
    }
  }
  flush();

  return blocks;
}

export function ArticleBody(props: { article: Article; width: number }) {
  const blocks = useMemo(() => toBlocks(props.article.body), [props.article.body]);

  return (
    <box flexDirection="column" gap={1} width={props.width}>
      {blocks.map((block, index) =>
        block.kind === "markdown" ? (
          <markdown
            key={index}
            content={block.content}
            syntaxStyle={markdownStyle}
            width={props.width}
          />
        ) : (
          <Picture
            key={index}
            path={props.article.images[block.src]}
            alt={block.alt}
            width={Math.min(props.width, 90)}
            maxHeight={28}
          />
        ),
      )}
    </box>
  );
}
