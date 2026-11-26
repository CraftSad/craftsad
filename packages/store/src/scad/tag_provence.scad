// Provence collection ("Прованс"):
// z = 0..2.2 mm: French-country plaque + stake (base filament)
// z = 2.2..2.6 mm: stepped border + embossed botanical sprig (accent filament)
// z = 2.6..3.1 mm: uppercase serif inscription (text filament)
tag_length = 80;
tag_height = 52;
tag_shape = "plaque";
tag_motif = "basil";
tag_text_1 = "БАЗИЛИК";
tag_text_2 = "";
font_size = 7.0;
letter_relief = 0.5;
font_name = "Liberation Serif:style=Bold";
stake_length = 68;

module plaque_2d(sc = 1) {
  scale([sc, sc])
    if (tag_shape == "watering_can" || tag_motif == "marjoram") {
      union() {
        polygon([
          [-22, -20], [22, -20], [18, 18], [-18, 18]
        ]);
        polygon([
          [-18, -4], [-38, 10], [-35, 15], [-16, 4]
        ]);
        difference() {
          translate([24, 0]) circle(r=11, $fn=28);
          translate([24, 0]) circle(r=6.5, $fn=28);
        }
      }
    } else if (tag_motif == "mint") {
      hull() {
        translate([-tag_length * 0.2, tag_height * 0.16]) circle(r=16, $fn=36);
        translate([tag_length * 0.2, tag_height * 0.16]) circle(r=16, $fn=36);
        translate([0, -tag_height * 0.42]) circle(r=4, $fn=20);
      }
    } else if (tag_motif == "rosemary") {
      resize([tag_length, tag_height * 0.78]) circle(d=tag_length, $fn=48);
    } else {
      union() {
        square([tag_length * 0.88, tag_height * 0.62], center=true);
        translate([0, tag_height * 0.12]) circle(r=tag_length * 0.27, $fn=40);
        translate([-tag_length * 0.38, 0]) circle(r=tag_height * 0.2, $fn=28);
        translate([tag_length * 0.38, 0]) circle(r=tag_height * 0.2, $fn=28);
      }
    }
}

module stake_2d() {
  polygon([
    [-4.5, -tag_height * 0.28],
    [4.5, -tag_height * 0.28],
    [3.5, -tag_height * 0.28 - stake_length + 9],
    [0, -tag_height * 0.28 - stake_length],
    [-3.5, -tag_height * 0.28 - stake_length + 9]
  ]);
}

module sprig_2d() {
  translate([0, tag_height * 0.18])
    for (a = [-56, -28, 0, 28, 56])
      rotate([0, 0, a])
        translate([0, 5.5])
          resize([3.6, 8.5]) circle(d=6, $fn=20);
}

linear_extrude(height=2.2) {
  plaque_2d(1);
  stake_2d();
}

translate([0, 0, 2.2])
  linear_extrude(height=0.4) {
    difference() {
      plaque_2d(1);
      plaque_2d(0.91);
    }
    sprig_2d();
  }

// Recess the relief into its supporting surface while keeping its top at 2.6 + letter_relief.
relief_bottom = 2.19;
translate([0, 0, relief_bottom])
  linear_extrude(height=2.6 + letter_relief - relief_bottom) {
    translate([0, -tag_height * 0.11 + (tag_text_2 == "" ? 0 : font_size * 0.52)])
      text(tag_text_1, size=font_size, font=font_name, halign="center", valign="center");
    if (tag_text_2 != "")
      translate([0, -tag_height * 0.11 - font_size * 0.62])
        text(tag_text_2, size=font_size, font=font_name, halign="center", valign="center");
  }
