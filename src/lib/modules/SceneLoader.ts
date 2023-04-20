import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { SceneSettings } from "./Settings";
interface SceneParameters {
    div: HTMLDivElement,
    settings?: SceneSettings
}

const cssStyle = ".three-canvas { outline: none; }";
function CheckForStyle(): boolean {
    const domStyles = document.head.getElementsByTagName("style");
    for(var i=0; i<domStyles.length; i++) {
        if(domStyles[i].innerHTML === cssStyle)
            return true;
    }
    return false;
}

class SceneLoader {
    public sizes = {width: 0, heigth: 0};
    public div: HTMLDivElement;
    public canvas!: HTMLCanvasElement;
    public canvasCSS?: HTMLStyleElement;
    private onLoad?: Function;

    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public renderer!: THREE.WebGLRenderer;
    public envMap!: THREE.DataTexture;
    public ambientLight!: THREE.AmbientLight;
    private cubeTextureLoader!: RGBELoader;
    private settings: SceneSettings = {};

    constructor(sceneParams: SceneParameters, onLoadFunction?: Function) {
        this.div = sceneParams.div;
        this.CopySettings(sceneParams.settings);
        if(onLoadFunction)
            this.onLoad = onLoadFunction;
        window.addEventListener("load", () => { this.LoadSceneAndDOM(); });
    }
    private CopySettings(sceneSettings?: SceneSettings): void {
        this.settings.ambientIntensity = sceneSettings?.ambientIntensity !== undefined ? sceneSettings.ambientIntensity : 0;
        this.settings.ambientColor = sceneSettings?.ambientColor !== undefined ? sceneSettings.ambientColor : 0xffffff;
        this.settings.enable = sceneSettings?.enable !== undefined ? sceneSettings.enable : true;
        if(!this.settings.enable)
            this.canvas.style.display = "none";
    }
    public Resize(): void {
        try {
            this.sizes.width = this.div.clientWidth;
            this.sizes.heigth = this.div.clientHeight;

            this.renderer.setSize(this.sizes.width, this.sizes.heigth);
            this.camera.aspect = this.sizes.width / this.sizes.heigth;
            this.camera.updateProjectionMatrix();
        }
        catch {
            window.requestAnimationFrame(() => this.Resize());
        }
    }
    private LoadSceneAndDOM(): void {
        /// DOM
        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("three-canvas");
        if(!CheckForStyle()) {
            this.canvasCSS = document.createElement("style");
            this.canvasCSS.innerHTML = cssStyle;
            document.head.appendChild(this.canvasCSS);
        }
        this.div.appendChild(this.canvas);
        this.div.addEventListener("contextmenu", (event) => {event.preventDefault()});

        /// THREE
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.ambientLight = new THREE.AmbientLight(this.settings.ambientColor, this.settings.ambientIntensity);
        this.scene.add(this.ambientLight);
        
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true, alpha: true});
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.setPixelRatio((window.devicePixelRatio > 2) ? 2 : window.devicePixelRatio);

        this.cubeTextureLoader = new RGBELoader();
        this.cubeTextureLoader.load("/HDRI/venice_sunset_1k.hdr", (texture) => {
            this.envMap = texture;
            this.envMap.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = this.envMap;
            if(this.onLoad)
                this.onLoad();
            this.ResizeCheckTick();
        })
    }
    private ResizeCheckTick(): void {
        if(this.sizes.width !== this.div.clientWidth || this.sizes.heigth !== this.div.clientHeight)
            this.Resize();
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.ResizeCheckTick());
    }

    /// GET SET

    /// AMBIENT INTENSITY
    get ambientIntensity(): number {
        return this.settings.ambientIntensity!;
    }
    set ambientIntensity(value: number) {
        this.SetAmbientIntensity(value);
    }
    private SetAmbientIntensity(value: number) {
        this.settings.ambientIntensity = value
        try {
            this.ambientLight.intensity = value;
        }
        catch { window.requestAnimationFrame(() => this.SetAmbientIntensity(value)) }
    }

    /// AMBIENT COLOR
    get ambientColor(): THREE.ColorRepresentation {
        return this.settings.ambientColor!;
    }
    set ambientColor(value: THREE.ColorRepresentation) {
        this.SetAmbientColor(value);
    }
    private SetAmbientColor(value: THREE.ColorRepresentation) {
        try {
            this.ambientLight.color.set(value);
        }
        catch { window.requestAnimationFrame(() => this.SetAmbientColor(value)) }
    }

    /// Enable
    get enable(): boolean {
        return this.settings.enable!;
    }
    set enable(value: boolean) {
        this.SetEnable(value);
    }
    private SetEnable(value: boolean) {
        try {
            this.settings.enable = value;
            if(value)
                this.canvas.style.display = "";
            else
                this.canvas.style.display = "none";
        }
        catch { window.requestAnimationFrame(() => this.SetEnable(value)) }
    }
}

export { SceneLoader };