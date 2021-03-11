#version 330 compatibility
in vec2 vST;
uniform sampler2D uImageUnit;
uniform float uSc;
uniform float uTc;
uniform float uDs;
uniform float uDt;
uniform bool uUseCircle;
uniform bool uUseTaper;
uniform float uRadius;
uniform float Timer;
uniform sampler2D Noise2;
uniform float uNoiseAmp;


uniform float uNoiseFreq;
//uniform float uDistortionStrength;
uniform float uDistortionSpeed;
const float PI = 3.1415926;

bool inRectangle(){
    float s = vST.s;
    float t = vST.t;
    if( s <= uSc + uDs && s >= uSc - uDs && t <= uTc + uDt && t >= uTc - uDt){
        return true;
    }
    return false;

}



bool inCircle(){
    if(sqrt(pow((vST.s-uSc),2) + pow((vST.t-uTc),2))  <= uRadius){
        return true;
    }
    return false;



}

float calculateCircleTaper(){
    float distanceFromCenter = sqrt(pow((vST.s-uSc),2) + pow((vST.t-uTc),2));
    float taper = smoothstep(uRadius*2,uRadius,distanceFromCenter);

    return taper;
}


//formula to calculate distance to nearest point on a rectangle from an arbirtrary point
//is adapted from this post: https://stackoverflow.com/questions/5254838/calculating-distance-between-a-point-and-a-rectangular-box-nearest-point
float calculateRectTaper(){
    float minS = uSc - uDs;
    float maxS = uSc + uDs;
    float minT = uTc - uDt;
    float maxT = uTc + uDt;

    float ds = max ((max(minS - vST.s,0.)),(vST.s - maxS));
    float dt = max ((max(minT - vST.t,0.)),(vST.t - maxT));
    float distanceFromRect = sqrt(ds*ds + dt*dt);

    float taper = smoothstep(.1,0,distanceFromRect);

    return taper;
}


void
main( )
{
    float taper = 0.;
    vec3 newcolor;
    bool inLens = false;
    if(uUseCircle){
        if(inCircle()){
            inLens = true;
            taper = 1.;
        }else{
            taper = calculateCircleTaper();
        }
    }else{
        if(inRectangle()){
            inLens = true;
            taper = 1.;
        }else{
            taper = calculateRectTaper();
        }
    }

    if(uUseTaper || inLens){
        vec4 nv = texture( Noise2, uNoiseFreq * vST );
        float n = nv.r + nv.g + nv.b + nv.a; // range is 1. -> 3.
        n = n -2;
        n*=uNoiseAmp;
       
        float newS, newT;
        newS = vST.s + taper * n * cos(2*PI* Timer* uDistortionSpeed);
        newT = vST.t + taper * n*sin(2*PI *Timer* uDistortionSpeed);
        vec2 newVST = vec2( newS, newT);
        newcolor = texture( uImageUnit, newVST ).rgb; 
      
        gl_FragColor = vec4( newcolor, 1. );


      
    }else{
        newcolor = texture( uImageUnit, vST ).rgb; 
      
        gl_FragColor = vec4( newcolor, 1. );
    }

        


      








}