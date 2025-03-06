// @ts-nocheck
import * as THREE from 'three';
// import { colors, worldX, worldY, balls, speedRanges, ballSpeeds, scene, trees, treeSpeeds, squares, rectangles } from './main';
import { createPatch, generatePatch } from './noisePatch';

export const balls: THREE.Mesh[] = [];
export const trees: THREE.Mesh[] = [];
export const squares: THREE.Mesh[] = [];
export const rectangles: THREE.Mesh[] = [];
export const ballSpeeds: number[] = [];
export const treeSpeeds: number[] = [];
export const colors = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00,
  0xff00ff,
  0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, // Replicate cyan multiple times
  0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff,
  0xffa500,
  0x800080,
  0x008000
];
export const speedRanges = {
  0xff0000: [0.1, 0.02], // Red
  0x00ff00: [0.2, 0.03], // Green
  0x0000ff: [0.3, 0.04], // Blue
  0xffff00: [0.4, 0.05], // Yellow
  0xff00ff: [0.5, 0.06], // Magenta
  0x00ffff: [0.6, 0.07], // Cyan
  0xffa500: [0.7, 0.08], // Orange
  0x800080: [0.8, 0.09], // Purple
  0x008000: [0.9, 0.1]   // Dark Green
};

export const worldX = 100000, worldY = 100000;
export const getRandomColorBallon = () => colors[Math.floor(Math.random() * colors.length)];
// Add random objects
export const addRandomObjects = (scene, isOcean = false) => {
  const geometry = new THREE.SphereGeometry(200, 32, 32); // Balloon shape
  const OBJECTS_TO_RENDER = 5000;



  // Add balloon-shaped balls
  for (let i = 0; i < OBJECTS_TO_RENDER/2; i++) { // Increased number of objects
    const color = getRandomColorBallon();
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
    const balloon = new THREE.Mesh(geometry, material);
    balloon.scale.set(1, 1.5, 1); // Make it balloon-shaped
    balloon.position.set(
      Math.random() * worldX - worldX / 2, // Adjusted spread
      Math.random() * 200 + 10, // Increased spread
      Math.random() * worldY - worldY / 2 // Adjusted spread
    );
    balls.push(balloon);
    const [minSpeed, maxSpeed] = speedRanges[color];
    ballSpeeds.push((Math.random() * (maxSpeed - minSpeed)) + minSpeed); // Random speed within range
    scene.add(balloon);
  }

  function interpolateColor() {

  const color1 = 0x00ff00;
  const color2 = 0x2B1B17;
  const factor = Math.random();
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
  
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
  
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
  
    return (r << 16) + (g << 8) + b;
  }
  

  // Add trees
  for (let i = 0; i < OBJECTS_TO_RENDER; i++) { // Increased number of objects
    const treeGeometry = new THREE.ConeGeometry(200, 1000+Math.random()*2000, 200); // Reduced size
    const treeMaterial = new THREE.MeshStandardMaterial({ color: interpolateColor() });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    const x = Math.random() * worldX - worldX / 2;
    const z = Math.random() * worldY - worldY / 2;

    // Prevent trees from being generated near the user's spawn position (within a radius of 1000 units)
    const distanceFromOrigin = Math.sqrt(x * x + z * z);
    if (distanceFromOrigin < 1000) {
      continue;
    }

    tree.position.set(x, Math.random() * 200 + 10, z);
    trees.push(tree);
    treeSpeeds.push((Math.random() * 0.02) + 0.01); // Random speed
    scene.add(tree);
  }

  // Add squares
  for (let i = 0; i < 0; i++) {
    const squareGeo = new THREE.BoxGeometry(100, 100*10, 100);
    const squareMat = new THREE.MeshStandardMaterial({ color: getRandomColorBallon() });
    const square = new THREE.Mesh(squareGeo, squareMat);
    square.position.set(
      Math.random() * worldX - worldX / 2,
      10 + Math.random() * 100,
      Math.random() * worldY - worldY / 2
    );
    squares.push(square);
    scene.add(square);
  }

  // Add rectangles
  for (let i = 0; i < 0; i++) {
    const rectGeo = new THREE.BoxGeometry(200, 1000, 100);
    const rectMat = new THREE.MeshStandardMaterial({ color: getRandomColorBallon() });
    const rect = new THREE.Mesh(rectGeo, rectMat);
    rect.position.set(
      Math.random() * worldX - worldX / 2,
      10 + Math.random() * 100,
      Math.random() * worldY - worldY / 2
    );
    rectangles.push(rect);
    scene.add(rect);
  }

  // Add a single island
  const islandGeometry = new THREE.BoxGeometry(10000, 50, 2000); // Reduced height
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: '#333333',
      dithering: true
  });
  
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  
  const material = new THREE.MeshStandardMaterial({
      color: '#ffbe67',
      dithering: true
    });
  
    let lods = [];
    for (let i = 0; i < 4; i++) {
      let m = createPatch(scene, material, isOcean);
      let scl = (i + 1) ** 3;
      m.scale.x = scl;
      m.scale.z = scl;
      m.scale.y = i + 1;
      lods.push(m);
      generatePatch(m, 0, i);
    }

  island.position.set(-20, -20, -20); // Adjusted position to match reduced height
  if(isOcean)
  scene.add(island);

  // Add trees on the single island
  const islandTreeGeometry = new THREE.ConeGeometry(25, 125, 32); // Reduced size
  const islandTreeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (let i = 0; i < 60; i++) { // Add 60 trees on the island
    const tree = new THREE.Mesh(islandTreeGeometry, islandTreeMaterial);
    tree.position.set(
      island.position.x + (Math.random() * 800 - 400), // Random position within island
      50, // Height of the island
      island.position.z + (Math.random() * 800 - 400) // Random position within island
    );
    scene.add(tree);
  }

  // Add forest clusters
  const forestTreeGeometry = new THREE.ConeGeometry(50, 250, 32); // Reduced size
  const forestTreeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green color
  const forestPositions = [
    { x: -5000, z: -5000 },
    { x: 5000, z: -5000 },
    { x: -5000, z: 5000 },
    { x: 5000, z: 5000 }
  ];
  forestPositions.forEach(pos => {
    for (let i = 0; i < 200; i++) {
      const tree = new THREE.Mesh(forestTreeGeometry, forestTreeMaterial);
      tree.position.set(
        pos.x + (Math.random() * 2000 - 1000), // Cluster around the position
        10,
        pos.z + (Math.random() * 2000 - 1000) // Cluster around the position
      );
      trees.push(tree);
      scene.add(tree);
    }
  });

  // Add clusters of small objects
  for (let i = 0; i < 100; i++) { // Number of clusters
    const smallObjectGeometry = new THREE.SphereGeometry(50/2, 16/2, 16/2); // Smaller size
  const smallObjectMaterial = new THREE.MeshStandardMaterial({ color: getRandomColorBallon() });
  
    const cluster = new THREE.Group();
    for (let j = 0; j < 10; j++) { // Number of objects per cluster
      const smallObject = new THREE.Mesh(smallObjectGeometry, smallObjectMaterial);
      smallObject.position.set(
        Math.random() * 500 , // Cluster spread
        Math.random() * 500 ,
        Math.random() * 500 
      );
      cluster.add(smallObject);
    }
    cluster.position.set(
      Math.random() * 20*20,
      Math.random() * 20*20,
      Math.random() * 20*20
    );
    scene.add(cluster);
  }

  return {balls, trees, treeSpeeds, ballSpeeds};
};
