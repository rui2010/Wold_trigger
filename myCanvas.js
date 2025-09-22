window.addEventListener("DOMContentLoaded", init);
function init() {
    // レンダラーを作成
    const canvasElement = document.querySelector('#myCanvas'); //canvas要素のクラスを指定
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasElement,
    });
 
    // サイズ指定
    const width = 745;
    const height = 540;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成（FPS視点）
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5); // 少し上からスタート

    // 簡単な地面を追加
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 簡単なライト
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    // 簡単な建物を複数追加
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x3366cc });
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (i === 0 && j === 0) continue; // 中央は空ける
            const buildingGeometry = new THREE.BoxGeometry(2, 4 + Math.random() * 6, 2);
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.set(i * 8, building.geometry.parameters.height / 2, j * 8);
            scene.add(building);
        }
    }

    // FPS移動用の変数
    const move = { forward: false, backward: false, left: false, right: false };
    const speed = 0.1;

    // キーボードイベント
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') move.forward = true;
        if (e.code === 'KeyS') move.backward = true;
        if (e.code === 'KeyA') move.left = true;
        if (e.code === 'KeyD') move.right = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') move.forward = false;
        if (e.code === 'KeyS') move.backward = false;
        if (e.code === 'KeyA') move.left = false;
        if (e.code === 'KeyD') move.right = false;
    });

    // カメラの向き制御用
    let yaw = 0; // 左右
    let pitch = 0; // 上下（今回は固定）

    // PointerLockでマウスキャプチャ
    canvasElement.addEventListener('click', () => {
        canvasElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvasElement) {
            document.addEventListener('mousemove', onMouseMove, false);
        } else {
            document.removeEventListener('mousemove', onMouseMove, false);
        }
    });

    function onMouseMove(e) {
        const sensitivity = 0.002;
        yaw -= e.movementX * sensitivity;
        // pitch -= e.movementY * sensitivity; // 上下回転したい場合
        // pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);

        // カメラの向きを反映
        camera.rotation.set(0, yaw, 0); // pitchも使う場合: camera.rotation.set(pitch, yaw, 0);

        // カメラ移動
        let direction = new THREE.Vector3();
        if (move.forward) direction.z -= 1;
        if (move.backward) direction.z += 1;
        if (move.left) direction.x -= 1;
        if (move.right) direction.x += 1;
        direction.normalize();
        if (direction.length() > 0) {
            const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
            moveVector.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
            camera.position.add(moveVector.multiplyScalar(speed));
        }

        renderer.render(scene, camera);
    }
    animate();
}