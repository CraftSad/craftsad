import { paths } from "@acme/config";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactLink } from "~/components/3dbirka/contact-link";
import { BlogFooter } from "~/components/blog/blog-chrome";
import { PostBody } from "~/components/blog/post-body";
import {
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

/** Neutral placeholder while the URL-specific article streams in. */
function ArticleSkeleton() {
  return (
    <div className="birka-container blog-skeleton" aria-hidden="true">
      <span className="blog-skeleton-pill" />
      <span className="blog-skeleton-line is-title" />
      <span className="blog-skeleton-line is-lede" />
      <span className="blog-skeleton-cover" />
    </div>
  );
}

/**
 * Renders one article. `notFound()` must be called above this boundary: the
 * lookup is synchronous, so a throw inside `<Suspense>` would be swallowed
 * by the boundary instead of reaching the segment's `not-found.tsx`.
 * @see https://nextjs.org/docs/messages/instant-shell-url-data
 */
function BlogPostContent({ slug }: { slug: string }) {
  const post = getPost(slug) ?? posts[0];
  if (!post) throw new Error("Journal is empty: add at least one post");

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
        <header className="blog-post-hero">
          <div className="birka-container">
            <nav className="blog-crumbs" aria-label="Хлебные крошки">
              <Link href={paths.dashboard.root}>Магазин</Link>
              <span aria-hidden="true">/</span>
              <Link href={paths.blog.root}>Журнал</Link>
            </nav>
            <span className="blog-rubric blog-rubric-static">
              {post.rubric}
            </span>
            <h1>{post.title}</h1>
            <p className="blog-post-lede">{post.excerpt}</p>
            <p className="blog-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} мин чтения</span>
              <span aria-hidden="true">·</span>
              <span>Мастерская 3D Бирка</span>
            </p>
          </div>
        </header>
        <div className="birka-container blog-post-figure">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            priority
            sizes="(max-width: 1000px) 100vw, 1000px"
          />
        </div>
        <div className="birka-container blog-post-layout">
          <PostBody post={post} />
          <aside className="blog-post-aside">
            <div className="blog-aside-card">
              <strong>Собрать свои бирки</strong>
              <p>
                Внесите список сортов из статьи в конструктор — каждая строка
                станет отдельной биркой.
              </p>
              <Link
                href={`${paths.dashboard.root}#constructor`}
                className="birka-button birka-button-primary"
              >
                Открыть конструктор <ArrowRight />
              </Link>
              <ContactLink />
            </div>
          </aside>
        </div>
        <footer className="birka-container blog-post-footer">
          <nav className="blog-post-nav" aria-label="Соседние статьи">
            {older && (
              <Link href={postHref(older)} className="blog-post-nav-link">
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
                className="blog-post-nav-link is-next"
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
  if (!getPost(slug)) notFound();

  return (
    <>
      <Suspense fallback={<ArticleSkeleton />}>
        <BlogPostContent slug={slug} />
      </Suspense>
      <BlogFooter />
    </>
  );
}
