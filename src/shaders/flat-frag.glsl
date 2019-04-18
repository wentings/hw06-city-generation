#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

//Object setup
vec4 sph1 = vec4( 0.0, 0.0, 0.0, 1.0);
float EPSILON = 0.1;
float PI = 3.1415926;

#define saturate(x) clamp(x,0.,1.)
#define rgb(r,g,b) (vec3(r,g,b)/255.)

float rand(float x) { return fract(sin(x) * 71523.5413291); }

float rand(vec2 x) { return rand(dot(x, vec2(13.4251, 15.5128))); }

float noise(vec2 x)
{
    vec2 i = floor(x);
    vec2 f = x - i;
    f *= f*(3.-2.*f);
    return mix(mix(rand(i), rand(i+vec2(1,0)), f.x),
               mix(rand(i+vec2(0,1)), rand(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 x)
{
    float r = 0.0, s = 1.0, w = 1.0;
    for (int i=0; i<5; i++)
    {
        s *= 2.0;
        w *= 0.5;
        r += w * noise(s * x);
    }
    return r;
}

float cloud(vec2 uv, float scalex, float scaley, float density, float sharpness, float speed)
    {
      return pow(saturate(fbm(vec2(scalex,scaley)*(uv+vec2(speed,0)*u_Time / 5.0))-(1.0-density)), 1.0-sharpness);
    }

    vec3 render(vec2 uv)
    {
      // sky
      vec3 color = mix(rgb(8,247,254), rgb(254,83,187), uv.y);
      // sun
      vec2 spos = uv - vec2(0.95, 1.0);
      float sun = exp(-4.*dot(spos,spos));
      vec3 scol = rgb(255,155,102) * sun * 0.7;
      color += scol;
      // clouds
      vec3 cl1 = mix(rgb(166,191,224), rgb(245,211,0), uv.y);
      color = mix(color, cl1, cloud(uv,3.,10.,0.55,0.05,0.01));

      // post
      color *= vec3(1.0,0.93,0.81)*1.04;
      color = mix(0.75*rgb(255,205,161), color, smoothstep(-0.1,0.3,uv.y));
      color = pow(color,vec3(1.3));
      return color;
    }

void main() {
  vec2 uv = fs_Pos.xy;
  uv.y += 0.5;
  out_Col = vec4(render(uv), 1.0);
}
