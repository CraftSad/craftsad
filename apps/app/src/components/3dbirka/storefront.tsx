"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveHandoff } from "~/editor/model/handoff";
import { CartDrawer } from "./cart-drawer";
import { CatalogSection } from "./catalog-section";
import { ConstructorPreview } from "./constructor-preview";
import { ConstructorSteps } from "./constructor-steps";
import {
  type Preset,
  type SeriesId,
  type ShapeId,
  shapeToSeries,
  tagSeries,
} from "./data";
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
  const router = useRouter();

  // The editor picks the setup up, so the tag is not configured twice.
  const openEditor = () => {
    saveHandoff({ shape, color, names });
    router.push("/editor");
  };

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
    if (seriesId === shapeToSeries(shape)) return;
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
      <div className="[background:radial-gradient(ellipse_at_85%_8%,#dce2d366,transparent_34%),#f5f1e8] text-ink font-craft text-[18px] leading-[1.55] overflow-clip isolate before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:opacity-[.035] before:z-[30] before:bg-grain [&_button]:cursor-pointer [&_button]:touch-manipulation [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[.6] [&_button:focus-visible]:[outline:3px_solid_#c87d55] [&_button:focus-visible]:outline-offset-[5px] [&_input:focus-visible]:[outline:3px_solid_#b86b43] [&_input:focus-visible]:outline-offset-[3px] [&_textarea:focus-visible]:[outline:3px_solid_#b86b43] [&_textarea:focus-visible]:outline-offset-[3px] [&_h1]:font-display [&_h1]:font-medium [&_h2]:font-display [&_h2]:font-medium [&_h3]:font-display [&_h3]:font-medium [&_section[id]]:scroll-mt-[118px] [&_a:focus-visible]:[outline:3px_solid_#c87d55] [&_a:focus-visible]:outline-offset-[5px] [&_svg]:shrink-0">
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
          onEditor={openEditor}
        />
        <main>
          <HeroSection onNavigate={scrollTo} />
          <HowSection />
          <section
            id="constructor"
            className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] [background:#111c18] text-[#f6f4ef] relative pt-[70px] pb-[65px] [&_h2]:text-[52px]"
          >
            <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
              <div className="flex justify-between items-center gap-[50px] mb-[36px] max-[570px]:block max-[570px]:mb-[26px] max-[800px]:flex max-[800px]:gap-[24px] [&>p]:max-w-[370px] [&>p]:text-[#b0bdb2] [&>p]:text-[15px] [&>p]:mb-[5px] [&>p]:leading-[1.8] max-[800px]:[&>p]:mt-[18px] max-[800px]:[&>p]:text-[13px] max-[800px]:[&>p]:m-0 max-[800px]:[&>p]:max-w-[240px] max-[570px]:[&>p]:text-[15px] max-[570px]:[&>p]:mt-[18px] max-[570px]:[&>p]:max-w-none">
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
              <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-[0] items-stretch [background:#ffffff04] border border-solid border-[#ffffff12] rounded-[26px] overflow-hidden max-[1100px]:gap-[18px] max-[1150px]:grid-cols-[1.15fr_1fr] max-[570px]:rounded-[20px] max-[800px]:grid-cols-[1fr] [@media((min-width:801px)_and_(max-width:1150px))]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [&_textarea]:w-full [&_textarea]:border-[1.5px] [&_textarea]:border-solid [&_textarea]:border-[#c8cec6] [&_textarea]:rounded-[9px] [&_textarea]:[background:white] [&_textarea]:text-ink [&_textarea]:py-[14px] [&_textarea]:px-[16px] [&_textarea]:text-[18px] [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea]:min-h-[160px]">
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
