import {vec3, mat4, quat} from 'gl-matrix';


export default class Turtle {
  position: vec3 = vec3.create();
  direction: vec3 = vec3.create(); // Ensure that orientation is normalized;
  quaternion: quat = quat.create();
  size: number = 3.5;
  size2: number = 3.5;

  constructor(pos: vec3, orient: vec3, q: quat) {
    this.position = pos;
    this.direction = orient;
    this.quaternion = q;
  }

  clear() {
    this.position = vec3.fromValues(0, 0, 0);
    this.direction = vec3.fromValues(0, 0, 1);
    this.quaternion = quat.fromValues(0, 0, 1, 0);
  }

  // F
  moveUp() {
    let translate = vec3.fromValues(0, this.size, 0);
    vec3.add(this.position, this.position, translate);
  }

  // change center
  getRandomXYCorner() {
    var deltaX, deltaZ;
		let i = Math.floor(Math.random() * 4) + 0;
    if (i == 0) {
      deltaX = this.size / 2.;
      deltaZ = this.size2 / 2.;
    } else if (i == 1) {
      deltaX = this.size / 2.;
      deltaZ = -this.size2 / 2.;
    } else if (i == 2) {
      deltaX = -this.size / 2.;
      deltaZ = this.size2 / 2.;
    } else {
      deltaX = -this.size / 2.;
      deltaZ = -this.size2 / 2.;
}
		let pos: vec3 = vec3.fromValues(this.position[0] + deltaX, 0, this.position[2] + deltaZ);
    let angle = Math.random() * 180;
		vec3.rotateY(pos, pos, vec3.fromValues(this.position[0], 0, this.position[2]), angle);

		return vec3.fromValues(pos[0], 0, pos[2]);
	}

  getMatrix() {
    // Translate
        let T: mat4 = mat4.create();
        mat4.fromTranslation(T, this.position);

        // Rotate
        let R: mat4 = mat4.create();
        mat4.fromQuat(R, this.quaternion);

        // Scale, based on depth
        let S: mat4 = mat4.create();
        mat4.fromScaling(S, vec3.fromValues(this.size, this.size, this.size2));

        // Multiply together
        let transformation: mat4 = mat4.create();
        mat4.multiply(transformation, R, S);
        return mat4.multiply(transformation, T, transformation);
  }

}
