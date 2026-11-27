"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { reveal } from "./shared";

export function HowSection() {
  return (
    <motion.section
      id="how"
      className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] [background:transparent] pt-[65px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
    >
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <div className="flex justify-between items-center gap-[50px] mb-[36px] max-[570px]:block max-[570px]:mb-[26px] max-[800px]:flex max-[800px]:gap-[24px] [&>p]:max-w-[370px] [&>p]:text-[#b0bdb2] [&>p]:text-[15px] [&>p]:mb-[5px] [&>p]:leading-[1.8] max-[800px]:[&>p]:mt-[18px] max-[800px]:[&>p]:text-[13px] max-[800px]:[&>p]:m-0 max-[800px]:[&>p]:max-w-[240px] max-[570px]:[&>p]:text-[15px] max-[570px]:[&>p]:mt-[18px] max-[570px]:[&>p]:max-w-none">
          <h2>
            Природа меняется.
            <br />
            <em>Имена остаются.</em>
          </h2>
          <p>
            Продумали каждую деталь, чтобы вы
            <br />
            просто наслаждались своим садом.
          </p>
        </div>
        <div className="grid grid-cols-[1.45fr_1fr_1fr] gap-[18px] max-[570px]:gap-[12px] max-[570px]:grid-cols-[1fr] max-[800px]:grid-cols-[1fr_1fr] [&_article]:min-h-[348px] [&_article]:rounded-[25px] [&_article]:overflow-hidden [&_article]:relative [&_article]:flex [&_article]:flex-col [&_article]:justify-between [&_article]:p-[30px] [&_h3]:text-[29px] [&_h3]:leading-[1.08] [&_h3]:mb-[12px] [&_h3]:tracking-[-.02em] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:m-0 [&_p]:text-hedge max-[1150px]:[&_article]:p-[24px] max-[1150px]:[&_article]:min-h-[320px] max-[1150px]:[&_h3]:text-[26px] max-[1150px]:[&_p]:text-[12px] max-[800px]:[&_article]:min-h-[280px] max-[800px]:[&_h3]:text-[31px] max-[800px]:[&_p]:text-[14px] max-[570px]:[&_article]:min-h-[270px] max-[570px]:[&_h3]:text-[31px] max-[570px]:[&_p]:text-[16px]">
          <motion.article
            variants={reveal}
            whileHover={{ y: -4 }}
            className="[background:#22372b] text-[#fff] max-[570px]:col-[auto] max-[800px]:col-[1/-1] max-[800px]:min-h-[280px] [&_p]:text-[#e2e9da]"
          >
            <div className="absolute inset-0 [background:linear-gradient(0deg,#14271bf2,transparent),url(/images/3dbirka-garden.png)center/cover] opacity-[.8] max-[800px]:[background-position:center_62%]" />
            <div className="relative mt-auto [&>svg]:mb-[24px] [&>svg]:w-[30px] [&>svg]:h-[30px]">
              <ShieldCheck />
              <h3>
                Не выгорают на солнце.
                <br />
                Не боятся дождя.
              </h3>
              <p>Прочный пластик для жизни под открытым небом.</p>
            </div>
          </motion.article>
          <motion.article
            variants={reveal}
            whileHover={{ y: -4 }}
            className="[background:#e8e8dc] max-[570px]:min-h-[245px]"
          >
            <div className="font-[600] text-[48px] font-display tracking-[-.04em] text-[#5d7154] [text-shadow:1px_2px_#fff,3px_5px_3px_#47543b35] [transform:rotate(-8deg)] py-[22px] px-[0] max-[1150px]:text-[39px] max-[570px]:text-[55px] max-[570px]:py-[8px] max-[570px]:px-[0] [&_span]:block [&_span]:text-[9px] [&_span]:font-craft [&_span]:tracking-[.15em] [&_span]:[text-shadow:none] [&_span]:mt-[9px]">
              Базилик<span>ОБЪЁМ ИМЕЕТ ЗНАЧЕНИЕ</span>
            </div>
            <div>
              <h3>Читаются за метр</h3>
              <p>
                Буквы напечатаны вместе с биркой.
                <br />
                Надпись не сотрётся со временем.
              </p>
            </div>
          </motion.article>
          <motion.article
            variants={reveal}
            whileHover={{ y: -4 }}
            className="[background:#ebe1d5] max-[570px]:min-h-[245px]"
          >
            <div className="font-[500] text-[108px] leading-[.85] font-display text-[#996343] flex items-end gap-[8px] py-[13px] px-[0] max-[570px]:text-[90px] max-[570px]:p-0 [&_span]:italic [&_span]:text-[30px] [&_span]:font-display [&_span]:mb-[8px] [&_svg]:ml-auto [&_svg]:mb-[12px] [&_svg]:opacity-[.6] [&_svg]:w-[32px] [&_svg]:h-[32px]">
              2<span>дня</span>
              <ArrowRight />
            </div>
            <div>
              <h3>И уже на пути к вам</h3>
              <p>
                Напечатаем ваш набор и отправим
                <br />в удобный пункт Ozon.
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </motion.section>
  );
}
