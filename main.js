import * as THREE from 'three';

// PointerLockControlsはグローバルにロードされている
const { PointerLockControls } = window;

// シーン・カメラ・レンダラー
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222233);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 0); // FPS視点

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライト
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x8888aa, 0.5));

// 床
const floorGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
const floorMat = new THREE.MeshPhongMaterial({ color: 0x333366, wireframe: true });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// FPSコントロール
const controls = new PointerLockControls(camera, renderer.domElement);

// 弧月（こげつ）モデルを作成（簡易的な剣）
function createKogetsu() {
    const kogetsu = new THREE.Group();

    // 刃（シリンダー）
    const bladeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16);
    const bladeMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.5;
    kogetsu.add(blade);

    // 柄（グリップ）
    const gripGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12);
    const gripMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.y = -0.35;
    kogetsu.add(grip);

    // ガード（円盤）
    const guardGeo = new THREE.TorusGeometry(0.09, 0.02, 8, 16);
    const guardMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 0.0;
    guard.rotation.x = Math.PI / 2;
    kogetsu.add(guard);

    // 右手前に配置
    kogetsu.position.set(0.3, -0.3, -0.6);
    kogetsu.rotation.z = Math.PI / 8;
    kogetsu.rotation.x = Math.PI / 10;
    return kogetsu;
}

// 弧月をカメラの子にして常に手前に表示
const kogetsu = createKogetsu();
camera.add(kogetsu);
scene.add(camera);

// 移動制御
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { forward: false, backward: false, left: false, right: false };

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': move.forward = true; break;
        case 'KeyS': move.backward = true; break;
        case 'KeyA': move.left = true; break;
        case 'KeyD': move.right = true; break;
    }
}
function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': move.forward = false; break;
        case 'KeyS': move.backward = false; break;
        case 'KeyA': move.left = false; break;
        case 'KeyD': move.right = false; break;
    }
}
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// ポインタロック開始
const instructions = document.getElementById('instructions');
instructions.addEventListener('click', () => {
    controls.lock();
});
controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
});
controls.addEventListener('unlock', () => {
    instructions.style.display = '';
});

// レンダーループ
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    // 移動
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    if (move.forward || move.backward) velocity.z -= direction.z * 8.0 * delta;
    if (move.left || move.right) velocity.x -= direction.x * 8.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    renderer.render(scene, camera);
    prevTime = time;
}
animate();

// リサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
