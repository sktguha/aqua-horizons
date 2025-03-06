// @ts-nocheck
import * as THREE from 'three';

const USE_ROUNDED_DUNES = true;
const BASE_HEIGHT = 20; // Increase base height for rounded dunes
const LARGE_HEIGHT = 500; // New variable for high rounded dunes

let v0 = new THREE.Vector3();
let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();

// Modify noisefn to lower dune height and round the peaks more
let noisefn = (x, y, seconds, v = v0) => {
  // Reduce frequency for wider dunes
  let z = Math.sin((x * 0.02) + seconds) * Math.cos((y * 0.026) + seconds);
  let z1 = Math.sin((y * 0.03) + seconds) * Math.cos((x * 0.04) + seconds);
  z -= z1;
  
  if (USE_ROUNDED_DUNES) {
    // Lower and rounded dunes with a high ground level.
    z = Math.sign(z) * Math.pow(Math.abs(z), 0.7);
    return v.set(x, z * 10 + LARGE_HEIGHT, y);
  } else {
    // Original sharper dunes.
    z = Math.sign(z) * Math.pow(Math.abs(z), 0.8);
    return v.set(x, z * 30, y);
  }
};

// Function to create a terrain patch
export const createPatch = (scene, material) => {
  // Increase the size of the patch to accommodate larger dunes
  let patchGeometry = new THREE.PlaneGeometry(200, 200, 99, 99);
  patchGeometry.rotateX(Math.PI * -0.5);
  let mesh = new THREE.Mesh(patchGeometry.clone(), material);
  scene.add(mesh);
  return mesh;
};

// Function to generate dynamic terrain
export const generatePatch = (mesh, seconds, lod = 0) => {
  let a = mesh.geometry.attributes.position.array;
  let na = mesh.geometry.attributes.normal.array;

  let sz = 100;
  let sz2 = sz / 2;
  v3.set(-sz2, 0, -sz2);
  v4.set(sz2, 0, sz2);
  let bb = mesh.geometry.boundingBox || (mesh.geometry.boundingBox = new THREE.Box3());

  let cutoff = 6 * lod;
  let outIndex = [];
  let gi = mesh.geometry.index.array;

  for (let i = 0, ai = 0, c = (sz * sz); i < c; i++, ai += 3) {
    let ix = (i % sz);
    let iy = ((i / sz) | 0);
    let x = ix - sz2;
    let y = iy - sz2;

    let ax = Math.abs(x);
    let ay = Math.abs(y);

    if ((ax < cutoff) && (ay < cutoff)) {
      a[ai + 0] = x;
      a[ai + 1] = 0;
      a[ai + 2] = y;
      continue;
    }

    if ((ax < sz2) && (ay < sz2)) {
      let ei = ((iy * 99) + ix) * 6;
      outIndex.push(gi[ei], gi[ei + 1], gi[ei + 2], gi[ei + 3], gi[ei + 4], gi[ei + 5]);
    }

    let nx = (x * mesh.scale.x) + mesh.position.x;
    let ny = (y * mesh.scale.z) + mesh.position.z;
    let pp = noisefn(nx, ny, seconds);

    let vx = noisefn(nx + (0.0001 * mesh.scale.x), ny, seconds, v1).sub(pp);
    let vy = noisefn(nx, ny + (0.0001 * mesh.scale.z), seconds, v2).sub(pp);
    let vn = vy.cross(vx);

    vn.y /= 0.2 + lod; // Reduced divisor from 0.5 to 0.2 to make slopes much steeper
    vn.normalize();

    if (!i) {
      v3.y = v4.y = pp.y;
    } else {
      if (pp.y < v3.y) v3.y = pp.y;
      if (pp.y > v4.y) v4.y = pp.y;
    }

    a[ai] = x;
    a[ai + 1] = pp.y;
    a[ai + 2] = y;
    na[ai] = vn.x;
    na[ai + 1] = vn.y;
    na[ai + 2] = vn.z;
  }

  mesh.geometry.setIndex(outIndex);
  mesh.geometry.boundingBox.set(v3, v4);
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.normal.needsUpdate = true;
};