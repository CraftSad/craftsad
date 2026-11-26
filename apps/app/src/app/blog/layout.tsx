import type { Metadata } from "next";
import { BlogHeader } from "~/components/blog/blog-chrome";
import "~/app/blog.css";

export const metadata: Metadata = {
  title: {
    default: "Журнал — 3D Бирка",
    template: "%s — 3D Бирка",
  },
};

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <div className="birka-site blog-site">
      <BlogHeader />
      {children}
    </div>
  );
}
