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
    private objectLoader!: ObjectLoader;
    private sceneLoader!: SceneLoader;
    private controlsLoader!: CameraControlsLoader;
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
        this.controlsLoader = new CameraControlsLoader(this.settings?.camera);
    }
    private CheckLoader() {
        this.loadersState++;
        if(this.loadersState === 2)
            this.FinalLoad();
    }
    private FinalLoad() {
        this.sceneLoader.scene.add(this.objectLoader.object, this.objectLoader.boundingBox);
        this.controlsLoader.Init({
            camera: this.sceneLoader.camera,
            canvas: this.sceneLoader.canvas,
            scene: this.sceneLoader.scene,
            object: this.objectLoader.object,
            settings: this.settings?.camera
        }, () => { if(this.onLoad) this.onLoad(); });
    }

    public ResetRotation() {
        this.controlsLoader.ResetRotation();
    }
    public ResetPosition() {
        this.controlsLoader.ResetPosition();
    }
    public ResetZoom() {
        this.controlsLoader.ResetZoom();
    }

    /// Get Set

    /// WIREFRAME
    get wireframe() {
        return this.objectLoader.wireframe;
    }
    set wireframe(value: boolean) {
        this.objectLoader.wireframe = value;
    }

    /// BOUNDBOX
    get boundBox() {
        return this.objectLoader.boundBox;
    }
    set boundBox(value: boolean) {
        this.objectLoader.boundBox = value;
    }

    /// FLATSHADE
    get flatShade() {
        return this.objectLoader.flatShade;
    }
    set flatShade(value: boolean) {
        this.objectLoader.flatShade = value;
    }

    /// AMBIENT INTENSITY
    get ambientIntensity(): number {
        return this.sceneLoader.ambientIntensity;
    }
    set ambientIntensity(value: number) {
        this.sceneLoader.ambientIntensity = value;
    }
    /// AMBIENT COLOR
    get ambientColor(): THREE.ColorRepresentation {
        return this.sceneLoader.ambientColor;
    }
    set ambientColor(value: THREE.ColorRepresentation) {
        this.sceneLoader.ambientColor = value;
    }

    /// ENABLER
    get enable(): boolean {
        return this.sceneLoader.enable;
    }
    set enable(value: boolean) {
        this.sceneLoader.enable = value;
    }

    /// CURRENT ZOOM
    get currentZoom(): number {
        return this.controlsLoader.currentZoom;
    }
    set currentZoom(value: number | string) {
        this.controlsLoader.currentZoom = value;
    }

    /// CURRENT ROTATION
    get currentRotation(): rotation {
        let sus: rotation = {
            vertical: this.controlsLoader.currentRotation.vertical*180,
            horizontal: this.controlsLoader.currentRotation.horizontal*180
        }
        return sus;
    }
    set currentRotation(value: rotation) {
        this.controlsLoader.currentRotation = value;
    }

    /// FOCUS DISPLAY
    get focusDisplay(): boolean {
        return this.controlsLoader.focusDisplay;
    }
    set focusDisplay(value: boolean) {
        this.controlsLoader.focusDisplay = value;
    }
}

export { Viewer };