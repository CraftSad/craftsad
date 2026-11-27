import { paths } from "@acme/config";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactLink } from "~/components/3dbirka/contact-link";
import { BlogFooter } from "~/components/blog/blog-chrome";
import { PostBody } from "~/components/blog/post-body";
import {
  type BlogPost,
  formatDate,
  getPost,
  postHref,
  posts,
} from "~/components/blog/post-data";
import "~/app/blog.css";

/**
 * An unknown slug must answer with a real 404, so `notFound()` is called in
 * the page itself. A throw inside `<Suspense>` is swallowed by the boundary,
 * and the lookup is synchronous (no await to let the boundary resolve first),
 * so this segment opts out of instant-navigation validation instead.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant
 */
export const instant = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: "Статья не найдена — 3D Бирка" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: postHref(post) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postHref(post),
      siteName: "3D Бирка",
      type: "article",
      publishedTime: post.date,
      authors: ["3D Бирка"],
      images: [
        {
          url: post.cover.src,
          width: post.cover.width,
          height: post.cover.height,
          alt: post.cover.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover.src],
    },
  };
}

/** Renders one article; the page has already validated the slug. */
function BlogPostContent({ post }: { post: BlogPost }) {
  const index = posts.findIndex((item) => item.slug === post.slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];

  // React escapes `<` in a string child, so no raw HTML is injected.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: [post.cover.src],
    inLanguage: "ru-RU",
    author: { "@type": "Organization", name: "3D Бирка" },
    publisher: { "@type": "Organization", name: "3D Бирка" },
    mainEntityOfPage: postHref(post),
  });

  return (
    <>
      <script type="application/ld+json">{jsonLd}</script>
      <article className="blog-post">
        <header className="py-[36px_32px] [&_h1]:max-w-[900px] [&_h1]:mb-[18px] [&_h1]:text-[clamp(34px,4.4vw,60px)] [&_h1]:leading-[1.06] [&_h1]:tracking-[-0.03em] max-[640px]:[&_h1]:text-[clamp(30px,8.6vw,40px)]">
          <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
            <nav
              className="flex flex-wrap items-center gap-[8px] mb-[26px] text-hedge text-[13px] [&_a]:text-hedge [&_a]:no-underline [&_a:hover]:text-forest [&_a:hover]:underline"
              aria-label="Хлебные крошки"
            >
              <Link href={paths.dashboard.root}>Магазин</Link>
              <span aria-hidden="true">/</span>
              <Link href={paths.blog.root}>Журнал</Link>
            </nav>
            <span className="inline-flex items-center py-[6px] px-[13px] border border-solid border-[#c8b58b66] rounded-full [background:#fffef7d9] text-forest text-[12px] font-bold tracking-[0.06em] leading-[1.2] whitespace-nowrap [backdrop-filter:blur(8px)] mb-[14px]">
              {post.rubric}
            </span>
            <h1>{post.title}</h1>
            <p className="max-w-[720px] mb-[18px] text-hedge text-[18px] leading-[1.7] max-[640px]:text-[16px]">
              {post.excerpt}
            </p>
            <p className="flex flex-wrap items-center gap-[8px] m-0 text-hedge text-[13px]">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} мин чтения</span>
              <span aria-hidden="true">·</span>
              <span>Мастерская 3D Бирка</span>
            </p>
          </div>
        </header>
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] overflow-hidden rounded-[26px_26px_26px_6px] shadow-[0_24px_60px_#203c3226] [&_img]:block [&_img]:w-full [&_img]:h-auto">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            priority
            sizes="(max-width: 1000px) 100vw, 1000px"
          />
        </div>
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] grid grid-cols-[minmax(0,720px)_minmax(0,1fr)] gap-[clamp(32px,5vw,72px)] items-start py-[clamp(36px,5vw,64px)] max-[1000px]:grid-cols-[minmax(0,1fr)]">
          <PostBody post={post} />
          <aside className="blog-post-aside">
            <div className="sticky top-[24px] flex flex-col gap-[14px] p-[26px] border border-solid border-[#dcd8ca] rounded-[22px] [background:#fffdf8d9] max-[1000px]:static [&_strong]:font-display [&_strong]:text-[24px] [&_strong]:font-medium [&_strong]:text-ink [&_p]:m-0 [&_p]:text-hedge [&_p]:text-[15px] [&_p]:leading-[1.65]">
              <strong>Собрать свои бирки</strong>
              <p>
                Внесите список сортов из статьи в конструктор — каждая строка
                станет отдельной биркой.
              </p>
              <Link
                href={`${paths.dashboard.root}#constructor`}
                className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
              >
                Открыть конструктор <ArrowRight />
              </Link>
              <ContactLink />
            </div>
          </aside>
        </div>
        <footer className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] py-[8px_56px]">
          <nav
            className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[16px] pt-[32px] border-top-[1px] border-top-[#dcd8ca] max-[800px]:grid-cols-[minmax(0,1fr)]"
            aria-label="Соседние статьи"
          >
            {older && (
              <Link
                href={postHref(older)}
                className="flex items-center gap-[14px] py-[20px] px-[22px] border border-solid border-[#dcd8ca] rounded-[18px] text-ink text-[16px] font-semibold leading-[1.35] no-underline [transition:border-color_0.2s,background_0.2s] justify-end text-right hover:border-[var(--brass)] hover:[background:#fffdf8] max-[800px]:justify-start max-[800px]:text-left [&_small]:block [&_small]:mb-[4px] [&_small]:text-[var(--brass)] [&_small]:text-[12px] [&_small]:font-bold [&_small]:tracking-[0.08em] [&_small]:uppercase [&_svg]:shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:text-[var(--brass)]"
              >
                <ArrowLeft aria-hidden="true" />
                <span>
                  <small>Ранее</small>
                  {older.title}
                </span>
              </Link>
            )}
            {newer && (
              <Link
                href={postHref(newer)}
                className="flex items-center gap-[14px] py-[20px] px-[22px] border border-solid border-[#dcd8ca] rounded-[18px] text-ink text-[16px] font-semibold leading-[1.35] no-underline [transition:border-color_0.2s,background_0.2s] justify-end text-right hover:border-[var(--brass)] hover:[background:#fffdf8] max-[800px]:justify-start max-[800px]:text-left [&_small]:block [&_small]:mb-[4px] [&_small]:text-[var(--brass)] [&_small]:text-[12px] [&_small]:font-bold [&_small]:tracking-[0.08em] [&_small]:uppercase [&_svg]:shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:text-[var(--brass)] is-next"
              >
                <span>
                  <small>Далее</small>
                  {newer.title}
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </nav>
        </footer>
      </article>
    </>
  );
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <BlogPostContent post={post} />
      <BlogFooter />
    </>
  );
}
