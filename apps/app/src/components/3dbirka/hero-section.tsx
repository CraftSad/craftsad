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
    <section className="birka-hero">
      <div className="birka-container birka-hero-grid">
        <motion.div
          className="birka-hero-copy"
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <motion.div variants={reveal} className="birka-hero-edition">
            <span /> 3D Бирка · предметы для любимого сада
          </motion.div>
          <motion.h1 variants={reveal}>
            У каждого растения
            <br />— своё имя
            <br />
            <em>и своя история</em>
            <span className="birka-title-dot">.</span>
          </motion.h1>
          <motion.p variants={reveal}>
            Создаём садовые бирки с объёмными буквами.
            <br />
            Ваши сорта, любимые оттенки и детали,
            <br className="birka-desktop-break" /> которые делают сад
            по-настоящему вашим.
          </motion.p>
          <motion.div variants={reveal} className="birka-hero-actions">
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="birka-button birka-button-primary"
              onClick={() => onNavigate("constructor")}
            >
              Создать свой набор <ArrowRight />
            </motion.button>
            <button
              type="button"
              className="birka-button birka-button-light"
              onClick={() => onNavigate("catalog")}
            >
              Готовые коллекции <span>↗</span>
            </button>
          </motion.div>
          <motion.div variants={reveal} className="birka-hero-caption">
            <span className="birka-mini-leaves">
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
          className="birka-hero-art"
          role="img"
          aria-label="Коллекция садовых бирок в молочном, хвойном и терракотовом цветах"
        >
          <span className="birka-art-monogram" aria-hidden="true">
            3D
          </span>
          <div className="birka-orbit birka-orbit-one" />
          <div className="birka-orbit birka-orbit-two" />
          <span className="birka-art-coordinate">
            3D Бирка / САДОВАЯ КОЛЛЕКЦИЯ
          </span>
          <div className="birka-art-leaf birka-art-leaf-one" />
          <div className="birka-art-leaf birka-art-leaf-two" />
          <div className="birka-art-leaf birka-art-leaf-three" />
          {heroTags.map((tag, i) => (
            <motion.div
              key={tag.color}
              className={`birka-hero-tag birka-hero-tag-${i}`}
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
          <div className="birka-hero-delivery">
            <span>
              <Truck />
            </span>
            <div>
              Из мастерской — к вам
              <small>В пункты Ozon по всей России</small>
            </div>
            <ArrowRight />
          </div>
          <span className="birka-art-material">
            МАТОВЫЙ ПЛАСТИК · ОБЪЁМНАЯ ПЕЧАТЬ
          </span>
        </div>
      </div>
      <div className="birka-hero-rule birka-container">
        <span>Точная форма. Живой характер.</span>
        <span>
          Сделано в России <span>↗</span>
        </span>
      </div>
    </section>
  );
}
