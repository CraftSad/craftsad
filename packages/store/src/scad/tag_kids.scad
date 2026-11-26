// Kids series ("Детская серия"):
// z = 0..2.2 mm: shaped figurine silhouette + stake (base filament)
// z = 2.2..2.6 mm: leaves / crown / character relief details (accent filament)
// z = 2.6..3.1 mm: bold raised inscription (text filament)
tag_length = 80;
tag_height = 56;
tag_shape = "figurine";
tag_motif = "carrot";
tag_text_1 = "МОРКОВЬ";
tag_text_2 = "";
font_size = 7.2;
letter_relief = 0.5;
font_name = "Liberation Sans:style=Bold";
stake_length = 68;

is_hedgehog = tag_shape == "hedgehog" ||
  (tag_shape == "figurine" && (tag_motif == "zucchini" || tag_motif == "hedgehog"));
is_sunflower = tag_shape == "sunflower" ||
  (tag_shape == "figurine" && tag_motif == "sunflower");

module stake_2d() {
  polygon([
    [-5, -tag_height * 0.32],
    [5, -tag_height * 0.32],
    [3.8, -tag_height * 0.32 - stake_length + 10],
    [0, -tag_height * 0.32 - stake_length],
    [-3.8, -tag_height * 0.32 - stake_length + 10]
  ]);
}

module body_2d() {
  if (is_hedgehog) {
    union() {
      resize([tag_length * 0.92, tag_height * 0.76]) circle(d=tag_length, $fn=44);
      translate([-tag_length * 0.36, tag_height * 0.1]) circle(r=tag_height * 0.18, $fn=28);
    }
  } else if (is_sunflower) {
    union() {
      for (a = [0 : 30 : 330])
        rotate([0, 0, a])
          translate([tag_length * 0.28, 0])
            resize([tag_length * 0.32, tag_height * 0.24]) circle(d=20, $fn=24);
      circle(r=tag_length * 0.28, $fn=36);
    }
  } else if (tag_motif == "carrot") {
    hull() {
      translate([-tag_length * 0.25, tag_height * 0.22]) circle(r=12, $fn=28);
      translate([tag_length * 0.25, tag_height * 0.22]) circle(r=12, $fn=28);
      translate([0, -tag_height * 0.45]) circle(r=5, $fn=20);
    }
  } else if (tag_motif == "strawberry") {
    hull() {
      translate([-tag_length * 0.22, tag_height * 0.18]) circle(r=15, $fn=32);
      translate([tag_length * 0.22, tag_height * 0.18]) circle(r=15, $fn=32);
      translate([0, -tag_height * 0.42]) circle(r=6, $fn=24);
    }
  } else {
    resize([tag_length * 0.92, tag_height * 0.84]) circle(d=tag_length, $fn=48);
  }
}

module accent_2d() {
  if (is_hedgehog) {
    difference() {
      union() {
        for (a = [-20 : 22 : 170])
          rotate([0, 0, a])
            translate([tag_length * 0.38, 0])
              circle(r=7, $fn=3);
      }
      translate([0, -tag_height * 0.08])
        resize([tag_length * 0.72, tag_height * 0.52]) circle(d=tag_length, $fn=36);
    }
  } else if (is_sunflower) {
    hull() {
      translate([-tag_length * 0.32, 0]) circle(r=10, $fn=28);
      translate([tag_length * 0.32, 0]) circle(r=10, $fn=28);
    }
  } else {
    for (lx = [-10, 0, 10])
      translate([lx, tag_height * 0.42])
        rotate([0, 0, -lx * 1.8])
          resize([7, 15]) circle(d=10, $fn=24);
  }
}

linear_extrude(height=2.2) {
  body_2d();
  stake_2d();
}

translate([0, 0, 2.2])
  linear_extrude(height=0.4)
    accent_2d();

// Recess the relief into its supporting surface while keeping its top at 2.6 + letter_relief.
relief_bottom = is_sunflower ? 2.59 : 2.19;
translate([0, 0, relief_bottom])
  linear_extrude(height=2.6 + letter_relief - relief_bottom) {
    translate([0, (tag_text_2 == "" ? 0 : font_size * 0.55)])
      text(tag_text_1, size=font_size, font=font_name, halign="center", valign="center");
    if (tag_text_2 != "")
      translate([0, -font_size * 0.62])
        text(tag_text_2, size=font_size, font=font_name, halign="center", valign="center");
  }
