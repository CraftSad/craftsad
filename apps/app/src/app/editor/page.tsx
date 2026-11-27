import type { Metadata } from "next";
import { EditorPage } from "~/editor/page-client";

export const metadata: Metadata = {
  title: "3D-редактор бирок — 3D Бирка",
  description:
    "Настройте садовую бирку в 3D и скачайте файл для печати на QIDI Plus 5: форма, надписи, шрифт, двухцветная печать и раскладка партии на столе.",
};

export default function EditorRoute() {
  return <EditorPage />;
}
