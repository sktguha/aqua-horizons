// @ts-nocheck
import * as THREE from 'three';
export function createRaindrops(scene, count = 5000) {
    // add flag to make snow , hail etc sizes later, easy to customize
    // add key listerner to change the weather based different keys, 
    // 6,7,8,9 , 8 and 9 can control intensity of rain snow etc, 
    // 6 and 7 can control rain and snow respectively
    // Rain material
    const rainMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    // Simple version without the complex nodes system
    rainMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        varying vec2 vUv;
        void main() {
          float distance = 1.0 - distance(vUv, vec2(0.5, 0.0));
          float opacity = exp(distance * 3.0) * 0.1;
        `
      );
      
      shader.fragmentShader = shader.fragmentShader.replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        'gl_FragColor = vec4( outgoingLight, opacity );'
      );
      
      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        varying vec2 vUv;
        void main() {
          vUv = uv;
        `
      );
    };
  
    // Create raindrop geometry
    const rainGeometry = new THREE.PlaneGeometry(0.1, 2);
    
    // Create raindrop instance
    const raindrops = new THREE.InstancedMesh(rainGeometry, rainMaterial, count);
    
    // Position raindrops randomly
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.x = (Math.random() - 0.5) * 100;
      dummy.position.y = 200;
      dummy.position.z = (Math.random() - 0.5) * 100;
      dummy.updateMatrix();
      raindrops.setMatrixAt(i, dummy.matrix);
    }
    
    raindrops.instanceMatrix.needsUpdate = true;
    scene.add(raindrops);
    
    return raindrops;
  }