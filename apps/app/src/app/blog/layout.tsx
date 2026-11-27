import type { Metadata } from "next";
import { BlogHeader } from "~/components/blog/blog-chrome";

export const metadata: Metadata = {
  title: {
    default: "Журнал — 3D Бирка",
    template: "%s — 3D Бирка",
  },
};

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <div className="[background:radial-gradient(ellipse_at_85%_8%,#dce2d366,transparent_34%),#f5f1e8] text-ink font-craft text-[18px] leading-[1.55] overflow-clip isolate before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:opacity-[.035] before:z-[30] before:bg-grain [&_button]:cursor-pointer [&_button]:touch-manipulation [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[.6] [&_button:focus-visible]:[outline:3px_solid_#c87d55] [&_button:focus-visible]:outline-offset-[5px] [&_input:focus-visible]:[outline:3px_solid_#b86b43] [&_input:focus-visible]:outline-offset-[3px] [&_textarea:focus-visible]:[outline:3px_solid_#b86b43] [&_textarea:focus-visible]:outline-offset-[3px] [&_h1]:font-display [&_h1]:font-medium [&_h2]:font-display [&_h2]:font-medium [&_h3]:font-display [&_h3]:font-medium [&_section[id]]:scroll-mt-[118px] [&_a:focus-visible]:[outline:3px_solid_#c87d55] [&_a:focus-visible]:outline-offset-[5px] [&_svg]:shrink-0 flex min-h-[100svh] flex-col">
      <BlogHeader />
      {children}
    </div>
  );
}
