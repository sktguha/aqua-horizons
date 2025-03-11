// @ts-nocheck
import * as THREE from 'three';
export const POS_MULTIPLIER = 50;
export function createRaindrops(scene) {
    const raindropCount = 50000 / 0.8; // Number of raindrops
    const raindrops = [];
    const worldSize = 10000; // Match the world size

    // Create a more elongated and pointed raindrop geometry
    // Use a custom geometry or a stretched cylinder with tapered ends
    const geometry = new THREE.CylinderGeometry(0.1, 0, 7, 5); // Tapered cylinder (thin at bottom)
    
    // Rotate the geometry to point downwards
    geometry.rotateX(Math.PI); // Flip to make the pointed end down
    
    // Blue-ish, slightly transparent material
    const material = new THREE.MeshBasicMaterial({
        color: 0xadd8e6, // Light blue
        transparent: true,
        opacity: 0.6,
    });

    // Create the raindrops
    for (let i = 0; i < raindropCount; i++) {
        const drop = new THREE.Mesh(geometry, material);
        // Position raindrops in a very narrow volume in front of player
        // X: distribute left/right around player (-50 to 50)
        drop.position.x = (Math.random() - 0.5) * 300;

        // Y: position in a lower height range
        drop.position.y = Math.random() * 170;

        // Z: tightly focused in front of player (-20 to 150)
        drop.position.z = -20 + Math.random() * 300;

        // Add to scene and to our array
        scene.add(drop);
        raindrops.push(drop);
    }

    return raindrops;
}