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
    // プレイヤーの仮想位置
    const playerPos = new THREE.Vector3(0, 2, 5);
    camera.position.copy(playerPos);
    let yaw = 0;
    let pitch = -0.18; // 少し下向き

    // 簡単な地面を追加
    // 地面の色を明るく
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 簡単なライト
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    // 簡単な建物を複数追加
    // 建物を赤色で広めに配置
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (i === 0 && j === 0) continue;
            const h = 6 + Math.random() * 10;
            const buildingGeometry = new THREE.BoxGeometry(4, h, 4);
            const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // 赤色
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.set(i * 14, h / 2, j * 14);
            scene.add(building);
        }
    }

    // FPS移動用の変数
    const move = { forward: false, backward: false, left: false, right: false };
    let speed = 0.1;

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

    // --- 設定画面UI追加 ---
    const settingsDiv = document.createElement('div');
    settingsDiv.style.position = 'absolute';
    settingsDiv.style.top = '10px';
    settingsDiv.style.right = '10px';
    settingsDiv.style.background = 'rgba(255,255,255,0.95)';
    settingsDiv.style.padding = '16px';
    settingsDiv.style.borderRadius = '8px';
    settingsDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    settingsDiv.style.zIndex = 200;
    settingsDiv.style.fontSize = '14px';
    settingsDiv.style.minWidth = '180px';

    // 設定画面の内容
    settingsDiv.innerHTML = `
        <b>設定</b><br>
        <label>
            <span>視点</span>
            <select id="viewModeSelect">
                <option value="fps">一人称視点（FPS）</option>
                <option value="tps">三人称視点（TPS）</option>
            </select>
        </label>
        <br><br>
        <label>
            <span>移動速度</span>
            <input id="speedRange" type="range" min="0.05" max="0.5" step="0.01" value="0.1">
            <span id="speedValue">0.10</span>
        </label>
        <br><br>
        <button id="closeSettings">閉じる</button>
    `;

    // 設定画面の開閉ボタン
    const openBtn = document.createElement('button');
    openBtn.textContent = '設定';
    openBtn.style.position = 'absolute';
    openBtn.style.top = '10px';
    openBtn.style.right = '10px';
    openBtn.style.zIndex = 201;
    openBtn.style.padding = '8px 16px';
    openBtn.style.fontSize = '14px';
    openBtn.style.borderRadius = '8px';
    openBtn.style.border = 'none';
    openBtn.style.background = '#eee';
    openBtn.style.cursor = 'pointer';

    document.body.appendChild(openBtn);
    document.body.appendChild(settingsDiv);
    settingsDiv.style.display = 'none';

    openBtn.addEventListener('click', () => {
        settingsDiv.style.display = '';
        openBtn.style.display = 'none';
    });
    settingsDiv.querySelector('#closeSettings').addEventListener('click', () => {
        settingsDiv.style.display = 'none';
        openBtn.style.display = '';
    });

    // --- 視点切り替えUIを設定画面のセレクトボックスに変更 ---
    let viewMode = 'fps';
    const viewModeSelect = settingsDiv.querySelector('#viewModeSelect');
    viewModeSelect.value = viewMode;
    viewModeSelect.addEventListener('change', () => {
        viewMode = viewModeSelect.value;
        if (viewMode === 'fps') {
            camera.position.set(playerPos.x, playerPos.y, playerPos.z);
        }
    });

    // --- 移動速度設定 ---
    // speedは既に宣言済みなので再宣言しない
    const speedRange = settingsDiv.querySelector('#speedRange');
    const speedValue = settingsDiv.querySelector('#speedValue');
    speedRange.addEventListener('input', () => {
        speed = parseFloat(speedRange.value);
        speedValue.textContent = speed.toFixed(2);
    });

    // --- 旧セレクトボックス削除 ---
    if (typeof select !== 'undefined') {
        select.remove();
    }

    // PointerLockでマウスキャプチャ
    canvasElement.addEventListener('click', () => {
        if (viewMode === 'fps') {
            canvasElement.requestPointerLock();
        }
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
        pitch -= e.movementY * sensitivity;
        // ピッチの範囲を制限（真上・真下を向きすぎないように）
        pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
    }

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);

        // 視点ごとにカメラ位置・向きを制御
        if (viewMode === 'fps') {
            // カメラをプレイヤー位置に
            camera.position.copy(playerPos);
            camera.rotation.set(pitch, yaw, 0);
        } else if (viewMode === 'tps') {
            // TPS: プレイヤーの後方上空からプレイヤーを見る
            const tpsDistance = 18;
            const tpsHeight = 8;
            // TPS時はpitch/yawでカメラの向きを制御し、プレイヤーの周囲を回る
            const offset = new THREE.Vector3(
                Math.sin(yaw) * Math.cos(pitch) * tpsDistance,
                tpsHeight + Math.sin(pitch) * tpsDistance,
                Math.cos(yaw) * Math.cos(pitch) * tpsDistance
            );
            camera.position.copy(playerPos.clone().add(offset));
            camera.lookAt(playerPos);
        }

        // 移動処理（プレイヤー位置を動かす）
        let direction = new THREE.Vector3();
        if (move.forward) direction.z -= 1;
        if (move.backward) direction.z += 1;
        if (move.left) direction.x -= 1;
        if (move.right) direction.x += 1;
        direction.normalize();
        if (direction.length() > 0) {
            // 移動方向はyawのみ考慮（TPSでも同じ）
            const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
            moveVector.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
            playerPos.add(moveVector.multiplyScalar(speed));
        }

        renderer.render(scene, camera);
    }
    animate();
}