"use strict";

var baseColor = vec4( 0.2, 0.8, 1.0, 1.0 ); //orange
var vLook = normalize(vec4(1, 0.5, 0.2, 0));

var axis = 1;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var gl;

var mode = 1;

var instanceXformLoc;
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
    vec4(0, 0, 0.1, 1),
    vec4(0, -0.1, 0, 1),
    vec4(0, 0.1, 0, 1),
    vec4(-1, 0, 0, 1)
  ];

  var tris = [
    0, 1, 2,
    0, 3, 1,
    1, 3, 2,
    0, 2, 3];

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
  if (mode == 1){
    theta[axis] += 2.0;
    if (theta[axis] >= 45){
      mode = 0;
    }
  }
  if (mode == 0){
    theta[axis] -= 2.0;
    if (theta[axis] <= -45){
      mode = 1;
    }
  }
  gl.uniform3fv(thetaLoc, theta);

  baseXform = mat4(1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);
  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(baseXform));
  gl.drawElements( gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0);

  baseXform = mat4(-1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);
  gl.uniformMatrix4fv(instanceXformLoc, false, flatten(baseXform));
  gl.drawElements( gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0);

  requestAnimFrame( render );
}
