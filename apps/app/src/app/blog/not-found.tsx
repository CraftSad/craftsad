import { paths } from "@acme/config";
import Link from "next/link";
import { blogHref, posts } from "~/components/blog/post-data";

export default function BlogNotFound() {
  const latest = posts.slice(0, 3);
  return (
    <main className="birka-container blog-notfound">
      <span className="blog-eyebrow">Страница не найдена</span>
      <h1>Такой заметки в журнале пока нет</h1>
      <p>
        Возможно, статья была перенесена или в адресе опечатка. Вот три свежие
        выпуска журнала:
      </p>
      <ul className="blog-notfound-list">
        {latest.map((post) => (
          <li key={post.slug}>
            <Link href={blogHref(post.slug)}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <Link
        href={paths.blog.root}
        className="birka-button birka-button-primary"
      >
        Весь журнал
      </Link>
    </main>
  );
}
