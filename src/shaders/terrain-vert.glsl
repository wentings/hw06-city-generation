#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

out float fs_Sine;

out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.

const vec4 lightPos = vec4(5, 10, 3, 1); //The position of our virtual light, which is used to compute the shading of

out float fs_Height;

out float fs_Moisture;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

float interpNoise2D(float x, float y) {
    float intX = floor(x);
    float fractX = fract(x);
    float intY = floor(y);
    float fractY = fract(y);

    float v1 = random1(vec2(intX, intY), vec2(311.7, 127.1));
    float v2 = random1(vec2(intX + 1.0f, intY), vec2(311.7, 127.1));
    float v3 = random1(vec2(intX, intY + 1.0f), vec2(311.7, 127.1));
    float v4 = random1(vec2(intX + 1.0, intY + 1.0), vec2(311.7, 127.1));

    float i1 = mix(v1, v2, fractX);
    float i2 = mix(v3, v4, fractX);

    return mix(i1, i2, fractY);
}


float generateMoisture(float x, float y) {
  // noise one - moisture
    float total = 0.0;
    float persistence = 0.1f;
    float octaves = 20.0;

    for (float i = 0.0; i < octaves; i = i + 1.0) {
        float freq = pow(2.0f, i);
        float amp = pow(persistence, i);
        total += interpNoise2D(x * freq, y * freq);
    }
    return total;
}

float generateHeight(float x, float y) {
  // noise two - elevation
    float total = 0.0;
    float persistence = 0.5f;
    float octaves = 10.0;

    for (float i = 0.0; i < octaves; i = i + 1.0) {
        float freq = pow(2.0f, i);
        float amp = pow(persistence, i);
        total += (1.0 / freq) * interpNoise2D(x * freq, y * freq);
    }
    return total;
}

void main()
{
  float elevation = generateHeight((vs_Pos.x + u_PlanePos.x) / (11.0),
                                  (vs_Pos.z + u_PlanePos.y) / (11.0));
  fs_Height = elevation;
  fs_Pos = vec3(vs_Pos.x, vs_Pos.y, vs_Pos.z);

  mat3 invTranspose = mat3(u_ModelInvTr);
  fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);

  vec4 modelposition = vec4(vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.0);
  modelposition = u_Model * modelposition;
  fs_LightVec = lightPos - modelposition;
  gl_Position = u_ViewProj * modelposition;
}
