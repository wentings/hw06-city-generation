import {vec2, vec3, mat4, quat } from 'gl-matrix';
import Turtle from './Turtle';

// TODO: ask about the LSystem structure
let rand1 : number = Math.random();
let rand2 : number = Math.random();
let rand3 : number = Math.random();
export default class LSystem {
    turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0),
                               vec3.fromValues(1, 0, 0),
                               quat.fromValues(0, 0, 0, 1)); // Current turtle
    turtleHistory: Turtle[] = []; // Stack of turtle history
    thick: number;
    transformHistory: mat4[] = [];
    pointsPositions: vec2[] = [];

    constructor(center: vec3) {
        this.turtle.position = center;
    }

    fract(x : number) {
      return x - Math.floor(x);
    }

    hash(p : vec2)
    {
      var x;
      x = vec2.fromValues(p[0]*127.1 + p[1]* 311.7, p[0]*269.5 + p[1]* 183.3);
      return vec2.fromValues(this.fract(Math.sin(x[0] *18.5453)),this.fract(Math.sin(x[1] *18.5453)));
    }

    voronoi(x : vec2)
    {
        var n = vec2.fromValues(Math.floor(x[0]), Math.floor(x[1]));
        var f = vec2.fromValues(this.fract(x[0]), this.fract(x[1]));

        //----------------------------------
        // first pass: regular voronoi
        //----------------------------------
    	var mg, mr;

        var md = 8.0;
        var j, i;
        for(j=-1; j<=1; j++ )
        for(i=-1; i<=1; i++ )
        {
            var g = vec2.fromValues(i, j);
    		    var o = this.hash( vec2.fromValues(n[0] + g[0], n[1] + g[1]));
            var r = vec2.fromValues(g[0] + o[0] - f[0], g[1] + o[1] - f[1]);
            var d = r[0] * r[0] + r[1] * r[1];

            if( d<md )
            {
                md = d;
                mr = r;
                mg = g;
            }
        }
        //----------------------------------
        // second pass: distance to borders
        //----------------------------------
        md = 8.0;
        for(j=-2; j<=2; j++ )
        for(i=-2; i<=2; i++ )
        {
          var g : vec2;
          var r : vec2;
          g = vec2.fromValues(i + g[0],j + g[1]);
    		    var o = this.hash( vec2.fromValues(n[0] + g[0], n[1] + g[1]));
            r = vec2.fromValues(g[0] + o[0] - f[0], g[1] + o[1] - f[1]);

            var o_om = mr[0] - r[0];
            var m_om = mr[1] - r[1];
            var f_om = mr[0] + r[0];
            var g_om = mr[1] + r[1];
            var d_om = r[0] - mr[0];
            var i_om = r[1] - mr[1];

          if(((o_om) * (o_om) + (m_om) * (m_om)) > 0.000001)
    		{
            // distance to line
            var d = 0.5*f_om*d_om + 0.5*g_om*i_om;
            md = Math.min( md, d );
    		    }
        }
        return vec3.fromValues(md, mr[0], mr[1]);
    }

    generatePositions() {
      while (this.pointsPositions.length < 30) {
        var plusOrMinus1 = Math.random() < 0.5 ? -1 : 1;
        var plusOrMinus2 = Math.random() < 0.5 ? -1 : 1;
        var x = Math.floor(Math.random() * 20) + 0;
        var z = Math.floor(Math.random() * 20) + 0;
        var pos = vec2.fromValues(x * plusOrMinus1, z * plusOrMinus2);
        var frick = this.voronoi(pos);
        if (frick[0] >= 0.6) {
        this.pointsPositions.push(pos);
      }
      }

      while(this.pointsPositions.length < 50) {
        var plusOrMinus1 = Math.random() < 0.5 ? -1 : 1;
        var plusOrMinus2 = Math.random() < 0.5 ? -1 : 1;
        var x = Math.floor(Math.random() * 20) + 20;
        var z = Math.floor(Math.random() * 20) + 20;
        var pos = vec2.fromValues(x * plusOrMinus1, z * plusOrMinus2);
        var frick = this.voronoi(pos);
        if (frick[0] >= 0.6) {
        this.pointsPositions.push(pos);
      }
      }
    }
    drawSkyscrapers(temp: vec2) {
      this.turtle.position = vec3.fromValues(temp[0], 0, temp[1]);
      let i = Math.floor(Math.random() * 6) + 2;
      while (i > 0) {
          let transMat : any = this.turtle.getMatrix();
          this.transformHistory.push(transMat);
          this.turtle.moveUp();
          i = i -1;
        }
      this.turtle.position = this.turtle.getRandomXYCorner();
      this.turtle.size = Math.floor(Math.random() * 3) + 2;
      this.turtle.size2 = Math.floor(Math.random() * 3) + 1;
      let j = Math.floor(Math.random() * 8) + 3;
      while (j > 0) {
          let transMat : any = this.turtle.getMatrix();
          this.transformHistory.push(transMat);
          this.turtle.moveUp();
          j = j -1;
        }
    }

    drawHouses(temp: vec2) {
      this.turtle.position = vec3.fromValues(temp[0], 0, temp[1]);
      this.turtle.size = 4.0;
      this.turtle.size2 = 4.0;
      let i = Math.floor(Math.random() * 2) + 1;
      while (i > 0) {
          let transMat : any = this.turtle.getMatrix();
          this.transformHistory.push(transMat);
          this.turtle.moveUp();
          i = i -1;
        }
      this.turtle.position = this.turtle.getRandomXYCorner();
      this.turtle.size = Math.floor(Math.random() * 3) + 2;
      this.turtle.size2 = Math.floor(Math.random() * 3) + 2;
      let j = Math.floor(Math.random() * 2) + 0;
      while (j > 0) {
          let transMat : any = this.turtle.getMatrix();
          this.transformHistory.push(transMat);
          this.turtle.moveUp();
          j = j -1;
        }
    }

    draw() : void {
      var x, z;
      this.pointsPositions = [];
      this.generatePositions();
      for (x = 0; x < this.pointsPositions.length; x++) {
         var temp = this.pointsPositions[x];
         if (x < 30) {
           this.drawSkyscrapers(temp);
         }
         else {
           this.drawHouses(temp);
         }
      }
    }
}
