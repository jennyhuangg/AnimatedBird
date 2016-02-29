"use strict";

var baseColor = vec4( 0.2, 0.8, 1.0, 1.0 ); //orange
var vLook = normalize(vec4(1, 0.5, 0.2, 0));

window.onload = function webGLStart() {
    // Create the WebGL context.
    // This allows us to use WebGL functions such as bindBuffer.
    var canvas = document.getElementById( "gl-canvas" );
    var gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
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

    // Create bird vertices array, triangle indices, and normals
    var shape = bird();
    var ftv = birdFaceToVertProperties(shape.verts, shape.tris, shape.norms);
    var verts = ftv.verts;
    var tris = ftv.tris;
    var norms = ftv.norms;

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

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements( gl.TRIANGLES, tris.length, gl.UNSIGNED_SHORT, 0);
    tick();
};
function drawScene() {
  //ASDFHSDFKASFK
}
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    var program = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        rTri += (90 * elapsed) / 1000.0;
        rSquare += (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}



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
