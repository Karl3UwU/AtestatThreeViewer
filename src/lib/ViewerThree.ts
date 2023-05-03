import { CenterObject, ObjectLoader } from "./modules/GLTFObjectLoader";
import { SceneLoader } from "./modules/SceneLoader";
import { CameraControlsLoader } from "./modules/CameraControlsLoader";
import { Settings, rotation } from "./modules/Settings";

interface ViewerParameters {
    div: HTMLDivElement,
    objectPath: string | ArrayBuffer,
    settings?: Settings,
    onLoad?: Function
}

class Viewer {
    public objectLoader!: ObjectLoader;
    public sceneLoader!: SceneLoader;
    public cameraLoader!: CameraControlsLoader;
    private onLoad!: Function;

    private loadersState: number = 0;
    private settings?: Settings;
    constructor(viewerParameters: ViewerParameters) {
        if(viewerParameters.settings)
            this.settings = viewerParameters.settings;
        if(viewerParameters.onLoad)
            this.onLoad = viewerParameters.onLoad
        this.objectLoader = new ObjectLoader({
            objectPath: viewerParameters.objectPath,
            settings: viewerParameters.settings?.object
        }, () => {
            CenterObject(this.objectLoader.object);
            this.CheckLoader();
        });
        this.sceneLoader = new SceneLoader({
            div: viewerParameters.div,
            settings: viewerParameters.settings?.scene
        }, () => {
            this.CheckLoader();
        });
        this.cameraLoader = new CameraControlsLoader(this.settings?.camera);
    }
    private CheckLoader() {
        this.loadersState++;
        if(this.loadersState === 2)
            this.FinalLoad();
    }
    private FinalLoad() {
        this.sceneLoader.scene.add(this.objectLoader.object, this.objectLoader.boundingBox);
        this.cameraLoader.Init({
            camera: this.sceneLoader.camera,
            canvas: this.sceneLoader.canvas,
            scene: this.sceneLoader.scene,
            object: this.objectLoader.object,
            settings: this.settings?.camera
        }, () => { if(this.onLoad) this.onLoad(); });
    }

    public ResetRotation() {
        this.cameraLoader.ResetRotation();
    }
    public ResetPosition() {
        this.cameraLoader.ResetPosition();
    }
    public ResetZoom() {
        this.cameraLoader.ResetZoom();
    }
}

export { Viewer };