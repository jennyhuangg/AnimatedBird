Animated Bird with Camera Navigation in WebGL

By Amy Chou and Jenny Huang
For Comp 630 (Computer Graphics) @ Phillips Academy w/ Dr. Miles, period 4
2016-03-01

Demo program runs directly through Mongoose.  Rendering occurs in less than a
second; please see demo.pdf for high-resolution screenshots.

--------------------------------------------------------------------------------

PROJECT CONTENTS

Documentation:
 - README.txt : This document.
 - screenshots.pdf : Screenshots of the demo program run at high resolution.

Original / modified code:
 - main.html/main.js : Demo program that loads and renders a scene.
 - texture.png : Texture image for the bird. Found at
   http://aghslibraryhome.weebly.com/uploads/7/3/0/1/7301472/1383779417.png.

Unmodified helper code:
 - /Common/webgl-utils.js from the book code.
 - /Common/initShaders.js from the book code.
 - /Common/MV.js from the book code.

 Sources of Inspiration:
  - textureCubev2.html from the book code chapter 7.
  - textureCubev2.js from the book code chapter 7.
  - trackball.js from the book code chapter 4.
  - cube.html from the book code chapter 4.
  - cube.js from the book code chapter 4.
  - Code snippet on p336 of the book.
  - Book chapter 7.5 for texturing.
  - morphnormals sparked our idea to animate a bird. Source:
    http://threejs.org/examples/#webgl_morphnormals.


--------------------------------------------------------------------------------

  Our program supports texturing, animation, and mouse navigation.
  The demo program shows a feather-textured bird flapping its wings,
and the movement of the mouse can alter the position of the camera around it.
  Texturing has become increasingly more important in design. Thus, rather than
the standard solid coloring, the bird is colored with a feathers from a textured
image. To implement this, we first loaded into the program the textured image
[1]. We then set up linear filtering for the image when it is scaled [1].
Afterwards, we mapped a triangular section of the image to each triangle in the
triangle mesh. We did this by specifying coordinates in the image that
corresponded to each vertex (after conversion from face to vertex properties)
[1, 2]. We then updated the shaders and drew the textured bird. The explanation
from the tutorial and example code on the Mozilla Developer Network was very
helpful for coding the texturization [1].
  Because birds fly, we animated the bird wings so that they flap. We did this
by repeatedly multiplying its vertices' locations by a matrix that rotated them
up and down about the y axis that passes through the center of the bird.
  So that the user can see the bird from different angles, we implemented
mouse navigation that allows the camera to pan around the bird. The location of
the mouse specifies a vector in space (x, y, 0) that is perpendicular to the
camera-centric vector (0, 0, 1). The axis of the panning rotation is the vector
perpendicular to these two vectors. The angle of panning in each frame is
proportional to the distance of (x, y) from the origin. We used the
rotate(angle, axis) function in MV.js to get the rotation matrix due to camera
panning.
--------------------------------------------------------------------------------

References:
[1] F. Scholz, Jeremie, Mason, et al. "Using Textures in WebGL". Online at
    https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL.
    Accessed 2016-02-29.
[2] E. Angel and D. Shreiner.  "Two-Dimensional Texture Mapping".  In
    "Interactive Computer Graphics: A Top-Down Approach with WebGL", 7th ed,
    pages 333-345. Pearson, 2015.
