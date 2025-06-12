        const canvas = document.getElementById('renderCanvas');

        const engine = new BABYLON.Engine(canvas);

        const createScene = function () {
            const scene = new BABYLON.Scene(engine);
            // scene.createDefaultCameraOrLight(true, false, true);
            scene.createDefaultLight(true);
            // const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, 0), scene);
            const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // const box = BABYLON.MeshBuilder.CreateBox();
            BABYLON.SceneLoader.ImportMeshAsync("", "", "src/jammo_v1.glb", scene);
            BABYLON.MeshLoader.CreateBox
            return scene;
        }

        const scene = createScene();

        engine.runRenderLoop(function () {
            scene.render();
        });

        window.addEventListener('resize', function () {
            engine.resize();
        });