import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ObjectSettings } from "./Settings";

const gltfLoader = new GLTFLoader();

function CenterObject(object: THREE.Group, cbFunc?: Function): void {
    const objectBox = new THREE.Box3().setFromObject(object, true);
    const objectOffset = {
        x: (objectBox.max.x + objectBox.min.x) / 2,
        y: (objectBox.max.y + objectBox.min.y) / 2,
        z: (objectBox.max.z + objectBox.min.z) / 2,
    }
    object.children.forEach((mesh) => {
        mesh.position.x -= objectOffset.x;
        mesh.position.y -= objectOffset.y;
        mesh.position.z -= objectOffset.z;
    })
    if(cbFunc) cbFunc();
}

interface ObjectLoaderParams {
    objectPath: string | ArrayBuffer,
    settings?: ObjectSettings
}

class ObjectLoader {
    private objectPath: string | ArrayBuffer;
    public object: THREE.Group;
    public boundingBox!: THREE.Mesh;
    private onLoad?: Function;
    private settings: ObjectSettings = {};
    private materials: [THREE.MeshStandardMaterial[], THREE.MeshBasicMaterial[]] = [[], []];


    constructor(objParams: ObjectLoaderParams, onLoadFunction?: Function) {
        this.objectPath = objParams.objectPath;
        this.object = new THREE.Group();
        if(objParams.settings) this.settings = objParams.settings;
        if(onLoadFunction) this.onLoad = onLoadFunction;
        this.CopySettings(objParams.settings);
    }
    private CopySettings(settings?: ObjectSettings) {
        this.settings.wireframe = settings?.wireframe !== undefined ? settings.wireframe : false;
        this.settings.boundBox = settings?.boundBox!== undefined ? settings.boundBox : false;
        this.settings.flatShade = settings?.flatShade !== undefined ? settings.flatShade : false;
        this.LoadObjectFromPath(this.objectPath);
    }
    private LoadObjectFromPath(objectPath: string | ArrayBuffer): void {
        var onLoad = (loaded: GLTF) => {
            while(loaded.scene.children.length)
                this.object.add(loaded.scene.children[0]);
            var traverseIndex = 0;
            this.object.traverse((child) => {
                if(child.type !== "Mesh") return;
                const standardMat = ((child as THREE.Mesh).material as THREE.MeshStandardMaterial);
                const basicMat = new THREE.MeshBasicMaterial();
                THREE.MeshBasicMaterial.prototype.copy.call(basicMat, standardMat);
                this.materials[0][traverseIndex] = standardMat; this.materials[1][traverseIndex] = basicMat;
                this.materials[0][traverseIndex].wireframe = this.materials[1][traverseIndex].wireframe = this.settings.wireframe!;
                (child as THREE.Mesh).material = this.settings.flatShade ? this.materials[1][traverseIndex] : this.materials[0][traverseIndex];
                traverseIndex++;
            })
            this.CreateBoundingBox();
        }
        if(typeof objectPath === "string")
            gltfLoader.load(objectPath, onLoad);
        else
            gltfLoader.parse(objectPath, "", onLoad);
    }
    private CreateBoundingBox() {
        /// Get the min and max positions of the object
        const box = new THREE.Box3().setFromObject(this.object);
        /// Adding the positions together to get the length on x y z
        const dimensions = new THREE.Vector3().subVectors(box.min, box.max);
        /// Creating the box geometry with the dimensions
        const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z, 2, 2, 2);
        /// Creating the object itself
        this.boundingBox = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true}));
        this.boundingBox.visible = this.settings?.boundBox ? this.settings.boundBox : false;
        if(this.onLoad) this.onLoad();
    }

    /// Get Set

    /// WIREFRAME
    get wireframe(): boolean {
        return this.settings.wireframe!;
    }
    set wireframe(value: boolean) {
        this.SetWireframe(value);
    }
    private SetWireframe(value: boolean) {
        try {
            this.settings.wireframe = value;
            var traverseIndex = 0;
            this.object.traverse((child) => {
                if(child.type !== "Mesh") return;
                this.materials[0][traverseIndex].wireframe = this.materials[1][traverseIndex].wireframe = this.settings.wireframe!;
                traverseIndex++;
            })
        }
        catch { window.requestAnimationFrame(() => this.SetWireframe(value)) };
    }

    /// BOUNDING BOX
    get boundBox(): boolean {
        return this.settings.boundBox!;
    }
    set boundBox(value: boolean) {
        this.SetBoundBox(value);
    }
    private SetBoundBox(value: boolean) {
        try { 
            this.settings.boundBox = value;
            this.boundingBox.visible = this.settings.boundBox!;
        }
        catch { window.requestAnimationFrame(() => this.SetBoundBox(value)) }
    }

    /// FLATSHADE
    get flatShade(): boolean {
        return this.settings.flatShade!;
    }
    set flatShade(value: boolean) {
        this.SetFlatShade(value);
    }
    private SetFlatShade(value: boolean) {
        try {
            this.settings.flatShade = value;
            var traverseIndex = 0;
            this.object.traverse((child) => {
                if(child.type !== "Mesh") return;
                if(value === true) (child as THREE.Mesh).material = this.materials[1][traverseIndex];
                else (child as THREE.Mesh).material = this.materials[0][traverseIndex];
                traverseIndex++;
            })
        }
        catch { window.requestAnimationFrame(() => this.SetFlatShade(value)) }
    }
}

export {ObjectLoader, CenterObject};