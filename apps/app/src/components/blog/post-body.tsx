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
        <aside className="py-[24px] px-[26px] border border-solid border-[#b5965c4d] rounded-[22px] [background:linear-gradient(155deg,#214439,#152e26)] text-[#f4f1e7] max-[640px]:p-[20px] [&_strong]:flex [&_strong]:items-center [&_strong]:gap-[10px] [&_strong]:mb-[14px] [&_strong]:font-display [&_strong]:text-[22px] [&_strong]:font-medium [&_ul]:gap-[9px] [&_li]:text-[#cbd5c7] [&_li]:text-[15px] [&_li]:leading-[1.6] [&_li]:pl-[22px] [&_li::before]:top-[0.7em] [&_li::before]:left-[2px] [&_li::before]:w-[6px] [&_li::before]:h-[6px] [&_li::before]:[background:var(--brass-soft)]">
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
      return (
        <blockquote className="my-[6px] mx-[0] pt-[6px] pb-[6px] pl-[24px] border-left-[2px] border-left-[var(--brass)] text-ink font-display text-[clamp(21px,2.2vw,26px)] italic leading-[1.45]">
          {block.text}
        </blockquote>
      );
    case "image":
      return (
        <figure className="my-[10px] mx-[0] [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-[20px_20px_20px_5px] [&_figcaption]:mt-[10px] [&_figcaption]:text-hedge [&_figcaption]:text-[13px] [&_figcaption]:italic">
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
    <div className="flex flex-col gap-[22px] text-[#33453b] text-[17px] leading-[1.8] max-[640px]:text-[16px] [&_h2]:mt-[18px] [&_h2]:text-[clamp(26px,2.6vw,34px)] [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_p]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[10px] [&_ul]:m-0 [&_ul]:p-0 [&_ul]:list-none">
      {post.blocks.map((block) => (
        <Block key={blockKey(block)} block={block} />
      ))}
    </div>
  );
}
