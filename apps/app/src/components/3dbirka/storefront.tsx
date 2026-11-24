"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "./cart-drawer";
import { CatalogSection } from "./catalog-section";
import { ConstructorPreview } from "./constructor-preview";
import { ConstructorSteps } from "./constructor-steps";
import { type Preset, type ShapeId, shapes } from "./data";
import { HeroSection } from "./hero-section";
import { HowSection } from "./how-section";
import { LoginModal } from "./login-modal";
import { PromiseSection } from "./promise-section";
import type { CartItem, Category, View } from "./shared";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { TryOnMode } from "./try-on-types";

const DEFAULT_NAMES =
  "Томат Бычье сердце\nОгурец Зозуля\nПерец Калифорнийское чудо";

const scrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";

export function Storefront() {
  const [category, setCategory] = useState<Category>("all");
  const [shape, setShape] = useState<ShapeId>("stake");
  const [color, setColor] = useState(0);
  const [namesText, setNamesText] = useState(DEFAULT_NAMES);
  const [view, setView] = useState<View>("front");
  const resetView = useRef<(() => void) | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [tryOn, setTryOn] = useState<TryOnMode | null>(null);
  const [dialog, setDialog] = useState<"login" | "cart" | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const names = namesText
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
  const chosenShape = shapes.find((entry) => entry.id === shape) ?? shapes[0];
  const price = names.length * chosenShape.price;
  const cartCount = cart.reduce((sum, item) => sum + item.names.length, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
    setMenuOpen(false);
  };
  const goHome = () => window.scrollTo({ top: 0, behavior: scrollBehavior() });
  const selectCategory = (next: Category) => {
    setCategory(next);
    scrollTo("catalog");
  };
  const selectView = (nextView: View) => {
    resetView.current?.();
    setTryOn(null);
    setView(nextView);
  };
  const stepPreview = (direction: 1 | -1) =>
    setPreviewIndex((current) => {
      const total = Math.max(names.length, 1);
      return (current + direction + total) % total;
    });
  const selectShape = (id: ShapeId) => {
    setShape(id);
    setAdded(false);
  };
  const selectColor = (index: number) => {
    setColor(index);
    setAdded(false);
  };
  const handleNamesChange = (text: string) => {
    setNamesText(text);
    setPreviewIndex(0);
    setAdded(false);
  };
  const applyPreset = (preset: Preset) => {
    setShape(preset.shape);
    setColor(preset.color);
    setNamesText(preset.names.join("\n"));
    setPreviewIndex(0);
    setAdded(false);
    scrollTo("constructor");
  };
  const appendName = (name: string) => {
    setAdded(false);
    if (names.includes(name)) return;
    setNamesText((text) => `${text.trim()}${text.trim() ? "\n" : ""}${name}`);
  };
  const addToCart = () => {
    if (!names.length) {
      document.getElementById("varieties")?.focus();
      return;
    }
    setCart((prev) => [
      ...prev,
      { id: Date.now(), shape, color, names: [...names], price },
    ]);
    setAdded(true);
    setDialog("cart");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="birka-site">
        <SiteHeader
          menuOpen={menuOpen}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onHome={goHome}
          onNavigate={scrollTo}
          onSelectCategory={selectCategory}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          onShowLogin={() => setDialog("login")}
          onShowCart={() => setDialog("cart")}
        />
        <main>
          <HeroSection onNavigate={scrollTo} />
          <HowSection />
          <section id="constructor" className="birka-section birka-constructor">
            <div className="birka-container">
              <div className="birka-section-top">
                <div>
                  <h2>
                    Ваша маленькая <em>дизайн-студия</em>
                  </h2>
                </div>
                <p>
                  Ваши сорта. Ваши цвета. Ваша бирка.
                  <br />
                  Покрутите её — она уже почти настоящая.
                </p>
              </div>
              <div className="birka-builder">
                <ConstructorPreview
                  shape={shape}
                  color={color}
                  names={names}
                  view={view}
                  tryOn={tryOn}
                  previewIndex={previewIndex}
                  resetViewRef={resetView}
                  onSelectView={selectView}
                  onSelectTryOn={setTryOn}
                  onStep={stepPreview}
                />
                <ConstructorSteps
                  shape={shape}
                  color={color}
                  namesText={namesText}
                  names={names}
                  added={added}
                  onSelectShape={selectShape}
                  onSelectColor={selectColor}
                  onNamesChange={handleNamesChange}
                  onAppendName={appendName}
                  onAddToCart={addToCart}
                />
              </div>
            </div>
          </section>
          <CatalogSection
            category={category}
            onCategoryChange={setCategory}
            onApplyPreset={applyPreset}
          />
          <PromiseSection onNavigate={scrollTo} />
        </main>
        <SiteFooter
          year={year}
          onNavigate={scrollTo}
          onShowLogin={() => setDialog("login")}
        />
        <AnimatePresence>
          {dialog === "login" && (
            <LoginModal
              key="login"
              onClose={() => setDialog(null)}
              done={loggedIn}
              onLogin={() => setLoggedIn(true)}
              savedNames={names}
              onRepeat={() => {
                setDialog(null);
                scrollTo("constructor");
              }}
            />
          )}
          {dialog === "cart" && (
            <CartDrawer
              key="cart"
              items={cart}
              onClose={() => setDialog(null)}
              onRemove={(id) =>
                setCart((items) => items.filter((item) => item.id !== id))
              }
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
