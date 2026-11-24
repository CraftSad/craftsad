"use client";

import { Check, Plus, ShoppingBag } from "lucide-react";
import { colorPairs, popularVarieties, type ShapeId, shapes } from "./data";
import { Pill, RollingNumber } from "./ui";

const labelCounts = new Intl.PluralRules("ru-RU");
const labelForms = { one: "бирка", few: "бирки", many: "бирок" };

type ConstructorStepsProps = {
  shape: ShapeId;
  color: number;
  namesText: string;
  names: string[];
  added: boolean;
  onSelectShape: (shape: ShapeId) => void;
  onSelectColor: (color: number) => void;
  onNamesChange: (text: string) => void;
  onAppendName: (name: string) => void;
  onAddToCart: () => void;
};

export function ConstructorSteps({
  shape,
  color,
  namesText,
  names,
  added,
  onSelectShape,
  onSelectColor,
  onNamesChange,
  onAppendName,
  onAddToCart,
}: ConstructorStepsProps) {
  const chosenShape = shapes.find((entry) => entry.id === shape) ?? shapes[0];
  const price = names.length * chosenShape.price;
  const countForm = labelCounts.select(names.length);

  return (
    <div className="birka-builder-right">
      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>1</span>
          <div>
            <h3>Форма</h3>
            <p>Для стаканчиков, грядок или теплицы</p>
          </div>
        </div>
        <div className="birka-shapes">
          {shapes.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                shape === item.id ? "birka-shape active" : "birka-shape"
              }
              aria-pressed={shape === item.id}
              onClick={() => onSelectShape(item.id)}
            >
              <span className={`birka-shape-icon birka-shape-icon-${item.id}`}>
                <i />
              </span>
              <span>
                <Pill active={shape === item.id} group="shape" />
                <strong>
                  {item.id === "stake"
                    ? "Колышек"
                    : item.id === "flag"
                      ? "Флажок"
                      : "Подвесная"}
                </strong>
                <small>{item.size}</small>
              </span>
              {shape === item.id && <Check />}
            </button>
          ))}
        </div>
      </div>
      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>2</span>
          <div>
            <h3>Цвет</h3>
            <p>Шесть сочетаний, которые хорошо читаются</p>
          </div>
        </div>
        <div className="birka-colors">
          {colorPairs.map((pair, index) => (
            <button
              type="button"
              key={pair.name}
              title={`${pair.name} — ${pair.label}`}
              aria-label={`${pair.name} — ${pair.label}`}
              className={color === index ? "birka-color active" : "birka-color"}
              aria-pressed={color === index}
              onClick={() => onSelectColor(index)}
            >
              <span
                className="birka-color-swatch"
                style={{
                  background: `linear-gradient(135deg, ${pair.base} 0% 64%, ${pair.ink} 64% 100%)`,
                }}
              ></span>
              <span>
                <strong>{pair.name}</strong>
                <small>{pair.label}</small>
              </span>
              {color === index && <Check />}
            </button>
          ))}
        </div>
      </div>
      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>3</span>
          <div>
            <h3>Ваши сорта</h3>
            <p>Одно название — одна бирка</p>
          </div>
        </div>
        <label htmlFor="varieties" className="birka-field-label">
          Названия сортов, каждое с новой строки
        </label>
        <textarea
          id="varieties"
          rows={3}
          value={namesText}
          onChange={(event) => onNamesChange(event.target.value)}
          placeholder={"Томат Бычье сердце\nОгурец Зозуля\nПерец Сладкий"}
        />
        <div className="birka-variety-help">
          <span>Можно добавить популярные сорта:</span>
          <div>
            {popularVarieties.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => onAppendName(name)}
              >
                <Plus /> {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="birka-builder-step birka-builder-final">
        <div className="birka-builder-heading">
          <span>4</span>
          <div>
            <h3>Ваш набор готов</h3>
            <p>Проверьте количество и стоимость</p>
          </div>
        </div>
        <div className="birka-summary">
          <span>
            <RollingNumber value={names.length} />{" "}
            {countForm === "one" || countForm === "few"
              ? labelForms[countForm]
              : labelForms.many}{" "}
            · {chosenShape.size}
          </span>
          <strong>
            <RollingNumber value={price} /> ₽
          </strong>
        </div>
        <button
          type="button"
          className="birka-button birka-button-primary"
          disabled={!names.length}
          onClick={onAddToCart}
        >
          {added ? "Добавить ещё один набор" : "Добавить в корзину"}
          <ShoppingBag />
        </button>
        <p className="birka-helper">
          Оплатить можно будет после подтверждения заказа.
        </p>
      </div>
    </div>
  );
}
