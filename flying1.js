// Javascript rogram for HW8: Final Project
// COMP 630 W'16 - Computer Graphics
// Phillips Academy
// 2016-03-01
//
// By Amy Chou and Jenny Huang

"use strict";

var gl;

// Bird properties
var verts;
var tris;
var norms;
var texCoord = []; // coordinates cutting out texture for mapping to triangles

// Direction to light source
var vLight = normalize(vec4(1, 0.5, 0.2, 0));

// Wing flapping variables
var axis = 1; // axis the wing rotates around to flap
var theta1 = [-30, 0, 0]; // angles between wing 1 and axis
var theta2 = [-30, 0, 0]; // angles between wing 2 and axis
var mode = 1; // 1 if wing is going up, -1 if wing is going down
var wingDupliXform;

// Camera variables
var camRotationMatrix; // matrix an object rotates relative to camera
var x = 0.; // x coord of user's mouse
var y = 0.; // y coord of user's mouse

// Shader location variables
var thetaLoc;
var instanceXformLoc;
var camRotationMatrixLoc;

window.onload = function init()
{
  // Create the WebGL context.
  var canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  // Create bird vertices array, triangle indices, and normals
  var shape = bird();
  var ftv = birdFaceToVertProperties(shape.verts, shape.tris, shape.norms);
  verts = ftv.verts;
  tris = ftv.tris;
  norms = ftv.norms;
  setTexCoord(); // populate texCoord

  //  Configure WebGL - (0, 0) specifies the lower left corner of the viewport
  // rectangle, in pixels. canvas.width and canvas.height specifies the width
  // and heigh of viewport
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.3, 0.6, 1.0, 1.0 ); // Sky blue background when cleared
  gl.clearDepth(-1.0);
  // enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.GEQUAL);

  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // Load normals data into the GPU
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(norms), gl.STATIC_DRAW );
  // Link to the attribute "normal" in the shader
  var normalLoc = gl.getAttribLocation( program, "normal" );
  gl.vertexAttribPointer( normalLoc , 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( normalLoc );

  // Load vertex data into GPU
  var vertBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,
  new Float32Array(flatten(verts)), gl.STATIC_DRAW );
  // Load triangle indices data into GPU
  var trisBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, trisBuffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(flatten(tris)), gl.STATIC_DRAW );
  // Link to the attribute "vPosition" in the shader
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // Load texture data into GPU
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );
  // Link to the attribute "vTexCoord" in the shader
  var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);
  configureTexture();

  // Link to shader uniforms that change with animation
  thetaLoc = gl.getUniformLocation(program, "theta");
  instanceXformLoc = gl.getUniformLocation(program, "instanceXform");
  camRotationMatrixLoc = gl.getUniformLocation(program, "cameraRotation");

  // Link to shader uniforms that do not change with animation
  // Bind to direction of light source
  var vLightLoc = gl.getUniformLocation(program, "vLight");
  gl.uniform4fv(vLightLoc, flatten(vLight));

  // Add event listener to detect when mouse is moved on canvas
  canvas.addEventListener("mousemove", function(event){
    // Update x and y
    x = 2*event.clientX/canvas.width-1;
    y = 2*(canvas.height-event.clientY)/canvas.height-1;
  } );


  // Initialize camera rotation matrix to identity
  camRotationMatrix = mat4(1, 0, 0, 0,
                          0, 1, 0, 0,
                          0, 0, 1, 0,
                          0, 0, 0, 1);

  render();
};

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set camera panning; moves if x and y are updated
  setRotationMatrix(x, y);
  gl.uniformMatrix4fv(camRotationMatrixLoc, false, flatten(camRotationMatrix));

  //---------- Render Wing 1 ----------------
  // No transformation; vertices are as hardcoded
  wingDupliXform = mat4(1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);
  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(wingDupliXform));

  // Set angles of wing rotation
  if (mode == 1  ) { theta1[axis] += 2.0; } // CCW rotation if wing going up
  if (mode == -1 ) { theta1[axis] -= 2.0; } // CW rotation if wing going down
  gl.uniform3fv(thetaLoc, theta1);

  gl.drawElements( gl.TRIANGLES, verts.length, gl.UNSIGNED_SHORT, 0);

  //---------- Render Wing 2 ----------------
  // Invert vertices to other side of x axis
  wingDupliXform = mat4(-1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);
  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(wingDupliXform));

  // Set angles of wing rotation
  if (mode == 1  ) { theta2[axis] -= 2.0; } // CW rotation if wing going up
  if (mode == -1 ) { theta2[axis] += 2.0; } // CCW rotation if wing going down
  gl.uniform3fv(thetaLoc, theta2);

  gl.drawElements( gl.TRIANGLES, verts.length, gl.UNSIGNED_SHORT, 0);


  // Update whether wings are going up or down
  if (theta2[axis] <= -35 || theta2[axis] >= 35){
    mode = -1*mode;
  }
  requestAnimFrame( render );
}

function setRotationMatrix( x,  y)
{
  if (!(x == 0 && y == 0))
  {
    var origin = vec4(0, 0, 0, 1); // look at point
    var eye = vec4(0, 0, 1, 1); // eye
    var vec1 = vec4(x, y, 0, 0);
    var vec2 = subtract(origin, eye);
    var perp = normalize(cross(vec2, vec1));
    var angle = 2*length(vec1);
    var rot = rotate(angle, perp);
    camRotationMatrix = mult(rot, camRotationMatrix);
  }
}


// Sets the texture coordinates so that each triangle's vertices corresponds
// to a triangle made from coordinated (0,1), (1,0), and (1,1) of the image.
function setTexCoord(){
  for (var i = 0; i < tris.length; i ++){
    texCoord.push(0.0, 1.0);
    texCoord.push(1.0, 0.0);
    texCoord.push(1.0, 1.0);
  }
}

// Loads the texture from the image file and sets it up. Found
// in the book chapter 7.5.
function configureTexture() {

    // Creates a GL texture object.
    var texture = gl.createTexture();

    // Creates an Image object and loads into it the file with the texture.
    var myTexels = new Image();
    myTexels.src = "texture.png";

    // Specifies active texture to the default value.
    gl.activeTexture( gl.TEXTURE0 );
    // Specifies that this texture is the current texture we want to operate on.
    gl.bindTexture( gl.TEXTURE_2D, texture );
    // Flips the image from top to bottom due to the different coordinate
    // systems used by image and our application.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Specifies the 2D texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
                  gl.UNSIGNED_BYTE, myTexels);
    // Adds mip mapping. Creates texture arrays at appropriate rreduced sizes.
    gl.generateMipmap( gl.TEXTURE_2D );
    // Invoke mip maps.
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

// Creates duplicate vertices to attach information to the vertices instead of
// faces. Takes as input the three arrays (vertices, indices, and
// normals) and return an object with new arrays: a vertex array with
// each vertex repeated for each face it is part of, a triangle array that
// uses indices in the new vertex array, and a new normals array that
// has a normal vector for each duplicate vertex.
function birdFaceToVertProperties(vertices, indices, normals)
{
    var verts = [];
    var tris = [];
    var vert_colors = [];
    var norms = [];
    for ( var i = 0; i < indices.length; ++i) {
      verts.push(vertices[indices[i]]);
      tris.push(i);
    }
    for ( var i = 0; i < normals.length; ++i) {
      norms.push(normals[i], normals[i], normals[i]);
    }

    return {
      verts: verts,
      tris: tris,
      norms: norms
    };
}

// Produces three arrays with no redundant information: one for the bird's
// vertex positions, one for the triangle indices, and one for the normals.
// (one normal vector per triangle).
function bird() {
  var verts = [
    vec4(0, 0, 0),
    vec4(-0.25, 0.1, 0.20),
    vec4(-0.25, 0.1, 0.21),
    vec4(-0.25, -0.1, 0.21),
    vec4(-0.25, -0.1, 0.20),
    vec4(-0.5, 0.1, 0.30),
    vec4(-0.5, 0.1, 0.31),
    vec4(-0.5, -0.1, 0.31),
    vec4(-0.5, -0.1, 0.30),
    vec4(-0.75, 0.1, 0.20),
    vec4(-0.75, 0.1, 0.21),
    vec4(-0.75, -0.1, 0.21),
    vec4(-0.75, -0.1, 0.20),
    vec4(-1., 0., 0.)
  ];

  var tris = [
    0, 2, 1,
    0, 3, 2,
    0, 4, 3,
    0, 1, 4,
    2, 3, 7,
    3, 4, 8,
    4, 1, 5,
    1, 2, 6,
    2, 7, 6,
    3, 8, 7,
    4, 5, 8,
    1, 6, 5,
    6, 7, 11,
    7, 8, 12,
    8, 5, 9,
    5, 6, 10,
    6, 11, 10,
    7, 12, 11,
    8, 9, 12,
    5, 10, 9,
    13, 10, 11,
    13, 9, 10,
    13, 12, 9,
    13, 11, 12];

  var norms = [];
  for ( var i = 0; i < tris.length; i +=3) {
    var vec1 = subtract(verts[tris[i+1]],verts[tris[i]]);
    var vec2 = subtract(verts[tris[i+2]],verts[tris[i]]);
    var norm = normalize(vec4(cross(vec1, vec2), 0));
    norms.push(norm);
  }

  return {
    verts: verts,
    tris: tris,
    norms: norms
  };
