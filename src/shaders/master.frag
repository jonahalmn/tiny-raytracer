    precision highp float;

    varying vec2 v_position;

    uniform mat4 u_inverseProjectionMatrix;
    uniform mat4 u_modelInverse;

    uniform vec3 u_circle1Position;
    uniform vec3 u_circle1Color;

    uniform vec3 u_circle2Position;
    uniform vec3 u_circle2Color;

    uniform vec3 u_circle3Position;
    uniform vec3 u_circle3Color;

    vec3 lightPosition = (vec4(10., 10., -0., 1.) * u_modelInverse).xyz;
    float minDistance = 10000.;


    vec4 raytraceSphere(vec3 o, vec3 position, vec3 circlePos, float isFromCam){

        //vec3 o = vec3(0.);
        vec3 d = position;
        d = normalize(d);
        vec3 pos = circlePos - o;

        float dMag = dot(pos, d);
        d *= dMag;

        float radius = distance(d, pos);

        float rayLength = dMag + step(.5, radius) * 1000.;

        if(rayLength < minDistance && isFromCam == 1.){
            minDistance = rayLength;
        }

        // c2 = a2 + b2
        // a2 = c2 - b2
        float thickness = -(radius * radius) + (.5 * .5);
        thickness = sqrt(abs(thickness));

        vec3 d1 = position;
        d1 = normalize(d);

        rayLength = (dMag - thickness) + step(.5, radius) * 1000.;

        vec3 hit_point = (d1) * (dMag - thickness);
        vec3 surface_normal = normalize(hit_point - circlePos);

        float light_power = dot(normalize(surface_normal), normalize(lightPosition));
        
        return vec4(light_power, rayLength, 1. - step(.5, radius), hit_point);
    }

    vec2 raytraceFloor(vec3 o, vec2 position, vec3 planePosition, vec3 n){
        vec3 l = vec3(position, -1.);
        l = normalize(l);

        float denom = dot(n, l);

        float iDist = -100000000000000.;
        float outShadow = 1.;

        if(denom < -0.000001){
            vec3 p0l0 = planePosition - o;
            iDist = dot(p0l0, n) / denom;

            vec3 hit_point = l * iDist;
            outShadow *= (1. - raytraceSphere(hit_point, lightPosition, (vec4(u_circle1Position, 1.) * u_modelInverse).xyz, 0.).z);
            outShadow *= (1. - raytraceSphere(hit_point, lightPosition, (vec4(u_circle2Position, 1.) * u_modelInverse).xyz, 0.).z);
            outShadow *= (1. - raytraceSphere(hit_point, lightPosition, (vec4(u_circle3Position, 1.) * u_modelInverse).xyz, 0.).z);
        }

        return vec2(step(.0, (iDist)) * outShadow, abs (iDist));
    }

    void main(){
        vec2 position = (vec4(v_position, 0., 1.) * u_inverseProjectionMatrix).xy;
        lightPosition = normalize(lightPosition);

        vec3 ray1 = raytraceSphere(vec3(0.), vec3(position, -1.), (vec4(u_circle1Position, 1.) * u_modelInverse).xyz, 1. ).xyz;
        vec3 ray2 = raytraceSphere(vec3(0.), vec3(position, -1.), (vec4(u_circle2Position, 1.) * u_modelInverse).xyz, 1. ).xyz;
        vec3 ray3 = raytraceSphere(vec3(0.), vec3(position, -1.), (vec4(u_circle3Position, 1.) * u_modelInverse).xyz, 1.).xyz;

        vec2 rayPlane = raytraceFloor(vec3(0.), position, vec3(0.,-1.,0.), vec3(0.,1.,0.));

        vec3 color = vec3(.0);
        vec3 color1 = ray1.x * u_circle1Color * ray1.z ;//* (1. - raytraceSphere(ray1.w,  lightPosition, (vec4(u_circle1Position, 1.) * u_modelInverse).xyz, 0.).z);
        vec3 color2 = ray2.x * u_circle2Color * ray2.z ;//* (1. - raytraceSphere(ray2.w,  lightPosition, (vec4(u_circle1Position, 1.) * u_modelInverse).xyz, 0.).z);
        vec3 color3 = ray3.x * u_circle3Color * ray3.z ;//* (1. - raytraceSphere(ray3.w,  lightPosition, (vec4(u_circle1Position, 1.) * u_modelInverse).xyz, 0.).z);

        vec3 colorPlane = (rayPlane.x) * vec3(.7,.5,.5);

        float minDist = min(min(ray1.y, ray2.y), ray3.y);

        colorPlane *= 1. - (step(minDistance + .01, rayPlane.y ));

        color1 *= 1. - (step(minDistance + .01, ray1.y ));
        color2 *= 1. - (step(minDistance + .01, ray2.y ));
        color3 *= 1. - (step(minDistance + .01, ray3.y ));

        color = color1 + color2 + color3 + colorPlane;

        gl_FragColor = vec4(color, 1.);
        //gl_FragColor.xyz += (step(gl_FragColor.x, .0001) * step(gl_FragColor.y, .0001) * step(gl_FragColor.z, .0001)) * vec3(.2, .6, .8);
    }