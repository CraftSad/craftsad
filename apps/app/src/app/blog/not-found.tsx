import { paths } from "@acme/config";
import Link from "next/link";
import { blogHref, posts } from "~/components/blog/post-data";

export default function BlogNotFound() {
  const latest = posts.slice(0, 3);
  return (
    <main className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] py-[clamp(48px,8vw,110px)] [&_h1]:max-w-[720px] [&_h1]:mt-[18px] [&_h1]:mb-[16px] [&_h1]:text-[clamp(32px,4vw,52px)] [&_h1]:leading-[1.08] [&_h1]:tracking-[-0.03em] [&_p]:max-w-[560px] [&_p]:mb-[24px] [&_p]:text-hedge [&_p]:text-[17px] [&_p]:leading-[1.7]">
      <span className="inline-flex items-center gap-[10px] text-[var(--brass)] text-[12px] font-bold tracking-[0.16em] uppercase before:content-[''] before:w-[28px] before:h-[1px] before:[background:var(--brass)]">
        Страница не найдена
      </span>
      <h1>Такой заметки в журнале пока нет</h1>
      <p>
        Возможно, статья была перенесена или в адресе опечатка. Вот три свежие
        выпуска журнала:
      </p>
      <ul className="flex flex-col gap-[10px] mb-[30px] p-0 list-none [&_a]:inline-block [&_a]:py-[14px] [&_a]:px-[18px] [&_a]:border [&_a]:border-solid [&_a]:border-[#dcd8ca] [&_a]:rounded-[14px] [&_a]:[background:#fffdf8b3] [&_a]:text-ink [&_a]:text-[16px] [&_a]:font-semibold [&_a]:no-underline [&_a:hover]:border-[var(--brass)] [&_a:hover]:text-forest">
        {latest.map((post) => (
          <li key={post.slug}>
            <Link href={blogHref(post.slug)}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <Link
        href={paths.blog.root}
        className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
      >
        Весь журнал
      </Link>
    </main>
  );
}
