import { Lightbulb } from "lucide-react";
import Image from "next/image";
import type { BlogBlock, BlogPost } from "./post-data";

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return <h2>{block.text}</h2>;
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "tips":
      return (
        <aside className="blog-tips">
          <strong>
            <Lightbulb aria-hidden="true" />
            {block.title}
          </strong>
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      );
    case "quote":
      return <blockquote className="blog-quote">{block.text}</blockquote>;
    case "image":
      return (
        <figure className="blog-figure">
          <Image
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            sizes="(max-width: 760px) 100vw, 720px"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
  }
}

/** Stable key per block: its type plus the text or image it renders. */
function blockKey(block: BlogBlock): string {
  switch (block.type) {
    case "image":
      return `image:${block.src}:${block.alt}`;
    case "list":
    case "tips":
      return `${block.type}:${block.items.join("|")}`;
    case "heading":
    case "quote":
      return `${block.type}:${block.text}`;
    case "paragraph":
      return `paragraph:${block.text}`;
  }
}

export function PostBody({ post }: { post: BlogPost }) {
  return (
    <div className="blog-article-body">
      {post.blocks.map((block) => (
        <Block key={blockKey(block)} block={block} />
      ))}
    </div>
  );
}
