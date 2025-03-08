// @ts-nocheck
import * as THREE from 'three';
export const POS_MULTIPLIER = 50;
export function createRaindrops(scene) {
  const raindropCount = 5000; // Number of raindrops
  const raindrops = [];
  const worldSize = 10000; // Match the world size

  // Create a simple raindrop geometry
  const geometry = new THREE.SphereGeometry(2, 4, 4);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0xaaddff, 
    transparent: true,
    opacity: 0.6
  });

  // Create the raindrops
  for (let i = 0; i < raindropCount; i++) {
    const drop = new THREE.Mesh(geometry, material);
    
    drop.position.x = i*Math.floor(i/POS_MULTIPLIER);
    drop.position.y = Math.random()*100; // Random height
    drop.position.z = i*Math.floor(i/POS_MULTIPLIER);
    
    // Add to scene and to our array
    scene.add(drop);
    raindrops.push(drop);
  }

  return raindrops;
}