// Text begins exactly at z=2 mm. The 0.6 mm raised lettering can be printed
// in a second filament by inserting a color change at that layer in the slicer.
tag_length = 100;
tag_height = 25;
tag_shape = "rounded";
tag_text_1 = "Томат";
tag_text_2 = "";
font_size = 9;
letter_relief = 0.6;
font_name = "Liberation Sans:style=Bold";

module base() {
  linear_extrude(height=2)
    if (tag_shape == "rounded")
      hull() {
        translate([3, 3]) circle(r=3, $fn=24);
        translate([tag_length-3, 3]) circle(r=3, $fn=24);
        translate([3, tag_height-3]) circle(r=3, $fn=24);
        translate([tag_length-3, tag_height-3]) circle(r=3, $fn=24);
      }
    else square([tag_length, tag_height]);
}

base();
translate([tag_length/2, tag_height/2 + (tag_text_2 == "" ? 0 : font_size*0.55), 2])
  linear_extrude(height=letter_relief)
    text(tag_text_1, size=font_size, font=font_name, halign="center", valign="center");
if (tag_text_2 != "")
  translate([tag_length/2, tag_height/2 - font_size*0.65, 2])
    linear_extrude(height=letter_relief)
      text(tag_text_2, size=font_size, font=font_name, halign="center", valign="center");
