import * as THREE from "three";
import { CameraSettings, rotation } from "./Settings";

interface CameraParams {
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
    scene: THREE.Scene,
    object: THREE.Group,
    settings?: CameraSettings
}

interface CameraSettingsExtra  {
    maxZoom: {
        in: number,
        out: number
    },
    maxRotation: {
        vertical: [number, number],
        horizontal: [number, number],
    },
    currentZoom: number,
    currentRotation: rotation,
    canRotate: boolean,
    canZoom: boolean,
    canPan: boolean
    recommCameraDist: number,
    averageObjectLength: number,
    maxObjectLength: number,
    minObjectLength: number,
    enablePanFalloff: boolean,
    enableZoomFalloff: boolean,
    focusDisplay: boolean
}

type Rotation = {
    vertical: number,
    horizontal: number
}

type MousePos = {
    x: number,
    y: number
}

class CameraControlsLoader {
    // private isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    private pivot!: THREE.Group;
    private cameraSettings: CameraSettingsExtra = {
        maxZoom: {
            in: 0,
            out: 0,
        },
        maxRotation: {
            vertical: [-Infinity, Infinity],
            horizontal: [-Infinity, Infinity]
        },
        currentZoom: 0,
        currentRotation: {
            vertical: 0,
            horizontal: 0,
        },
        recommCameraDist: 0,
        averageObjectLength: 0,
        maxObjectLength: 0,
        minObjectLength: 0,
        enablePanFalloff: false,
        enableZoomFalloff: true,
        canRotate: true,
        canZoom: true,
        canPan: true,
        focusDisplay: true
    }
    private onLoad?: Function;

    /// From Parameters
    public camera!: THREE.PerspectiveCamera;
    public canvas!: HTMLCanvasElement;
    public scene!: THREE.Scene;
    public object!: THREE.Group;
    private settings: CameraSettings = {};

    constructor(cameraSettings?: CameraSettings) {
        if(cameraSettings)
            this.settings = cameraSettings;
        this.CopySettings();
    }
    private CopySettings() {
        /// Max rot and zoom
        if(this.settings.maxRotation !== undefined) {
            if(this.settings.maxRotation.vertical !== undefined)
                this.cameraSettings.maxRotation.vertical = this.settings.maxRotation.vertical;
            if(this.settings.maxRotation.horizontal !== undefined)
                this.cameraSettings.maxRotation.horizontal = this.settings.maxRotation.horizontal;
        }
        if(this.settings.currentRotation !== undefined) {
            if(this.settings.currentRotation.vertical !== undefined)
                this.cameraSettings.currentRotation.vertical = this.settings.currentRotation.vertical;
            if(this.settings.currentRotation.horizontal !== undefined)
                this.cameraSettings.currentRotation.horizontal = this.settings.currentRotation.horizontal;
        }
        /// Max zoom is set in the CameraCalculateDistance function
        if(this.settings.currentZoom !== undefined && typeof this.settings.currentZoom === "number")
            this.cameraSettings.currentZoom = this.settings.currentZoom;
        /// Falloffs
        if(this.settings.enableZoomFalloff !== undefined)
            this.cameraSettings.enableZoomFalloff = this.settings.enableZoomFalloff;
        if(this.settings.enablePanFalloff !== undefined)
        /// Enablers
            this.cameraSettings.enablePanFalloff = this.settings.enablePanFalloff;  
        if(this.settings.canRotate !== undefined)
            this.cameraSettings.canRotate = this.settings.canRotate;
        if(this.settings.canZoom !== undefined)
            this.cameraSettings.canZoom = this.settings.canZoom;
        if(this.settings.canPan !== undefined)
            this.cameraSettings.canPan = this.settings.canPan;
        if(this.settings.focusDisplay !== undefined)
            this.cameraSettings.focusDisplay = this.settings.focusDisplay;
    }
    Init(cameraParams: CameraParams, onLoadFunction?: Function) {
        if(onLoadFunction)
            this.onLoad = onLoadFunction;
        this.camera = cameraParams.camera;
        this.canvas = cameraParams.canvas;
        this.scene = cameraParams.scene;
        this.object = cameraParams.object;
        this.ControlsInit();
    }
    private Average(numbers: number[]): number {
        var sum = 0;
        for(var i=0; i<numbers.length; i++) sum += numbers[i];
        return sum/numbers.length;
    }
    private CameraCalculateDistance() {
        const objectBox = new THREE.Box3().setFromObject(this.object);
        const size = {
            x: Math.abs(objectBox.max.x - objectBox.min.x),
            y: Math.abs(objectBox.max.y - objectBox.min.y),
            z: Math.abs(objectBox.max.z - objectBox.min.z),
        }
        /// Calculate the max and min length of the object
        this.cameraSettings.maxObjectLength = Math.max(size.x, size.y, size.z);
        this.cameraSettings.minObjectLength = Math.min(size.x, size.y, size.z);
        /// Calculate average object length
        this.cameraSettings.averageObjectLength = this.Average([size.x, size.y, size.z]);
        /// Calculate the recommended camera distance
        const x = Math.sqrt(Math.pow(Math.sqrt(size.x*size.x + size.y*size.y), 2) + size.z*size.z)/2;
        const delta = Math.tan((25/180)*Math.PI);
        this.cameraSettings.recommCameraDist = (x / delta)*1.125;
        /// Set the camera near and far based of the max and min object length
        this.camera.near = this.cameraSettings.minObjectLength/100;
        this.camera.far = this.cameraSettings.maxObjectLength*100;
        /// If not already set in the settings, calculate max zoom and current zoom
        if(this.settings.maxZoom?.in !== undefined && typeof this.settings.maxZoom.in === "string")
            this.cameraSettings.maxZoom.in = this.cameraSettings.recommCameraDist*this.CheckZoomString(this.settings.maxZoom.in)/100;
        if(this.settings.maxZoom?.out !== undefined && typeof this.settings.maxZoom.out === "string")
            this.cameraSettings.maxZoom.out = this.cameraSettings.recommCameraDist*this.CheckZoomString(this.settings.maxZoom.out)/100;
        else
            this.cameraSettings.maxZoom.out = this.cameraSettings.recommCameraDist*3;
        /// ----------
        if(this.settings.currentZoom === undefined)
            this.cameraSettings.currentZoom = this.cameraSettings.recommCameraDist;
        if(this.settings.currentZoom && typeof this.settings.currentZoom === "string")
            this.cameraSettings.currentZoom = this.cameraSettings.recommCameraDist*this.CheckZoomString(this.settings.currentZoom)/100;
        
        if(this.onLoad)
            this.onLoad();
    }
    private IsNumber(str: string): boolean {
        for(var i=0; i<str.length; i++)
            if(str[i] < "0" || str[i] > "9") return false;
        return true;
    }
    private CheckZoomString(value: string | number | undefined): number {
        if(typeof value === "number") return value;
        else if(value === undefined) return 0;
        if(value[value.length-1] !== "%") return 100;
        if(this.IsNumber(value.slice(0, value.length-1)))
            return parseInt(value.slice(0, value.length-1));
        else return 100;
    }
    private ControlsInit() {
        this.pivot = new THREE.Group();
        this.scene.add(this.pivot);
        this.pivot.rotation.order = "ZYX";
        this.pivot.add(this.camera);
        this.CameraCalculateDistance();
        this.LoadTouchControls();
        this.LoadMouseControls();
        this.Tick();
    }
    private ClampRotation() {
        if(this.cameraSettings.currentRotation.vertical < this.cameraSettings.maxRotation.vertical[0]) this.cameraSettings.currentRotation.vertical = this.cameraSettings.maxRotation.vertical[0];
        if(this.cameraSettings.currentRotation.vertical > this.cameraSettings.maxRotation.vertical[1]) this.cameraSettings.currentRotation.vertical = this.cameraSettings.maxRotation.vertical[1];
        if(this.cameraSettings.currentRotation.horizontal < this.cameraSettings.maxRotation.horizontal[0]) this.cameraSettings.currentRotation.horizontal = this.cameraSettings.maxRotation.horizontal[0];
        if(this.cameraSettings.currentRotation.horizontal > this.cameraSettings.maxRotation.horizontal[1]) this.cameraSettings.currentRotation.horizontal = this.cameraSettings.maxRotation.horizontal[1];
    }
    private ClampZoom() {
        if(this.cameraSettings.currentZoom < this.cameraSettings.maxZoom.in) this.cameraSettings.currentZoom = this.cameraSettings.maxZoom.in;
        if(this.cameraSettings.currentZoom > this.cameraSettings.maxZoom.out) this.cameraSettings.currentZoom = this.cameraSettings.maxZoom.out;
    }
    private CalculatePanFalloff(): number {
        if(!this.cameraSettings.enablePanFalloff) return 1;
        const pos = new THREE.Vector3();
        this.pivot.getWorldPosition(pos);
        const dist = pos.length();
        if(dist <= this.cameraSettings.maxObjectLength) return 1;
        else return (this.cameraSettings.maxObjectLength*2-dist)/this.cameraSettings.maxObjectLength;
    }
    private LoadMouseControls() {
        var oldRot: Rotation = {horizontal: 0, vertical: 0}, deltaRot: Rotation = {horizontal: 0, vertical: 0};
        var oldMouse: MousePos = {x: 0, y: 0}, deltaMouse: MousePos = {x: 0, y: 0};
        var isDown: boolean = false, isInside: boolean = false, normalizeSize: number;
        var horizontalCorrection: 1 | -1 = 1, bodyOverscrollSave: string = document.body.style.overflow;
        this.canvas.addEventListener("mouseenter", () => {
            isInside = true;
            if(this.cameraSettings.focusDisplay) document.body.style.overflow = "hidden";
        })
        this.canvas.addEventListener("mousedown", (event) => {
            event.preventDefault();
            /// Event: 0 - left click | 1 - middle click | 2 - right click
            isDown = true;
            normalizeSize = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
            oldMouse.x = event.clientX;
            oldMouse.y = event.clientY;
            /// Based on mouse button
            if(event.ctrlKey) {
                if(event.button === 0)
                    this.ResetRotation();
                else if(event.button === 1)
                    this.ResetZoom();
                else if(event.button === 2)
                    this.ResetPosition();
            }
            if(event.button === 0) {
                oldRot.horizontal = this.cameraSettings.currentRotation.horizontal;
                oldRot.vertical = this.cameraSettings.currentRotation.vertical;
                var verticalCheck = Math.abs(oldRot.vertical)%2;
                horizontalCorrection = (verticalCheck > 0.5 && verticalCheck < 1.5) ? -1 : 1;
            }
            else if(event.button === 2) {
                if(this.cameraSettings.canPan)
                    document.body.style.cursor = "grab";
            }
        })
        window.addEventListener("mousemove", (event) => {
            if(!isDown) return;
            deltaMouse.x = event.clientX - oldMouse.x;
            deltaMouse.y = event.clientY - oldMouse.y;
            /// Based on mouse button
            if(event.which === 1) {
                if(!this.cameraSettings.canRotate) return;
                deltaRot.horizontal = deltaMouse.x/normalizeSize;
                deltaRot.vertical = deltaMouse.y/normalizeSize;
                this.cameraSettings.currentRotation.vertical = oldRot.vertical - deltaRot.vertical;
                this.cameraSettings.currentRotation.horizontal = oldRot.horizontal - deltaRot.horizontal*horizontalCorrection;
                this.ClampRotation();
            }
            else if(event.which === 3) { /// event.button is 0 for both left and right click in this event for some reason
                if(!this.cameraSettings.canPan) return;
                this.pivot.translateX(-(deltaMouse.x/normalizeSize)*this.cameraSettings.averageObjectLength*2*(this.camera.position.z/this.cameraSettings.recommCameraDist)*this.CalculatePanFalloff());
                this.pivot.translateY((deltaMouse.y/normalizeSize)*this.cameraSettings.averageObjectLength*2*(this.camera.position.z/this.cameraSettings.recommCameraDist)*this.CalculatePanFalloff());
                oldMouse.x = event.clientX;
                oldMouse.y = event.clientY;
            }
        })
        this.canvas.addEventListener("mouseleave", () => {
            isInside = false;
            if(isDown) return;
            document.body.style.overflow = bodyOverscrollSave;
        })
        window.addEventListener("mouseup", () => {
            isDown = false;
            if(!isInside) document.body.style.overflow = bodyOverscrollSave;
            document.body.style.cursor = "auto";
        })
        const ZoomFalloff = (): number => {
            if(!this.cameraSettings.enableZoomFalloff) return 1;
            return ((this.cameraSettings.currentZoom-this.cameraSettings.maxZoom.in)/this.cameraSettings.recommCameraDist)
        }
        this.canvas.addEventListener("wheel", (event) => {
            if(!this.cameraSettings.canZoom) return;
            this.cameraSettings.currentZoom += (this.cameraSettings.averageObjectLength*10/100) * ZoomFalloff() * (event.deltaY > 0 ? 1 : -1);
            this.ClampZoom();
        })
    }
    private LoadTouchControls() {
        var touches: Touch[] = [];
        var oldRotTouch: MousePos = {x: 0, y: 0}, deltaRotTouch: MousePos = {x: 0, y: 0};
        var oldRot: Rotation = {vertical: 0, horizontal: 0}, deltaRot: Rotation = {vertical: 0, horizontal: 0};
        var anchorLength: number, newLength: number;
        var oldDistance: number, oldPosition: MousePos = {x: 0, y: 0};
        var normalizeSize: number;
        var horizontalCorrection: 1 | -1 = 1;
        this.canvas.addEventListener("touchstart", (event) => {
            if(touches.length >= 2) return;
            touches.push(event.changedTouches[0]);
            normalizeSize = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
            if(touches.length === 1) {
                oldRot.horizontal = this.cameraSettings.currentRotation.horizontal;
                oldRot.vertical = this.cameraSettings.currentRotation.vertical;
                oldRotTouch = {
                    x: touches[0].clientX,
                    y: touches[0].clientY
                }
                var verticalCheck = Math.abs(oldRot.vertical)%2;
                horizontalCorrection = (verticalCheck > 0.5 && verticalCheck < 1.5) ? -1 : 1;
            }
            else if(touches.length === 2) {
                /// Zoom
                if(this.cameraSettings.canZoom) {
                    var x = Math.abs(touches[1].clientX - touches[0].clientX);
                    var y = Math.abs(touches[1].clientY - touches[0].clientY);
                    anchorLength = Math.sqrt(x*x + y*y);
                    oldDistance = this.cameraSettings.currentZoom;
                }
                /// Position
                if(this.cameraSettings.canPan) {
                    oldPosition = {
                        x: (touches[0].clientX + touches[1].clientX)/2,
                        y: (touches[0].clientY + touches[1].clientY)/2
                    }
                }
            }
        })
        this.canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();
            if(touches.length === 1) {
                if(!this.cameraSettings.canRotate) return;
                deltaRotTouch.x = event.touches[0].clientX - oldRotTouch.x;
                deltaRotTouch.y = event.touches[0].clientY - oldRotTouch.y;
                deltaRot.horizontal = deltaRotTouch.x/normalizeSize;
                deltaRot.vertical = deltaRotTouch.y/normalizeSize;
                this.cameraSettings.currentRotation.vertical = oldRot.vertical - deltaRot.vertical;
                this.cameraSettings.currentRotation.horizontal = oldRot.horizontal - deltaRot.horizontal*horizontalCorrection;
                this.ClampRotation();
            }
            else if(touches.length === 2) {
                /// Zoom
                if(this.cameraSettings.canZoom) {
                    for(var i=0; i<event.changedTouches.length; i++) {
                        var index = event.changedTouches[i].identifier;
                        touches.splice(index, 1, event.changedTouches[i]);
                    }
                    var x = Math.abs(touches[1].clientX - touches[0].clientX);
                    var y = Math.abs(touches[1].clientY - touches[0].clientY);
                    newLength = Math.sqrt(x*x + y*y);
                    this.cameraSettings.currentZoom = oldDistance-(((newLength/anchorLength)-1)*oldDistance);
                    this.ClampZoom();
                }
                /// Position
                if(this.cameraSettings.canPan) {
                    var newPosition: MousePos = {
                        x: (event.touches[0].clientX + event.touches[1].clientX)/2,
                        y: (event.touches[0].clientY + event.touches[1].clientY)/2
                    }
                    var deltaPosition: MousePos = {
                        x: oldPosition.x - newPosition.x,
                        y: oldPosition.y - newPosition.y
                    }
                    this.pivot.translateX((deltaPosition.x/normalizeSize)*this.cameraSettings.averageObjectLength*2*(this.camera.position.z/this.cameraSettings.recommCameraDist)*this.CalculatePanFalloff());
                    this.pivot.translateY(-(deltaPosition.y/normalizeSize)*this.cameraSettings.averageObjectLength*2*(this.camera.position.z/this.cameraSettings.recommCameraDist)*this.CalculatePanFalloff());
                    oldPosition = newPosition;
                }

            }
        })
        this.canvas.addEventListener("touchend", (event) => {
            touches.splice(touches.indexOf(event.changedTouches[0]), 1);
            if(touches.length === 1) touches = [];
        })
    }
    private Tick() { /// Called every frame
        /// updating the rotation
        this.pivot.rotation.set(this.cameraSettings.currentRotation.vertical*Math.PI, this.cameraSettings.currentRotation.horizontal*Math.PI, 0);
        /// updating the zoom
        this.camera.position.z = this.cameraSettings.currentZoom;

        /// calling a new frame
        window.requestAnimationFrame(() => this.Tick());
    }
    public ResetRotation() {
        this.currentRotation = {
            vertical: 0,
            horizontal: 0
        };
    }
    public ResetPosition() {
        this.pivot.position.set(0, 0, 0);
    }
    public ResetZoom() {
        this.cameraSettings.currentZoom = this.cameraSettings.recommCameraDist;
    }

    /// GET SET

    /// CURRENT ZOOM
    get currentZoom(): number {
        if(this.cameraSettings !== undefined)
            return this.cameraSettings.currentZoom;
        else
            return this.CheckZoomString(this.settings.currentZoom);
    }
    set currentZoom(value: number | string) {
        this.SetCurrentZoom(value);
    }
    private SetCurrentZoom(value: number | string) {
        try {
            if(typeof value === "string")
                this.cameraSettings.currentZoom = this.cameraSettings.recommCameraDist*this.CheckZoomString(value)/100;
            else
                this.cameraSettings.currentZoom = value;
        }
        catch { window.requestAnimationFrame(() => this.SetCurrentZoom(value)); }
    }

    /// CURRENT ROTATION
    get currentRotation(): rotation {
        return this.cameraSettings.currentRotation;
    }
    set currentRotation(value: rotation) {
        this.SetCurrentRotation(value);
    }
    private SetCurrentRotation(value: rotation) {
        try {
            value = {
                vertical: value.vertical % 360,
                horizontal: value.horizontal % 360
            }
            this.currentRotation.horizontal = value.horizontal/180;
            this.currentRotation.vertical = value.vertical/180;
        }
        catch { window.requestAnimationFrame(() => this.SetCurrentRotation(value)); }
    }

    /// FOCUS DISPLAY
    get focusDisplay(): boolean {
        return this.cameraSettings.focusDisplay;
    }
    set focusDisplay(value: boolean) {
        this.cameraSettings.focusDisplay = value;
    }

    /// CAN ROTATE
    get canRotate(): boolean {
        return this.cameraSettings.canRotate;
    }
    set canRotate(value: boolean) {
        this.cameraSettings.canRotate = value;
    }

    /// CAN PAN
    get canPan(): boolean {
        return this.cameraSettings.canPan;
    }
    set canPan(value: boolean) {
        this.cameraSettings.canPan = value;
    }
    
    /// CAN ZOOM
    get canZoom(): boolean {
        return this.cameraSettings.canZoom;
    }
    set canZoom(value: boolean) {
        this.cameraSettings.canZoom = value;
    }
}

export { CameraControlsLoader };