// @ts-nocheck
import * as THREE from 'three';

const { sin, cos, abs } = Math;
const PI = Math.PI;

let v0 = new THREE.Vector3();
let v1 = new THREE.Vector3();
let v2 = new THREE.Vector3();
let v3 = new THREE.Vector3();
let v4 = new THREE.Vector3();

const noisefn = (x: number, y: number, seconds: number, v = v0) => {
  let z = sin((x * 0.1) + seconds) * cos((y * 0.13) + seconds);
  let z1 = sin((y * 0.15) + seconds) * cos((x * 0.2) + seconds);
  z -= z1;
  return v.set(x, z * 3, y);
};

export function createPatch(scene: THREE.Scene) {
  const patchGeometry = new THREE.PlaneGeometry(50, 50, 99, 99);
  patchGeometry.rotateX(PI * -0.5);

  const material = new THREE.MeshStandardMaterial({ color: '#ffbe67', dithering: true });
  const mesh = new THREE.Mesh(patchGeometry, material);
  scene.add(mesh);
  return mesh;
}

export function generatePatch(mesh: THREE.Mesh, seconds: number, lod = 0) {
  const a = mesh.geometry.attributes.position.array;
  const na = mesh.geometry.attributes.normal.array;
  const sz = 100;
  const sz2 = sz / 2;
  v3.set(-sz2, 0, -sz2);
  v4.set(sz2, 0, sz2);

  let cutoff = 6 * lod;
  let outIndex: number[] = [];
  let gi = mesh.geometry.index.array;

  for (let i = 0, ai = 0, c = sz * sz; i < c; i++, ai += 3) {
    let ix = (i % sz);
    let iy = ((i / sz) | 0);
    let x = ix - sz2;
    let y = iy - sz2;

    let ax = abs(x);
    let ay = abs(y);

    if ((ax < cutoff) && (ay < cutoff)) {
      a[ai] = x;
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
    vn.y /= (1 + lod);
    vn.normalize();

    if (!i) {
      v3.y = v4.y = pp.y;
    } else {
      if (pp.y < v2.y) v3.y = pp.y;
      if (pp.y > v3.y) v4.y = pp.y;
    }

    a[ai] = x;
    a[ai + 1] = pp.y;
    a[ai + 2] = y;
    na[ai] = vn.x;
    na[ai + 1] = vn.y;
    na[ai + 2] = vn.z;
  }

  mesh.geometry.setIndex(outIndex);
  mesh.geometry.boundingBox = mesh.geometry.boundingBox || new THREE.Box3();
  mesh.geometry.boundingBox.set(v3, v4);
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.normal.needsUpdate = true;
}