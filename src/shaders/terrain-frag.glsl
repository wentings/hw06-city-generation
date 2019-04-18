#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_LightVec;

in float fs_Sine;

in float fs_Height;

in float fs_Moisture;

out vec4 out_Col; // This is the final output color that you will see on your
// screen for the pixel that is currently being processed.


vec2 hash( vec2 p ) { p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*18.5453); }

vec3 voronoi( in vec2 x )
{
    vec2 n = floor(x);
    vec2 f = fract(x);

    //----------------------------------
    // first pass: regular voronoi
    //----------------------------------
	vec2 mg, mr;

    float md = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash( n + g );
		#ifdef ANIMATE
        o = 0.5 + 0.5*sin( iTime*0.5 + 6.2831*o );
        #endif
        vec2 r = g + o - f;
        float d = dot(r,r);

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
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = mg + vec2(float(i),float(j));
		vec2 o = hash( n + g );
		#ifdef ANIMATE
        o = 0.5 + 0.5*sin( iTime*0.5 + 6.2831*o );
        #endif
        vec2 r = g + o - f;


        if( dot(mr-r,mr-r)>0.000001 )
		{
        // distance to line
        float d = dot( 0.5*(mr+r), normalize(r-mr) );

        md = min( md, d );
		}
    }
    return vec3( md, mr );
}

void main()
{
  // computer voronoi patterm
   vec3 c = voronoi(0.05 * vec2(fs_Pos.x, fs_Pos.z));

   // colorize
   vec3 col;
    col = vec3(254,83,187);
   // borders
  col = vec3( 1. - c.x / 0.05,  1. - c.x / 0.05,  1. - c.x / 0.05);
  // this controls the thickness of the roads
//  col -= (1.0-smoothstep( 0.01, 0.03, c.x));

  // write  2d grid
  out_Col = vec4(col, 1.0);
}
