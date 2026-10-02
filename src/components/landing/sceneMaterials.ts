import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export function createSky(dark: boolean) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      zenith: { value: new THREE.Color(dark ? '#25344c' : '#26343e') },
      horizon: { value: new THREE.Color(dark ? '#6c7487' : '#c5b6b0') },
      sunset: { value: new THREE.Color(dark ? '#a5856c' : '#ffcdab') },
      glowStrength: { value: dark ? .5 : .9 },
    },
    vertexShader: `varying vec3 vDirection;
      void main(){ vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vDirection; uniform vec3 zenith,horizon,sunset; uniform float glowStrength;
      void main(){
        vec3 d=normalize(vDirection);
        vec3 c=mix(horizon,zenith,smoothstep(0.,.4,max(0.,d.y)));
        float glow=exp(-pow((d.x-.34)*2.4,2.)-pow((d.y-.045)*6.,2.));
        c=mix(c,sunset,glow*glowStrength);
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export function createWater(dark: boolean, mobile: boolean) {
  const shader = {
    uniforms: { color: { value: new THREE.Color() }, tDiffuse: { value: null }, textureMatrix: { value: new THREE.Matrix4() },
      time: { value: 0 }, tint: { value: new THREE.Color(dark ? '#132033' : '#465963') } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vWorld;
      void main(){ vUv=textureMatrix*vec4(position,1.); vWorld=(modelMatrix*vec4(position,1.)).xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float time; uniform vec3 tint;
      varying vec4 vUv; varying vec3 vWorld;
      void main(){
        vec2 uv=vUv.xy/vUv.w;
        float wave=sin(vWorld.z*8.+sin(vWorld.x*2.1)+time*.32)*.5;
        wave+=sin(vWorld.z*17.3-vWorld.x*.8-time*.23)*.22;
        float nearWave=1.-smoothstep(5.,65.,distance(cameraPosition,vWorld));
        uv.x+=wave*.004*nearWave;
        uv.y+=sin(vWorld.z*11.+time*.22)*.0018*nearWave;
        vec3 reflected=texture2D(tDiffuse,uv).rgb;
        reflected+=texture2D(tDiffuse,uv+vec2(.0015,0.)).rgb;
        reflected+=texture2D(tDiffuse,uv-vec2(.0015,0.)).rgb;
        vec3 c=mix(tint,reflected/3.,.72);
        c+=vec3(.014,.016,.018)*wave*nearWave;
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  };
  const water = new Reflector(new THREE.PlaneGeometry(350, 350), {
    textureWidth: mobile ? 512 : 1024, textureHeight: mobile ? 512 : 1024,
    clipBias: .002, multisample: 0, shader,
  });
  water.rotation.x = -Math.PI / 2;
  return water;
}

