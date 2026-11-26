// Slate collection ("Грифельная коллекция"):
// z = 0..2.2 mm: dark slate body + pointed stake
// z = 2.2..2.6 mm: warm rim contour
// z = 2.6..3.1 mm: botanical chalk-relief illustration + variety inscription
tag_length = 75;
tag_height = 52;
tag_shape = "contour";
tag_motif = "tomato";
tag_text_1 = "Томаты";
tag_text_2 = "";
font_size = 7.5;
letter_relief = 0.5;
font_name = "Liberation Serif:style=Bold Italic";
stake_length = 68;

module head_2d(sc = 1) {
  scale([sc, sc])
    if (tag_shape == "cloud") {
      union() {
        resize([tag_length, tag_height * 0.86]) circle(d=tag_length, $fn=48);
        for (a = [0 : 45 : 315])
          rotate([0, 0, a])
            translate([tag_length * 0.36, 0])
              circle(r=tag_height * 0.22, $fn=28);
      }
    } else if (tag_motif == "carrot") {
      hull() {
        translate([-tag_length * 0.24, tag_height * 0.16]) circle(r=tag_height * 0.28, $fn=32);
        translate([tag_length * 0.24, tag_height * 0.16]) circle(r=tag_height * 0.28, $fn=32);
        translate([0, -tag_height * 0.44]) circle(r=4, $fn=20);
      }
    } else if (tag_motif == "cucumber" || tag_motif == "eggplant" || tag_motif == "zucchini") {
      rotate([0, 0, 6])
        resize([tag_length, tag_height * 0.82]) circle(d=tag_length, $fn=48);
    } else {
      union() {
        resize([tag_length, tag_height * 0.88]) circle(d=tag_length, $fn=48);
        translate([0, tag_height * 0.34]) circle(r=tag_height * 0.18, $fn=28);
      }
    }
}

module stake_2d() {
  polygon([
    [-4.5, -tag_height * 0.3],
    [4.5, -tag_height * 0.3],
    [3.6, -tag_height * 0.3 - stake_length + 9],
    [0, -tag_height * 0.3 - stake_length],
    [-3.6, -tag_height * 0.3 - stake_length + 9]
  ]);
}

module motif_2d() {
  translate([0, tag_height * 0.19])
    if (tag_motif == "tomato" || tag_motif == "strawberry") {
      difference() {
        resize([18, 13]) circle(d=18, $fn=32);
        resize([14.5, 9.8]) circle(d=14.5, $fn=32);
      }
      for (a = [-35, 0, 35])
        rotate([0, 0, a]) translate([0, 7]) resize([2.4, 6]) circle(d=4, $fn=16);
    } else if (tag_motif == "cucumber" || tag_motif == "zucchini" || tag_motif == "eggplant") {
      rotate([0, 0, 12])
        difference() {
          resize([24, 9]) circle(d=24, $fn=32);
          resize([20.5, 5.8]) circle(d=20.5, $fn=32);
        }
    } else if (tag_motif == "carrot") {
      polygon([[-4.5, 4], [4.5, 4], [0, -8]]);
      for (a = [-28, 0, 28])
        rotate([0, 0, a]) translate([0, 7.5]) resize([2.2, 6]) circle(d=4, $fn=16);
    } else {
      for (a = [-48, 0, 48])
        rotate([0, 0, a]) translate([0, 5]) resize([4.5, 10]) circle(d=6, $fn=20);
    }
}

linear_extrude(height=2.2) {
  head_2d(1);
  stake_2d();
}

translate([0, 0, 2.2])
  linear_extrude(height=0.4)
    difference() {
      head_2d(1);
      head_2d(0.91);
    }

// Recess the relief into its supporting surface while keeping its top at 2.6 + letter_relief.
relief_bottom = 2.19;
translate([0, 0, relief_bottom])
  linear_extrude(height=2.6 + letter_relief - relief_bottom) {
    motif_2d();
    translate([0, -tag_height * 0.12 + (tag_text_2 == "" ? 0 : font_size * 0.52)])
      text(tag_text_1, size=font_size, font=font_name, halign="center", valign="center");
    if (tag_text_2 != "")
      translate([0, -tag_height * 0.12 - font_size * 0.62])
        text(tag_text_2, size=font_size, font=font_name, halign="center", valign="center");
    translate([0, -tag_height * 0.31]) square([20, 1.1], center=true);
  }
