import './style.css'
import { Viewer } from "./lib/ViewerThree";

var threeDiv = document.getElementById("viewer")! as HTMLDivElement;
var dropZoneDiv = document.getElementById("gltf-dropzone")! as HTMLDivElement;

var buttonWireframe = document.getElementById("wireframe-button")! as HTMLInputElement;
var buttonFlatShade = document.getElementById("flatshade-button")! as HTMLInputElement;
var buttonBoundBox = document.getElementById("boundbox-button")! as HTMLInputElement;
var buttonEnableRotation = document.getElementById("rotation-button")! as HTMLInputElement;
var buttonEnablePanning = document.getElementById("panning-button")! as HTMLInputElement;
var buttonEnableZoom = document.getElementById("zoom-button")! as HTMLInputElement;
var buttonResetRotation = document.getElementById("reset-rot")! as HTMLButtonElement;
var buttonResetPosition = document.getElementById("reset-pos")! as HTMLButtonElement;
var buttonResetZoom = document.getElementById("reset-zoom")! as HTMLButtonElement;
var buttonTemplate = document.getElementById("template-button")! as HTMLButtonElement;

var handleDrop = (e: DragEvent) => {
	buttonTemplate.disabled = true;
	e.preventDefault();
	var file = e.dataTransfer?.files[0]!;
	if(!(/.*(.gtlf|.glb)/.test(file?.name))) {
		alert("File is not of type .gltf");
		return;
	}
	dropZoneDiv.removeEventListener("drop", handleDrop);
	var reader = new FileReader();
	reader.onload = () => {
		LoadObject(reader.result!);
	}
	reader.readAsArrayBuffer(file);
}
dropZoneDiv.addEventListener("drop", handleDrop)
dropZoneDiv.addEventListener("dragover", (e) => {
	e.preventDefault();
})
dropZoneDiv.addEventListener("dragenter", (e) => {
	e.preventDefault();
})

var buttonsSetup = () => {
	/// Animations
	dropZoneDiv.classList.add("loadAnimation");
	threeDiv.classList.add("loadAnimation");
	dropZoneDiv.addEventListener("animationend", () => {
		dropZoneDiv.style.display = "none";
	})

	/// Setting values
	buttonWireframe.checked = viewer.objectLoader.wireframe;
	buttonFlatShade.checked = viewer.objectLoader.flatShade;
	buttonBoundBox.checked = viewer.objectLoader.boundBox;
	buttonEnableRotation.checked = viewer.cameraLoader.canRotate;
	buttonEnablePanning.checked = viewer.cameraLoader.canPan;
	buttonEnableZoom.checked = viewer.cameraLoader.canZoom;

	/// Adding events
	buttonWireframe.addEventListener("click", () => { viewer.objectLoader.wireframe = buttonWireframe.checked });
	buttonFlatShade.addEventListener("click", () => { viewer.objectLoader.flatShade = buttonFlatShade.checked });
	buttonBoundBox.addEventListener("click", () => { viewer.objectLoader.boundBox = buttonBoundBox.checked });
	buttonEnableRotation.addEventListener("click", () => { viewer.cameraLoader.canRotate = buttonEnableRotation.checked });
	buttonEnablePanning.addEventListener("click", () => { viewer.cameraLoader.canPan = buttonEnablePanning.checked });
	buttonEnableZoom.addEventListener("click", () => { viewer.cameraLoader.canZoom = buttonEnableZoom.checked });
	buttonResetRotation.addEventListener("click", () => { viewer.ResetRotation() });
	buttonResetPosition.addEventListener("click", () => { viewer.ResetPosition() });
	buttonResetZoom.addEventListener("click", () => { viewer.ResetZoom() });
}

buttonTemplate.addEventListener("click", () => {
	buttonTemplate.disabled = true;
	LoadObject("./Objects/JhinPistol.glb");
})

var viewer: Viewer;
var LoadObject = (objectPath: string | ArrayBuffer) => {
	viewer = new Viewer({
		div: threeDiv,
		objectPath: objectPath,
		settings: {
			camera: {
				focusDisplay: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
			},
		},
		onLoad: buttonsSetup
	});
}