import {vec2, vec3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Plane from './geometry/Plane';
import Cube from './geometry/Cube';
import houseSys from './houseSystem/houseSys'
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

let square: Square;
let plane : Plane;
let cube : Cube;
let planePos: vec2;

const controls = {
};


function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  plane = new Plane(vec3.fromValues(0,0,0), vec2.fromValues(100,100), 20);
  plane.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  planePos = vec2.fromValues(0,0);
  cube.create();

  var i, j;
  var hSys = new houseSys(vec3.fromValues(-10, 0., -10));
  let transformations: mat4[] = hSys.transformHistory;
  hSys.draw();
  let offsetsArray_1 = [];
  let colorsArray_1 = [];
  let col1Array_1 = [];
  let col2Array_1 = [];
  let col3Array_1 = [];
  let col4Array_1 = [];

  let m: number = transformations.length;

  for (let i = 0; i < m; i++) {
    let currTransform_1 = transformations[i];

    // Dummy - todo, get rid of offsets
    offsetsArray_1.push(0);
    offsetsArray_1.push(0);
    offsetsArray_1.push(0);

    // push column vectors back
    col1Array_1.push(currTransform_1[0]);
    col1Array_1.push(currTransform_1[1]);
    col1Array_1.push(currTransform_1[2]);
    col1Array_1.push(currTransform_1[3]);

    col2Array_1.push(currTransform_1[4]);
    col2Array_1.push(currTransform_1[5]);
    col2Array_1.push(currTransform_1[6]);
    col2Array_1.push(currTransform_1[7]);

    col3Array_1.push(currTransform_1[8]);
    col3Array_1.push(currTransform_1[9]);
    col3Array_1.push(currTransform_1[10]);
    col3Array_1.push(currTransform_1[11]);

    col4Array_1.push(currTransform_1[12]);
    col4Array_1.push(currTransform_1[13]);
    col4Array_1.push(currTransform_1[14]);
    col4Array_1.push(currTransform_1[15]);

    // push colors back
    colorsArray_1.push(138. / 255.);
    colorsArray_1.push(43. / 255.);
    colorsArray_1.push(226. / 255.);
    colorsArray_1.push(1.0);
  }

  let col1_1: Float32Array = new Float32Array(col1Array_1);
  let col2_1: Float32Array = new Float32Array(col2Array_1);
  let col3_1: Float32Array = new Float32Array(col3Array_1);
  let col4_1: Float32Array = new Float32Array(col4Array_1);
  let colors_1: Float32Array = new Float32Array(colorsArray_1);
  let offset_1: Float32Array = new Float32Array(offsetsArray_1);
  cube.setInstanceVBOs(col1_1, col2_1, col3_1, col4_1, colors_1);
  cube.setNumInstances(m);
}

function main() {

  // Add controls to the gui
  const gui = new DAT.GUI();

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 10, -90), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const instance = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  function processKeyPresses() {
    let velocity: vec2 = vec2.fromValues(0,0);
    let newPos: vec2 = vec2.fromValues(0,0);
    vec2.add(newPos, velocity, planePos);
    lambert.setPlanePos(newPos);
    planePos = newPos;
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    processKeyPresses();

    renderer.render(camera, lambert, [
      plane,
    ]);
    renderer.render(camera, flat, [
      square,
    ]);
    renderer.render(camera, instance, [
      cube,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
