"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "./cart-drawer";
import { CatalogSection } from "./catalog-section";
import { ConstructorPreview } from "./constructor-preview";
import { ConstructorSteps } from "./constructor-steps";
import { type Preset, type SeriesId, type ShapeId, tagSeries } from "./data";
import { GardenSections } from "./garden-sections";
import { HeroSection } from "./hero-section";
import { HowSection } from "./how-section";
import { LoginModal } from "./login-modal";
import { PromiseSection } from "./promise-section";
import type { CartItem, Category, View } from "./shared";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { calculateKit, kitShapes, parseNames } from "./tag-config";
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
  const [mixed, setMixed] = useState(false);
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
  const nextCartId = useRef(1);
  const [added, setAdded] = useState(false);
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const names = parseNames(namesText).map((row) => row.text);
  const { price, original } = calculateKit(names.length, shape, mixed);
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
  const selectSeries = (seriesId: SeriesId) => {
    const target =
      tagSeries.find((entry) => entry.id === seriesId) ?? tagSeries[0];
    setShape(target.defaultShape);
    setColor(0);
    setMixed(false);
    setAdded(false);
    setPreviewIndex(0);
  };
  const selectShape = (id: ShapeId) => {
    setShape(id);
    setMixed(false);
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
    setMixed(!!preset.mixed);
    setColor(preset.color);
    setNamesText(preset.items.join("\n"));
    setPreviewIndex(0);
    setAdded(false);
    scrollTo("constructor");
  };
  const appendName = (name: string) => {
    setAdded(false);
    setNamesText((text) => `${text.trim()}${text.trim() ? "\n" : ""}${name}`);
  };
  const addToCart = () => {
    if (!names.length) {
      document.getElementById("varieties")?.focus();
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        id: nextCartId.current++,
        shape,
        color,
        names: [...names],
        price,
        originalPrice: original,
        mixed,
        itemShapes: kitShapes(names.length, shape, mixed),
      },
    ]);
    setAdded(true);
    setDialog("cart");
  };

  const addPreset = (preset: Preset) => {
    const pricing = calculateKit(
      preset.items.length,
      preset.shape,
      preset.mixed,
    );
    const item: CartItem = {
      id: nextCartId.current++,
      shape: preset.shape,
      color: preset.color,
      names: [...preset.items],
      price: pricing.price,
      originalPrice: pricing.original,
      mixed: preset.mixed,
      itemShapes: kitShapes(preset.items.length, preset.shape, preset.mixed),
    };
    setCart((current) => [...current, item]);
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
                  shape={
                    mixed
                      ? (kitShapes(names.length || 1, shape, true)[
                          previewIndex % Math.max(names.length, 1)
                        ] ?? shape)
                      : shape
                  }
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
                  mixed={mixed}
                  onSelectSeries={selectSeries}
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
            onAddPreset={addPreset}
          />
          <PromiseSection onNavigate={scrollTo} />
          <GardenSections onNavigate={scrollTo} />
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
