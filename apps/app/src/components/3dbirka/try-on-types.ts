import type { ShapeId } from "./data";

/** Режимы примерки бирки: рассада / грядка / теплица */
export type TryOnMode = "seedling" | "garden" | "greenhouse";

export type TagProps = {
  shape: ShapeId;
  color: number;
  name: string;
};
