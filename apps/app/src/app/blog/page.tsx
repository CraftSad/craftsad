import { paths } from "@acme/config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogFooter } from "~/components/blog/blog-chrome";
import {
  type BlogPost,
  type BlogRubric,
  formatDate,
  postHref,
  posts,
  RUBRIC_NOTES,
} from "~/components/blog/post-data";

export const metadata: Metadata = {
  description:
    "Журнал мастерской 3D Бирка: как подписать рассаду, выбрать форму и цвет бирки, навести порядок в семенах и сохранить имена сортов на все сезоны.",
  alternates: { canonical: paths.blog.root },
  openGraph: {
    title: "Журнал мастерской 3D Бирка",
    description:
      "Имена сортов, порядок на рассадном столе и в теплице — заметки мастерской 3D Бирка.",
    url: paths.blog.root,
    siteName: "3D Бирка",
    type: "website",
  },
};

const rubrics = Object.keys(RUBRIC_NOTES) as BlogRubric[];
const readingLabel = (minutes: number) =>
  minutes === 1 ? "1 минута" : `${minutes} мин`;

function PostCard({ post, lead = false }: { post: BlogPost; lead?: boolean }) {
  return (
    <article
      className={
        lead
          ? "flex flex-col overflow-hidden border border-solid border-[#e2ddd0] rounded-[22px] [background:#fffdf8b3] [transition:transform_0.35s,box-shadow_0.35s] hover:[transform:translateY(-4px)] hover:shadow-[0_18px_44px_#203c321a] grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[800px]:grid-cols-[minmax(0,1fr)]"
          : "flex flex-col overflow-hidden border border-solid border-[#e2ddd0] rounded-[22px] [background:#fffdf8b3] [transition:transform_0.35s,box-shadow_0.35s] hover:[transform:translateY(-4px)] hover:shadow-[0_18px_44px_#203c321a]"
      }
    >
      <Link
        href={postHref(post)}
        className="relative block overflow-hidden aspect-[3/2] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:[transition:transform_0.7s_cubic-bezier(0.2,0.7,0.2,1)] [&_img]:[transform:scale(1.04)]"
        tabIndex={-1}
      >
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          sizes={
            lead
              ? "(max-width: 900px) 100vw, 760px"
              : "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 400px"
          }
          priority={lead}
        />
        <span className="inline-flex items-center py-[6px] px-[13px] border border-solid border-[#c8b58b66] rounded-full [background:#fffef7d9] text-forest text-[12px] font-bold tracking-[0.06em] leading-[1.2] whitespace-nowrap [backdrop-filter:blur(8px)]">
          {post.rubric}
        </span>
      </Link>
      <div className="flex flex-[1] flex-col gap-[10px] pt-[22px] pr-[24px] pb-[24px] pl-[24px] max-[640px]:pt-[18px] max-[640px]:pr-[18px] max-[640px]:pb-[20px] max-[640px]:pl-[18px] [&_h3]:m-0 [&_h3]:text-[clamp(26px,2.6vw,34px)] [&_h3]:leading-[1.15] [&_h3]:tracking-[-0.02em] max-[640px]:[&_h3]:text-[22px]">
        <p className="flex flex-wrap items-center gap-[8px] m-0 text-hedge text-[13px]">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingLabel(post.readingTime)}</span>
        </p>
        <h3>
          <Link href={postHref(post)}>{post.title}</Link>
        </h3>
        <p className="m-0 text-hedge text-[15px] leading-[1.65]">
          {post.excerpt}
        </p>
        <span className="mt-auto pt-[6px] text-[var(--brass)] text-[14px] font-semibold">
          Читать статью
        </span>
      </div>
    </article>
  );
}

export default function BlogIndexPage() {
  const latest = posts[0];
  // The journal always has posts; `posts` is a static module constant.
  if (!latest) throw new Error("Journal is empty: add at least one post");
  const rest = posts.slice(1);

  return (
    <>
      <main className="flex-[1]">
        <section className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center gap-[clamp(32px,6vw,88px)] py-[clamp(48px,7vw,96px)] max-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] max-[1000px]:gap-[36px] max-[800px]:grid-cols-[minmax(0,1fr)] max-[800px]:gap-[30px]">
          <div className="[&_h1]:mt-[18px] [&_h1]:mb-[20px] [&_h1]:text-[clamp(40px,5vw,68px)] [&_h1]:leading-[1.04] [&_h1]:tracking-[-0.035em] [&>p]:max-w-[520px] [&>p]:m-0 [&>p]:text-hedge [&>p]:text-[18px] [&>p]:leading-[1.7] max-[640px]:[&_h1]:text-[clamp(36px,10vw,50px)] max-[640px]:[&>p]:text-[16px]">
            <span className="inline-flex items-center gap-[10px] text-[var(--brass)] text-[12px] font-bold tracking-[0.16em] uppercase before:content-[''] before:w-[28px] before:h-[1px] before:[background:var(--brass)]">
              Журнал мастерской
            </span>
            <h1>
              Имена, которые <em>переживают</em> сезон
            </h1>
            <p>
              Заметки о том, как навести порядок в семенах, подписать рассаду и
              сохранить имя каждого сорта — от подоконника до теплицы.
            </p>
            <ul
              className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[12px] mt-[34px] p-0 list-none max-[640px]:grid-cols-[minmax(0,1fr)] [&_li]:flex [&_li]:flex-col [&_li]:items-start [&_li]:gap-[8px] [&_li]:py-[14px] [&_li]:px-[16px] [&_li]:border [&_li]:border-solid [&_li]:border-[#dcd8ca] [&_li]:rounded-[16px] [&_li]:[background:#fffdf8b3] [&_small]:text-hedge [&_small]:text-[13px] [&_small]:leading-[1.45]"
              aria-label="Рубрики журнала"
            >
              {rubrics.map((rubric) => (
                <li key={rubric}>
                  <span className="inline-flex items-center py-[6px] px-[13px] border border-solid border-[#c8b58b66] rounded-full [background:#fffef7d9] text-forest text-[12px] font-bold tracking-[0.06em] leading-[1.2] whitespace-nowrap [backdrop-filter:blur(8px)] mb-[14px]">
                    {rubric}
                  </span>
                  <small>{RUBRIC_NOTES[rubric]}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[26px_26px_26px_6px] aspect-[662/700] shadow-[0_24px_60px_#203c3226] max-[800px]:max-w-[420px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover">
            <Image
              src="/images/blog/photo-garden.jpg"
              alt="Хвойная и терракотовая бирки в грядке мастерской на закате"
              width={662}
              height={700}
              priority
            />
            <span
              className="absolute right-[16px] bottom-[14px] py-[7px] px-[14px] rounded-full [background:#152e26d9] text-[var(--brass-soft)] font-[500] text-[13px] leading-[1] font-display tracking-[0.12em]"
              aria-hidden="true"
            >
              3D
            </span>
          </div>
        </section>

        <section
          className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]"
          aria-labelledby="blog-latest"
        >
          <h2
            id="blog-latest"
            className="mb-[26px] text-[clamp(30px,3.2vw,42px)]"
          >
            Свежий выпуск
          </h2>
          <PostCard post={latest} lead />
        </section>

        <section
          className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]"
          aria-labelledby="blog-archive"
        >
          <h2
            id="blog-archive"
            className="mb-[26px] text-[clamp(30px,3.2vw,42px)]"
          >
            Все заметки
          </h2>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[28px] max-[640px]:grid-cols-[minmax(0,1fr)]">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
      <BlogFooter />
    </>
  );
}
