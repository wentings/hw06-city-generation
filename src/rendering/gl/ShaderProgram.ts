import {vec2, vec3, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.

  attrTransform1: number;
  attrTransform2: number;
  attrTransform3: number;
  attrTransform4: number;

  attrUV: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifPlanePos: WebGLUniformLocation;
  unifDayNight: WebGLUniformLocation;
  unifDensity: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes      = gl.getUniformLocation(this.prog, "u_CameraAxes");
    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef   = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp   = gl.getUniformLocation(this.prog, "u_Up");

    this.attrTransform1 = gl.getAttribLocation(this.prog, "vs_Transform1");
    this.attrTransform2 = gl.getAttribLocation(this.prog, "vs_Transform2");
    this.attrTransform3 = gl.getAttribLocation(this.prog, "vs_Transform3");
    this.attrTransform4 = gl.getAttribLocation(this.prog, "vs_Transform4");

    this.unifPlanePos   = gl.getUniformLocation(this.prog, "u_PlanePos");
    this.unifDayNight = gl.getUniformLocation(this.prog, "u_DayNight");
    this.unifDensity = gl.getUniformLocation(this.prog, "u_Density");
  }

  use() {
      if (activeProgram !== this.prog) {
        gl.useProgram(this.prog);
        activeProgram = this.prog;
      }
    }

    setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
      this.use();
      if(this.unifEye !== -1) {
        gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
      }
      if(this.unifRef !== -1) {
        gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
      }
      if(this.unifUp !== -1) {
        gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
      }
    }

    setDimensions(width: number, height: number) {
      this.use();
      if(this.unifDimensions !== -1) {
        gl.uniform2f(this.unifDimensions, width, height);
      }
    }

    setModelMatrix(model: mat4) {
      this.use();
      if (this.unifModel !== -1) {
        gl.uniformMatrix4fv(this.unifModel, false, model);
      }

      if (this.unifModelInvTr !== -1) {
        let modelinvtr: mat4 = mat4.create();
        mat4.transpose(modelinvtr, model);
        mat4.invert(modelinvtr, modelinvtr);
        gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
      }
    }

    setViewProjMatrix(vp: mat4) {
      this.use();
      if (this.unifViewProj !== -1) {
        gl.uniformMatrix4fv(this.unifViewProj, false, vp);
      }
    }

    setCameraAxes(axes: mat3) {
      this.use();
      if (this.unifCameraAxes !== -1) {
        gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
      }
    }

    setTime(t: number) {
      this.use();
      if (this.unifTime !== -1) {
        gl.uniform1f(this.unifTime, t);
      }
    }

    setPlanePos(pos: vec2) {
      this.use();
      if (this.unifPlanePos !== -1) {
        gl.uniform2fv(this.unifPlanePos, pos);
      }
    }



  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
        gl.enableVertexAttribArray(this.attrPos);
        gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
      }

      if (this.attrNor != -1 && d.bindNor()) {
        gl.enableVertexAttribArray(this.attrNor);
        gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
      }

      if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 3, gl.FLOAT, false, 0, 0); // TODO: pass in a mat4 of transformations
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    // -----------------------------

    // ------------------- TRANSFORMATION INFORMATION --------------------------
    if (this.attrTransform1 != -1 && d.bindTransform1()) {
      gl.enableVertexAttribArray(this.attrTransform1);
      gl.vertexAttribPointer(this.attrTransform1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform1, 1);
    }

    if (this.attrTransform2 != -1 && d.bindTransform2()) {
      gl.enableVertexAttribArray(this.attrTransform2);
      gl.vertexAttribPointer(this.attrTransform2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform2, 1);
    }

    if (this.attrTransform3 != -1 && d.bindTransform3()) {
      gl.enableVertexAttribArray(this.attrTransform3);
      gl.vertexAttribPointer(this.attrTransform3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform3, 1);
    }

    if (this.attrTransform4 != -1 && d.bindTransform4()) {
      gl.enableVertexAttribArray(this.attrTransform4);
      gl.vertexAttribPointer(this.attrTransform4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTransform4, 1);
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
    }

    d.bindIdx();
    if (d.numInstances > 0) {
  gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);
}
else {
  gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);
}

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
  }
};

export default ShaderProgram;
