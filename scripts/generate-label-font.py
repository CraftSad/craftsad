"""Build a small Three.js typeface from the bundled OFL Manrope font."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen

root = Path(__file__).resolve().parents[1] / "apps/app/public/fonts"
font = instantiateVariableFont(TTFont(root / "manrope.ttf"), {"wght": 650})
glyphs = font.getGlyphSet()
scale = 1000 / font["head"].unitsPerEm

class OutlinePen(BasePen):
    def __init__(self):
        super().__init__(glyphs)
        self.commands = []
    def coords(self, p):
        return f"{round(p[0] * scale)} {round(p[1] * scale)}"
    def _moveTo(self, p): self.commands.append("m " + self.coords(p))
    def _lineTo(self, p): self.commands.append("l " + self.coords(p))
    def _qCurveToOne(self, p1, p2): self.commands.append("q " + self.coords(p2) + " " + self.coords(p1))
    def _curveToOne(self, p1, p2, p3): self.commands.append("b " + self.coords(p3) + " " + self.coords(p1) + " " + self.coords(p2))
    def _closePath(self): pass

result = {}
for code, name in font.getBestCmap().items():
    if code > 127 and not 0x400 <= code <= 0x4ff: continue
    pen = OutlinePen()
    glyphs[name].draw(pen)
    result[chr(code)] = {"ha": round(glyphs[name].width * scale), "x_min": 0, "x_max": 1000, "o": " ".join(pen.commands)}
(root / "manrope.typeface.json").write_text(json.dumps({"glyphs": result, "familyName": "Manrope", "ascender": 1100, "descender": -300, "underlinePosition": -100, "underlineThickness": 50, "boundingBox": {"xMin": -500, "xMax": 1500, "yMin": -300, "yMax": 1100}, "resolution": 1000}, ensure_ascii=False), encoding="utf-8")
