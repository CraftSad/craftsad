"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Leaf, Truck } from "lucide-react";
import { reveal } from "./shared";
import { LabelPreview } from "./ui";

const heroTags = [
  { color: 1, name: "БАЗИЛИК\nЗелёный аромат" },
  { color: 0, name: "ТОМАТ\nБычье сердце" },
  { color: 2, name: "КЛУБНИКА\nЕлизавета" },
];

export function HeroSection({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <section className="relative min-h-[790px] [background:transparent] text-ink block items-center pt-[142px] overflow-hidden max-[1100px]:min-h-[650px] max-[1150px]:min-h-[730px] max-[1150px]:pt-[130px] max-[570px]:min-h-[670px] max-[570px]:pt-[105px] max-[800px]:min-h-0 max-[800px]:items-end max-[800px]:pt-[110px] min-[1500px]:pt-[170px] min-[1500px]:min-h-[860px] [&_h1]:[font-family:Georgia,serif] [&_h1]:font-normal [&_h1]:tracking-[-.048em] [&_h1]:leading-[1.06] [&_h1]:text-[clamp(44px,4.6vw,69px)] [&_h1]:mt-[25px] [&_h1]:mb-[27px] [&_h1]:max-w-none max-[800px]:[&_h1]:text-[45px] max-[570px]:[&_h1]:text-[clamp(37px,9.5vw,51px)] max-[570px]:[&_h1]:leading-[1.04] max-[570px]:[&_h1]:my-[23px] max-[570px]:[&_h1]:mx-[0] max-[1150px]:[&_h1]:text-[55px]">
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] grid grid-cols-[1.05fr_1fr] gap-[12px] items-center max-[1150px]:grid-cols-[1.1fr_1fr] max-[570px]:grid-cols-[1fr] max-[800px]:grid-cols-[1fr_1fr] max-[800px]:gap-[0]">
        <motion.div
          className="relative z-[2] pt-[30px] pb-[38px] max-[570px]:pt-[15px] [&>p]:text-[16px] [&>p]:leading-[1.85] [&>p]:text-hedge [&>p]:m-0 [&>p]:max-w-[440px] max-[800px]:[&>p]:text-[14px] max-[570px]:[&>p]:text-[16px] max-[570px]:[&>p]:leading-[1.8]"
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <motion.div
            variants={reveal}
            className="flex items-center gap-[12px] text-[#596653] text-[11px] tracking-[.12em] font-medium max-[570px]:text-[9px] max-[570px]:tracking-[.07em] max-[570px]:gap-[8px] max-[800px]:text-[10px] [&>span]:h-[7px] [&>span]:w-[7px] [&>span]:[background:#a57d46] [&>span]:rounded-[1px] [&>span]:[transform:rotate(45deg)]"
          >
            <span /> 3D Бирка · предметы для любимого сада
          </motion.div>
          <motion.h1 variants={reveal}>
            У каждого растения
            <br />— своё имя
            <br />
            <em>и своя история</em>
            <span className="text-brass">.</span>
          </motion.h1>
          <motion.p variants={reveal}>
            Создаём садовые бирки с объёмными буквами.
            <br />
            Ваши сорта, любимые оттенки и детали,
            <br /> которые делают сад по-настоящему вашим.
          </motion.p>
          <motion.div
            variants={reveal}
            className="flex gap-[12px] mt-[30px] flex-nowrap max-[1150px]:flex-wrap max-[570px]:flex-row max-[570px]:flex-wrap max-[570px]:gap-[10px] max-[570px]:mt-[24px]"
          >
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
              onClick={() => onNavigate("constructor")}
            >
              Создать свой набор <ArrowRight />
            </motion.button>
            <button
              type="button"
              className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#ffffffeb] text-forest border-[#ffffff6b] hover:[background:white]"
              onClick={() => onNavigate("catalog")}
            >
              Готовые коллекции <span>↗</span>
            </button>
          </motion.div>
          <motion.div
            variants={reveal}
            className="flex items-center gap-[14px] mt-[36px] text-[12px] leading-[1.6] text-[#65705e] max-[570px]:hidden max-[800px]:text-[10px] [&_b]:font-medium [&_b]:text-[#3d4b3d]"
          >
            <span className="flex pl-0 [&_svg]:h-[38px] [&_svg]:w-[38px] [&_svg]:p-[10px] [&_svg]:[background:#e5e9db] [&_svg]:border-[2px] [&_svg]:border-solid [&_svg]:border-milk [&_svg]:rounded-full [&_svg]:ml-[-8px] [&_svg:nth-child(2)]:[background:#d5ddcb] [&_svg:nth-child(2)]:[transform:rotate(-35deg)] [&_svg:nth-child(3)]:[background:#bcc9b1] [&_svg:nth-child(3)]:[transform:rotate(30deg)]">
              <Leaf />
              <Leaf />
              <Leaf />
            </span>
            <span>
              Для тех, кто знает
              <br />
              <b>каждое растение по имени</b>
            </span>
          </motion.div>
        </motion.div>
        <div
          className="relative h-[555px] min-w-0 [background:radial-gradient(ellipse_at_50%_55%,#c7cfb875,transparent_68%)] max-[1150px]:[transform:scale(.88)] max-[1150px]:origin-[center] max-[1150px]:h-[520px] max-[570px]:h-[440px] max-[570px]:[transform:scale(.8)] max-[570px]:origin-[43%center] max-[570px]:my-[0] max-[570px]:mx-[0-20px] max-[800px]:[transform:scale(.75)] max-[800px]:origin-[35%center] max-[800px]:h-[470px] min-[1500px]:h-[600px]"
          role="img"
          aria-label="Коллекция садовых бирок в молочном, хвойном и терракотовом цветах"
        >
          <span
            className="absolute inset-[40px_0_auto] text-center font-[500] text-[350px] leading-[1] font-display tracking-[-.1em] text-[#23483e08] select-none pointer-events-none max-[570px]:text-[260px]"
            aria-hidden="true"
          >
            3D
          </span>
          <div className="absolute border border-solid border-[#8b9b7029] rounded-full w-[490px] h-[490px] left-1/2 top-1/2 [transform:translate(-50%,-50%)] border-[#a58b5933] max-[570px]:h-[420px] max-[570px]:w-[420px]" />
          <div className="absolute border border-solid border-[#8b9b7029] rounded-full w-[490px] h-[490px] left-1/2 top-1/2 [transform:translate(-50%,-50%)] border-[#a58b5933] max-[570px]:h-[420px] max-[570px]:w-[420px] w-[380px] h-[380px] [transform:translate(-50%,-50%)_rotate(30deg)] border-solid opacity-[.45] max-[570px]:h-[330px] max-[570px]:w-[330px]" />
          <span className="absolute top-[14px] left-[40px] text-[#586547] tracking-[.13em] text-[9px] max-[570px]:top-[-4px] max-[570px]:left-[4px]">
            3D Бирка / САДОВАЯ КОЛЛЕКЦИЯ
          </span>
          <div className="absolute [background:linear-gradient(35deg,#3f592e,#869c6a_52%,#465e36_54%,#5b7749)] rounded-[100%0_100%0] shadow-[inset_0_0_15px_#253d3920,10px_16px_30px_#243f2520] [transform:rotate(-35deg)] w-[100px] h-[185px] z-[0] right-[2%] top-[10px] [transform:rotate(35deg)] max-[570px]:right-[-3%] max-[570px]:top-0" />
          <div className="absolute [background:linear-gradient(35deg,#3f592e,#869c6a_52%,#465e36_54%,#5b7749)] rounded-[100%0_100%0] shadow-[inset_0_0_15px_#253d3920,10px_16px_30px_#243f2520] [transform:rotate(-35deg)] w-[100px] h-[185px] z-[0] right-[-8%] top-[100px] w-[70px] h-[130px] [transform:rotate(77deg)]" />
          <div className="absolute [background:linear-gradient(35deg,#3f592e,#869c6a_52%,#465e36_54%,#5b7749)] rounded-[100%0_100%0] shadow-[inset_0_0_15px_#253d3920,10px_16px_30px_#243f2520] [transform:rotate(-35deg)] w-[100px] h-[185px] z-[0] left-[-2%] bottom-[80px] w-[58px] h-[105px] [transform:rotate(-58deg)] opacity-[.8]" />
          {heroTags.map((tag, i) => (
            <motion.div
              key={tag.color}
              className={`absolute top-[50px] w-[210px] h-[320px] [filter:drop-shadow(15px_30px_18px_#22382026)] ${["left-[2%] top-19.25 z-1 transform-[rotate(-22deg)]!", "left-[34%] top-7.5 z-3", "right-[-3%] top-36.25 z-2"][i]}`}
              animate={
                reducedMotion ? {} : { y: [0, -12, 0], rotate: [0, 1.5, 0] }
              }
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
            >
              <LabelPreview shape="stake" color={tag.color} name={tag.name} />
            </motion.div>
          ))}
          <div className="absolute z-[5] bottom-[30px] left-[12%] right-0 flex items-center gap-[14px] [background:#fffdf6bc] border border-solid border-[#fff] rounded-[5px_20px_20px] py-[18px] px-[20px] shadow-[0_15px_40px_#273d1d0b] [backdrop-filter:blur(14px)] text-[14px] font-semibold [transform:rotate(-3deg)] border-[#c8b58b50] max-[1150px]:left-0 max-[1150px]:right-[-20px] max-[570px]:bottom-[-10px] max-[570px]:left-[3%] max-[570px]:right-[-13%] max-[800px]:left-[-5%] max-[800px]:right-[-35%] max-[800px]:bottom-0 [&>span]:w-[42px] [&>span]:h-[42px] [&>span]:rounded-full [&>span]:grid [&>span]:place-items-center [&>span]:[background:#e8eddf] [&>span]:text-[#46603b] [&_small]:block [&_small]:text-[11px] [&_small]:text-hedge [&_small]:mt-[4px] [&_small]:font-normal [&>svg]:ml-auto [&>svg]:w-[18px]">
            <span>
              <Truck />
            </span>
            <div>
              Из мастерской — к вам
              <small>В пункты Ozon по всей России</small>
            </div>
            <ArrowRight />
          </div>
          <span className="absolute bottom-[7px] left-0 right-0 text-center tracking-[.19em] text-[9px] text-[#78836f] max-[800px]:hidden">
            МАТОВЫЙ ПЛАСТИК · ОБЪЁМНАЯ ПЕЧАТЬ
          </span>
        </div>
      </div>
      <div className="flex justify-between border-top-[1px] border-top-[#ccd2c5] py-[22px] px-[0] text-[12px] tracking-[.08em] text-[#67705e] mt-[26px] border-[#a58b5940] max-[570px]:pt-[20px] max-[570px]:mt-[20px] max-[570px]:text-[9px] max-[570px]:gap-[16px] max-[570px]:tracking-[0] max-[800px]:mt-[5px] max-[800px]:text-[10px] min-[1500px]:mt-[40px] [&>span:last-child]:flex [&>span:last-child]:gap-[30px] max-[570px]:[&>span:last-child]:gap-[10px] max-[570px]:[&>span:last-child]:whitespace-nowrap w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <span>Точная форма. Живой характер.</span>
        <span>
          Сделано в России <span>↗</span>
        </span>
      </div>
    </section>
  );
}
