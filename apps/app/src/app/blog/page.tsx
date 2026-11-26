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
    <article className={lead ? "blog-card blog-card-lead" : "blog-card"}>
      <Link href={postHref(post)} className="blog-card-media" tabIndex={-1}>
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
        <span className="blog-rubric">{post.rubric}</span>
      </Link>
      <div className="blog-card-body">
        <p className="blog-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingLabel(post.readingTime)}</span>
        </p>
        <h3>
          <Link href={postHref(post)}>{post.title}</Link>
        </h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <span className="blog-card-more">Читать статью</span>
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
      <main className="blog-main">
        <section className="birka-container blog-hero">
          <div className="blog-hero-copy">
            <span className="blog-eyebrow">Журнал мастерской</span>
            <h1>
              Имена, которые <em>переживают</em> сезон
            </h1>
            <p>
              Заметки о том, как навести порядок в семенах, подписать рассаду и
              сохранить имя каждого сорта — от подоконника до теплицы.
            </p>
            <ul className="blog-rubrics" aria-label="Рубрики журнала">
              {rubrics.map((rubric) => (
                <li key={rubric}>
                  <span className="blog-rubric blog-rubric-static">
                    {rubric}
                  </span>
                  <small>{RUBRIC_NOTES[rubric]}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className="blog-hero-art">
            <Image
              src="/images/blog/photo-garden.jpg"
              alt="Хвойная и терракотовая бирки в грядке мастерской на закате"
              width={662}
              height={700}
              priority
            />
            <span className="blog-hero-stamp" aria-hidden="true">
              3D
            </span>
          </div>
        </section>

        <section className="birka-container" aria-labelledby="blog-latest">
          <h2 id="blog-latest" className="blog-section-title">
            Свежий выпуск
          </h2>
          <PostCard post={latest} lead />
        </section>

        <section className="birka-container" aria-labelledby="blog-archive">
          <h2 id="blog-archive" className="blog-section-title">
            Все заметки
          </h2>
          <div className="blog-grid">
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
