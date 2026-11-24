"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { reveal } from "./shared";

export function HowSection() {
  return (
    <motion.section
      id="how"
      className="birka-section birka-how"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
    >
      <div className="birka-container">
        <div className="birka-section-top">
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
        <div className="birka-bento">
          <motion.article
            variants={reveal}
            whileHover={{ y: -4 }}
            className="birka-bento-weather"
          >
            <div className="birka-bento-photo" />
            <div className="birka-bento-text">
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
            className="birka-bento-type"
          >
            <div className="birka-relief">
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
            className="birka-bento-delivery"
          >
            <div className="birka-two-days">
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
