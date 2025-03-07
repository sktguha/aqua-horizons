// @ts-nocheck
import * as THREE from 'three';
import { noise } from 'perlin-noise';
// import { colors, worldX, worldY, balls, speedRanges, ballSpeeds, scene, trees, treeSpeeds, squares, rectangles } from './main';
import { createPatch, generatePatch } from './patchUtils';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

export const deepBrownShades = [
  "#4a2e28", // Dark Redwood
  "#3b241f", // Coffee Bean
  "#5a3a31", // Chestnut Brown
  "#2f1d19", // Espresso Brown
  "#472f26", // Mahogany Shadow
  "#593d35", // Deep Clay
  "#36221c", // Burnt Umber
  "#6b443a", // Warm Walnut
  "#402a24", // Dark Cocoa
  "#512f29", // Rich Mocha
  "#2d1b16", // Charcoal Brown
  "#55382e"  // Deep Oak
];

export const balls: THREE.Mesh[] = [];
export const trees: THREE.Mesh[] = [];
export const squares: THREE.Mesh[] = [];
export const rectangles: THREE.Mesh[] = [];
export const ballSpeeds: number[] = [];
export const treeSpeeds: number[] = [];
export const fishes: THREE.Mesh[] = []; // Declare new fish array
export const colors = [
  0xff0000,
  0x0000ff,
  0xffff00,
  0xff00ff,
  0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, // Replicate cyan multiple times
  0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff, 0x00ffff,
  0xffa500,
  0x800080
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

export function getBiasedCoordinate(worldX, worldY) {
  const biasFactor = 4; // Higher = more clustering
  let x = Math.pow(Math.random(), biasFactor) * worldX - worldX / 2;
  let z = Math.pow(Math.random(), biasFactor) * worldY - worldY / 2;
  return { x, z };
}

export function createFish() {
  const divisions = 200;
  // shaping curves
  // top
  let topCurve = new THREE.CatmullRomCurve3(
    [
      [0, 0],
      [0.1, 0.15],
      [1, 0.75],
      [3.5, 1.5],
      [9, 0.5],
      [9.5, 0.45],
      [10, 0.55]
    ].map(p => { return new THREE.Vector3(p[0], p[1], 0) })
  );
  let topPoints = topCurve.getSpacedPoints(100);
  // bottom
  let bottomCurve = new THREE.CatmullRomCurve3(
    [
      [0, 0],
      [0.1, -0.15],
      [0.5, -0.35],
      [4.5, -1],
      [8, -0.6],
      [9.5, -0.45],
      [10, -0.55]
    ].map(p => { return new THREE.Vector3(p[0], p[1], 0) })
  );
  let bottomPoints = bottomCurve.getSpacedPoints(100);
  // side
  let sideCurve = new THREE.CatmullRomCurve3(
    [
      [0, 0, 0],
      [0.1, 0, 0.125],
      [1, 0, 0.375],
      [4, -0.25, 0.6],
      [8, 0, 0.25],
      [10, 0, 0.05]
    ].map(p => { return new THREE.Vector3(p[0], p[1], p[2]) })
  );
  let sidePoints = sideCurve.getSpacedPoints(100);

  // frames
  let frames = computeFrames();
  // frames to geometry
  let pts = [];
  let parts = [];
  frames.forEach(f => {
    f.forEach(p => {
      pts.push(p.x, p.y, p.z);
      parts.push(0);
    })
  })

  // FINS
  // tail fin
  let tailCurve = new THREE.CatmullRomCurve3(
    [
      [11, -1.],
      [12.5, -1.5],
      [12., 0],
      [12.5, 1.5],
      [11, 1.],
    ].map(p => { return new THREE.Vector3(p[0], p[1], p[2]) })
  );
  let tailPoints = tailCurve.getPoints(divisions / 2);
  let tailPointsRev = tailPoints.map(p => { return p }).reverse();
  tailPointsRev.shift();
  let fullTailPoints = tailPoints.concat(tailPointsRev);

  let tailfinSlices = 5;
  let tailRatioStep = 1 / tailfinSlices;
  let vTemp = new THREE.Vector3();
  let tailPts = [];
  let tailParts = [];
  for (let i = 0; i <= tailfinSlices; i++) {
    let ratio = i * tailRatioStep;
    frames[frames.length - 1].forEach((p, idx) => {
      vTemp.lerpVectors(p, fullTailPoints[idx], ratio);
      tailPts.push(vTemp.x, vTemp.y, vTemp.z);
      tailParts.push(1);
    })
  }
  let gTail = new THREE.PlaneGeometry(1, 1, divisions, tailfinSlices);
  gTail.setAttribute("position", new THREE.Float32BufferAttribute(tailPts, 3));
  gTail.setAttribute("parts", new THREE.Float32BufferAttribute(tailParts, 1));
  gTail.computeVertexNormals();

  // dorsal
  let dorsalCurve = new THREE.CatmullRomCurve3(
    [
      [3, 1.45],
      [3.25, 2.25],
      [3.75, 3],
      [6, 2],
      [7, 1]
    ].map(p => { return new THREE.Vector3(p[0], p[1], 0) })
  );
  let dorsalPoints = dorsalCurve.getSpacedPoints(100);
  let gDorsal = createFin(topPoints, dorsalPoints, true);

  // rect
  let rectCurve = new THREE.CatmullRomCurve3(
    [
      [6, -0.9],
      [7.25, -1.5],
      [7.5, -0.75]
    ].map(p => { return new THREE.Vector3(p[0], p[1], 0) })
  );
  let rectPoints = rectCurve.getSpacedPoints(40);
  let gRect = createFin(bottomPoints, rectPoints, false);

  // pelvic
  let pelvicCurve = new THREE.CatmullRomCurve3(
    [
      [2.25, -0.7],
      [3.75, -2],
      [4, -1]
    ].map(p => { return new THREE.Vector3(p[0], p[1], 0) })
  );
  let pelvicPoints = pelvicCurve.getSpacedPoints(40);

  let gPelvic = createFin(bottomPoints, pelvicPoints, false);
  gPelvic.translate(0, 0.6, 0);
  let gPelvicL = gPelvic.clone();
  gPelvicL.rotateX(THREE.MathUtils.degToRad(-20));
  gPelvicL.translate(0, -0.6, 0);
  let gPelvicR = gPelvic.clone();
  gPelvicR.rotateX(THREE.MathUtils.degToRad(20));
  gPelvicR.translate(0, -0.6, 0);

  let bodyGeom = new THREE.PlaneGeometry(1, 1, divisions, frames.length - 1);
  bodyGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  bodyGeom.setAttribute("parts", new THREE.Float32BufferAttribute(parts, 1));
  bodyGeom.computeVertexNormals();

  let mainGeom = BufferGeometryUtils.mergeBufferGeometries([bodyGeom, gTail, gDorsal, gRect, gPelvicL, gPelvicR]);
  return mainGeom;

  function createFin(basePoints, contourPoints, isTop) {
    let basePts = [];
    let shift = 0.05;
    let shiftSign = isTop ? 1 : -1;
    let vAdd = new THREE.Vector3(0, -shift * shiftSign, 0);

    contourPoints.forEach((p, idx) => {
      basePts.push(getPoint(basePoints, p.x).add(vAdd));
    });

    let basePtsRev = basePts.map(p => { return p.clone() }).reverse();
    basePtsRev.shift();

    let contourPointsRev = contourPoints.map(p => { return p.clone() }).reverse();
    contourPointsRev.shift();

    basePts.forEach((p, idx, arr) => {
      if (idx > 0 && idx < arr.length - 1) p.setZ(shift * shiftSign)
    });
    basePtsRev.forEach((p, idx, arr) => {
      if (idx < arr.length - 1) p.setZ(-shift * shiftSign)
    });

    let fullPoints = [];
    fullPoints = fullPoints.concat(contourPoints, contourPointsRev, basePts, basePtsRev);

    let ps = [];
    let parts = [];
    fullPoints.forEach(p => {
      ps.push(p.x, p.y, p.z);
      parts.push(1);
    });

    let plane = new THREE.PlaneGeometry(1, 1, (contourPoints.length - 1) * 2, 1);
    plane.setAttribute("position", new THREE.Float32BufferAttribute(ps, 3));
    plane.setAttribute("parts", new THREE.Float32BufferAttribute(parts, 1));
    plane.computeVertexNormals();
    return plane;
  }

  function computeFrames() {
    let frames = [];
    let step = 0.05;
    frames.push(new Array(divisions + 1).fill(0).map(p => { return new THREE.Vector3() })); // first frame all 0
    for (let i = step; i < 10; i += step) {
      frames.push(getFrame(i));
    }
    frames.push(getFramePoints(topPoints[100], bottomPoints[100], sidePoints[100])); // last frame at tail
    return frames;
  }

  function getFrame(x) {
    let top = getPoint(topPoints, x);
    let bottom = getPoint(bottomPoints, x);
    let side = getPoint(sidePoints, x);
    return getFramePoints(top, bottom, side);
  }

  function getFramePoints(top, bottom, side) {
    let sideR = side;
    let sideL = sideR.clone().setZ(sideR.z * -1);
    let baseCurve = new THREE.CatmullRomCurve3([
      bottom,
      sideR,
      top,
      sideL
    ], true);

    let framePoints = baseCurve.getSpacedPoints(divisions);
    return framePoints;
  }

  function getPoint(curvePoints, x) {
    let v = new THREE.Vector3();
    for (let i = 0; i < curvePoints.length - 1; i++) {
      let i1 = curvePoints[i];
      let i2 = curvePoints[i + 1];
      if (x >= i1.x && x <= i2.x) {
        let a = (x - i1.x) / (i2.x - i1.x);
        return v.lerpVectors(i1, i2, a);
      }
    }
  }
}

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

  function interpolateColor(x, z) {
    const color1 = 0x00ff00; // Green
    const color2 = 0x2B1B17; // Brown
    let normalizedX = (x + worldX / 2) / worldX;
    let normalizedZ = (z + worldY / 2) / worldY;
  
    // Clamp normalized values
    normalizedX = Math.max(0, Math.min(1, normalizedX));
    normalizedZ = Math.max(0, Math.min(1, normalizedZ));
  
    let factor = (normalizedX + normalizedZ) / 2;
    factor = Math.max(0, Math.min(1, factor)); // Clamp factor
  
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
  
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
  
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
  
    return varyColor((r << 16) + (g << 8) + b);
  }
  
  function gaussianRandom(mean, stddev) {
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    let normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stddev * normal;
}

  const DISABLE_TREES = false;
  // Add trees
  for (let i = 0; i < OBJECTS_TO_RENDER*0.7; i++) { // Increased number of objects
    if(DISABLE_TREES) i = OBJECTS_TO_RENDER*0.7;
    // Create tree geometry with random height
    const treeHeight = 1000 + Math.random() * 3000;
    const treeGeometry = new THREE.ConeGeometry(200, treeHeight, 200); // Reduced size
    const {x,z} = getBiasedCoordinate(worldX, worldY);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: deepBrownShades[Math.floor(Math.random() * deepBrownShades.length)] });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);

    // Prevent trees from being generated near the user's spawn position (within a radius of 1000 units)
    const distanceFromOrigin = Math.sqrt(x * x + z * z);
    if (distanceFromOrigin < 1000) {
      continue;
    }

    tree.position.set(x, treeHeight / 2, z);

    // Consolidate crown addition: crown radius proportional to tree height (e.g. treeHeight/10)
    const crownRadius = treeHeight / 5;
    const crownGeometry = new THREE.SphereGeometry(crownRadius, 32, 16);
    const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    // Position crown at the top of the tree
    crown.position.set(0, treeHeight / 2, 0);
    tree.add(crown);

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

  island.position.set(-20, -10, -20); // Adjusted position to match reduced height
  if(isOcean)
  scene.add(island);

  // Add a second island
  const island2 = new THREE.Mesh(islandGeometry, islandMaterial.clone());
  island2.position.set(-20, -10, -2020); // Moved further along z-axis
  if(isOcean)
  scene.add(island2);

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

  function getRandomForestColor() {
    return Math.floor(Math.random() * 0xffffff); // Random 24-bit color
  }
  
  function varyColor(baseColor: number) {
    // More aggressive variation for each RGB component
    const variation = 100; // Increased variation range
    const r = Math.min(255, Math.max(0, ((baseColor >> 16) & 0xff) + (Math.random() * (2 * variation) - variation)));
    const g = Math.min(255, Math.max(0, ((baseColor >> 8) & 0xff) + (Math.random() * (2 * variation) - variation)));
    const b = Math.min(255, Math.max(0, (baseColor & 0xff) + (Math.random() * (2 * variation) - variation)));
    return (r << 16) + (g << 8) + b;
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
    const clusterBaseColor = getRandomForestColor(); // Different base color for each cluster
    for (let i = 0; i < 200; i++) {
      const treeColor = varyColor(clusterBaseColor); // Vary the cluster color
      const tree = new THREE.Mesh(forestTreeGeometry, new THREE.MeshStandardMaterial({ color: treeColor }));
      tree.position.set(
        pos.x + (Math.random() * 2000 - 1000), // Cluster around the position
        10,
        pos.z + (Math.random() * 2000 - 1000)
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

  // Add very large trees (mountains)
const mountains = [];
const minSpacing = 10000; // Minimum distance between mountains


for (let i = 0; i < 8; i++) {
    const mountainHeight = 15000 + Math.random() * 3000;
    const mountainRadius = mountainHeight * 0.9;
    const mountainGeometry = new THREE.ConeGeometry(mountainRadius, mountainHeight, 16);
    const mountainMaterial = new THREE.MeshStandardMaterial({
        color: deepBrownShades[Math.floor(Math.random() * deepBrownShades.length)],
        roughness: 0.5 + Math.random() / 2
    });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);

    let mountainX, mountainZ, validPosition;
    let attempts = 0;
    
    do {
        mountainX = Math.random() * worldX - worldX / 2;
        mountainZ = Math.random() * worldY - worldY / 2;
        validPosition = mountains.every(m => {
            const dx = m.position.x - mountainX;
            const dz = m.position.z - mountainZ;
            return Math.sqrt(dx * dx + dz * dz) > minSpacing;
        });

        attempts++;
        if (attempts > 300) break; // Prevent infinite loops
    } while (!validPosition);

    mountain.position.set(mountainX, mountainHeight / 2, mountainZ);
    mountains.push(mountain);
    trees.push(mountain);
    treeSpeeds.push(0); // Mountain trees remain static
    scene.add(mountain);
}

  const NUM_FISH = OBJECTS_TO_RENDER/2;
  const fishColors = [0x008080, 0x20B2AA, 0x40E0D0, 0x5F9EA0, 0x66CDAA]; // Teal/shades array
  function addFishesSub(img=false){
  const fishGeometry = createFish();
  let fishMaterial: THREE.MeshStandardMaterial;
  if (img) {
    const textureLoader = new THREE.TextureLoader();
    const fishTexture = textureLoader.load('textures/fish'+img+'.jpg');
    fishMaterial = new THREE.MeshStandardMaterial({ map: fishTexture, side: THREE.DoubleSide });
  } else {
    const randomFishColor = fishColors[Math.floor(Math.random() * fishColors.length)];
    fishMaterial = new THREE.MeshStandardMaterial({ color: randomFishColor, side: THREE.DoubleSide });
  }
  for (let i = 0; i < NUM_FISH/7; i++) {
    const fish = new THREE.Mesh(fishGeometry, fishMaterial);
    fish.scale.set(Math.random() * 80, Math.random() * 80, Math.random() * 80);
    fish.position.set(
      Math.random() * worldX - worldX / 2,
      14,
      Math.random() * worldY - worldY / 2
    );
    fishes.push(fish);
    scene.add(fish);
  }
  }
  addFishesSub(1);
  addFishesSub(2);
  addFishesSub(3);
  addFishesSub(4);
  addFishesSub(5);
  addFishesSub(6);
  addFishesSub(7);
  window._scene = scene;
  return {balls, trees, treeSpeeds, ballSpeeds, fishes};
};

// Add function to rearrange balloons
export const rearrangeBalloons = (scene) => {
  balls.forEach((ball) => {
    const newX = Math.random() * worldX - worldX / 2;
    const newY = Math.random() * 200 + 10;
    const newZ = Math.random() * worldY - worldY / 2;
    ball.position.set(newX, newY, newZ);
  });
};

// Revised function to rearrange trees with debugging and fallback
export const rearrangeTrees = (scene, isMon=false) => {
  trees.forEach((tree, index) => {
    let height = tree.geometry.parameters?.height;
    if (!height) {
      console.warn(`Tree at index ${index} has no height parameter; using 1000 as fallback.`);
      height = 1000;
    }
    if (height > 10000 && isMon) { // Assume mountain
      const newX = Math.random() * worldX - worldX / 2;
      const newZ = Math.random() * worldY - worldY / 2;
      console.log(`Rearranging mountain tree at index ${index} to (${newX.toFixed(2)}, ${height/2}, ${newZ.toFixed(2)})`);
      tree.position.set(newX, height / 2, newZ);
    } else if(!isMon) {
      const { x, z } = getBiasedCoordinate(worldX, worldY);
      console.log(`Rearranging normal tree at index ${index} to (${x.toFixed(2)}, ${height/2}, ${z.toFixed(2)})`);
      tree.position.set(x, height / 2, z);
    }
  });
};

// Optionally, a combined function to rearrange both can be defined:
// export const rearrangeObjects = (scene) => {
//   rearrangeBalloons(scene);
//   rearrangeTrees(scene);
// };

// Update key listener to call both functions when 'u' key is pressed
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'u' && window._scene) {
    rearrangeBalloons(window._scene);
  }
  if (event.key.toLowerCase() === 'i' && window._scene) {
    rearrangeTrees(window._scene);
  }
  if (event.key.toLowerCase() === 'm' && window._scene) {
    rearrangeTrees(window._scene, true);
  }
});
