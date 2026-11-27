import { describe, expect, test } from "bun:test";
import { colorPairs } from "~/components/3dbirka/data";
import { batchNames } from "./export/print";
import { handoffProject } from "./handoff";

describe("handoff from the storefront", () => {
  test("continues the constructor: template, colours and one tag per name", () => {
    const project = handoffProject({
      shape: "flag",
      color: 2,
      names: ["Томат", "Перец", "  ", "Огурец"],
    });
    expect(project?.batch.names).toEqual(["Томат", "Перец", "  ", "Огурец"]);
    expect(project?.template).toBe("flag");
    expect(project?.colors).toEqual({
      body: colorPairs[2]?.base,
      relief: colorPairs[2]?.ink,
    });
    expect(project && batchNames(project)).toEqual([
      "Томат",
      "Перец",
      "Огурец",
    ]);
  });

  test("rejects anything that is not a storefront setup", () => {
    for (const bad of [
      null,
      "flag",
      3,
      {},
      { shape: "flag" },
      { shape: "blob", color: 0, names: [] },
      { shape: "stake", color: 99, names: [] },
      { shape: "stake", color: "0", names: [] },
      { shape: "stake", color: 0, names: ["Ок", 42] },
      { shape: "stake", color: 0, names: ["Ок", "я".repeat(81)] },
    ])
      expect(handoffProject(bad)).toBeNull();
  });
});
