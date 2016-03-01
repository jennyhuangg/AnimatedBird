"use strict";

var baseColor = vec4( 0.2, 0.8, 1.0, 1.0 ); //orange
var vLook = normalize(vec4(1, 0.5, 0.2, 0));

// wing flapping variables
var axis = 1;
var theta1 = [-30, 0, 0];
var theta2 = [-30, 0, 0];
var mode = 1;
var thetaLoc;

var gl;


var instanceXformLoc;
var rotationMatrixLoc;

var origin = vec4(0, 0, 0, 1);
var eye = vec4(0, 0, 1, 1);
var up = vec4(0, 1, 0, 1);
var rotationMatrix;


var cam_x = 1.;
var cam_y = 0.;
window.onload = function init()
{
  // Create the WebGL context.
  // This allows us to use WebGL functions such as bindBuffer.
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Create bird vertices array, triangle indices, and normals
    var shape = bird();
    var ftv = birdFaceToVertProperties(shape.verts, shape.tris, shape.norms);
    var verts = ftv.verts;
    var tris = ftv.tris;
    var norms = ftv.norms;

    //  Configure WebGL - (0, 0) specifies the lower left corner of the viewport
    // rectangle, in pixels. canvas.width and canvas.height specifies the width
    // and heigh of viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );
    // Set background to white when cleared
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
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

    var baseColorLoc = gl.getUniformLocation(program, "baseColor");
    gl.uniform4fv(baseColorLoc, flatten(baseColor));
    var vLookLoc = gl.getUniformLocation(program, "vLook");
    gl.uniform4fv(vLookLoc, flatten(vLook));

    // Load vertex data into GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,
      new Float32Array(flatten(verts)), gl.STATIC_DRAW );
    // Load triangle indices data into GPU
    var bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(flatten(tris)), gl.STATIC_DRAW );
    // Link to the attribute "vPosition" in the shader
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    instanceXformLoc = gl.getUniformLocation(program, "instanceXform");
    rotationMatrixLoc = gl.getUniformLocation(program, "cameraRotation");

    rotationMatrix = mat4(1, 0, 0, 0,
                          0, 1, 0, 0,
                          0, 0, 1, 0,
                          0, 0, 0, 1);

    canvas.addEventListener("mousemove", function(event){

      cam_x = 2*event.clientX/canvas.width-1;
      cam_y = 2*(canvas.height-event.clientY)/canvas.height-1;
      setRotationMatrix( cam_x,  cam_y);
    } );

    render();
};

function birdFaceToVertProperties(vertices, indices, norms1)
{
    var verts = [];
    var tris = [];
    var vert_colors = [];
    var norms = [];
    for ( var i = 0; i < indices.length; ++i) {
      verts.push(vertices[indices[i]]);
      tris.push(i);
    }
    for ( var i = 0; i < norms1.length; ++i) {
      norms.push(norms1[i], norms1[i], norms1[i]);
    }

    return {
      verts: verts,
      tris: tris,
      norms: norms
    };
}

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

  var norms = []
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
}

var baseXform;
function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setRotationMatrix(cam_x, cam_y);
  gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

  if (mode == 1){
    theta1[axis] += 2.0;
  }
  if (mode == -1){
    theta1[axis] -= 2.0;
  }
  gl.uniform3fv(thetaLoc, theta1);

  baseXform = mat4(1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);

  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(baseXform));
  gl.drawElements( gl.TRIANGLES, 72, gl.UNSIGNED_SHORT, 0);

  if (mode == 1){
    theta2[axis] -= 2.0;
  }
  if (mode == -1){
    theta2[axis] += 2.0;
  }
  gl.uniform3fv(thetaLoc, theta2);


  if (theta2[axis] <= -35 || theta2[axis] >= 35){
    mode = -1*mode;
  }

  baseXform = mat4(-1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);

  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(baseXform));
  gl.drawElements( gl.TRIANGLES, 72, gl.UNSIGNED_SHORT, 0);


  requestAnimFrame( render );
}

function setRotationMatrix( x,  y)
{
  if (!(x == 0 || y == 0))
  {
    var vec1 = vec4(x, y, 0, 0);
    var vec2 = subtract(origin, eye);
    var perp = normalize(cross(vec2, vec1));
    var angle = 2*length(vec1);
    var rot = rotate(angle, perp);
    rotationMatrix = mult(rot, rotationMatrix);
  }
}
