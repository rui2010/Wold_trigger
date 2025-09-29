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
    // 地面の色を緑色に変更
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x66cc66 });
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
            const h = 10; // 高さを固定して見やすく
            const buildingGeometry = new THREE.BoxGeometry(4, h, 4);
            const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
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

    // --- 設定画面の開閉ボタン（左上に表示）---
    const openBtn = document.createElement('button');
    openBtn.textContent = '設定';
    openBtn.style.position = 'absolute';
    openBtn.style.top = '10px';
    openBtn.style.left = '10px';
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
    // speedは既に宣言済みので再宣言しない
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

    // --- ミニキャラクター表示用 ---
    // ミニキャラ用canvasを右上に配置
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 120;
    miniCanvas.height = 120;
    miniCanvas.style.position = 'absolute';
    miniCanvas.style.top = '10px';
    miniCanvas.style.right = '10px';
    miniCanvas.style.zIndex = 300;
    miniCanvas.style.background = 'rgba(255,255,255,0.7)';
    miniCanvas.style.borderRadius = '8px';
    miniCanvas.style.display = 'none';
    document.body.appendChild(miniCanvas);

    // ミニキャラ用Three.jsシーン
    const miniRenderer = new THREE.WebGLRenderer({ canvas: miniCanvas, alpha: true, antialias: true });
    miniRenderer.setClearColor(0x000000, 0);
    miniRenderer.setSize(120, 120);
    const miniScene = new THREE.Scene();
    const miniCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    miniCamera.position.set(0, 5, 10);
    miniCamera.lookAt(0, 2, 0);

    // ミニキャラ本体（赤い箱）
    const miniCharGeometry = new THREE.BoxGeometry(2, 4, 2);
    const miniCharMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const miniChar = new THREE.Mesh(miniCharGeometry, miniCharMaterial);
    miniChar.position.y = 2;
    miniScene.add(miniChar);

    // ミニキャラ用ライト
    const miniLight = new THREE.DirectionalLight(0xffffff, 1);
    miniLight.position.set(5, 10, 5);
    miniScene.add(miniLight);

    // --- スコーピオン（Scorpion）モデル生成 ---
    function createScorpionModel() {
        // 刃部分（細長い湾曲した緑色の箱）
        const group = new THREE.Group();
        // 刃本体
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.04, 1.0),
            new THREE.MeshPhongMaterial({ color: 0x33ff33, emissive: 0x33ff33, emissiveIntensity: 0.7 })
        );
        blade.position.z = 0.5;
        blade.position.y = 0.08;
        blade.rotation.x = Math.PI / 10;
        group.add(blade);
        // 柄
        const grip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12),
            new THREE.MeshPhongMaterial({ color: 0x222222 })
        );
        grip.position.z = -0.4;
        grip.position.y = -0.08;
        group.add(grip);
        // 鍔
        const tsuba = new THREE.Mesh(
            new THREE.TorusGeometry(0.07, 0.012, 8, 24),
            new THREE.MeshPhongMaterial({ color: 0x888888 })
        );
        tsuba.position.z = -0.3;
        tsuba.position.y = 0.01;
        group.add(tsuba);
        return group;
    }

    // --- スコーピオン表示例 ---
    // 画面中央にスコーピオンを表示（テスト用）
    const scorpion = createScorpionModel();
    scorpion.position.set(0, 2.2, 0);
    scene.add(scorpion);

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);

        // 視点制御: 上下左右360度回転・移動
        if (viewMode === 'fps') {
            camera.position.copy(playerPos);
            camera.rotation.order = "YXZ";
            camera.rotation.y = yaw;
            camera.rotation.x = pitch;
            camera.rotation.z = 0;
        } else if (viewMode === 'tps') {
            const tpsDistance = 18;
            const tpsPitch = pitch;
            const tpsYaw = yaw;
            const offset = new THREE.Vector3(
                Math.sin(tpsYaw) * Math.cos(tpsPitch) * tpsDistance,
                Math.sin(tpsPitch) * tpsDistance + 4,
                Math.cos(tpsYaw) * Math.cos(tpsPitch) * tpsDistance
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
            let moveVector;
            if (viewMode === 'fps') {
                // 前進・後退はpitchも考慮して上下にも進める
                const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
                const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, yaw, 0, "YXZ"));
                moveVector = forward.multiplyScalar(direction.z).add(right.multiplyScalar(direction.x)).normalize();
            } else {
                moveVector = new THREE.Vector3(direction.x, 0, direction.z);
                moveVector.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
            }
            playerPos.add(moveVector.multiplyScalar(speed));
            miniCanvas.style.display = '';
        } else {
            miniCanvas.style.display = 'none';
        }

        renderer.render(scene, camera);

        // ミニキャラの向きとアニメーション（カメラのyawに合わせて回転）
        miniChar.rotation.y = -yaw;
        miniRenderer.render(miniScene, miniCamera);
    }
    animate();
}