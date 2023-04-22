import './style.css'
import { Viewer } from "./lib/ViewerThree";

var threeDiv = document.getElementById("viewer")! as HTMLDivElement;
var dropZoneDiv = document.getElementById("gltf-dropzone")! as HTMLDivElement;

var buttonWireframe = document.getElementById("wireframe-button")! as HTMLInputElement;
var buttonFlatShade = document.getElementById("flatshade-button")! as HTMLInputElement;
var buttonBoundBox = document.getElementById("boundbox-button")! as HTMLInputElement;
var buttonResetRotation = document.getElementById("reset-rot")! as HTMLButtonElement;
var buttonResetPosition = document.getElementById("reset-pos")! as HTMLButtonElement;
var buttonResetZoom = document.getElementById("reset-zoom")! as HTMLButtonElement;
var buttonTemplate = document.getElementById("template-button")! as HTMLButtonElement;

dropZoneDiv.addEventListener("drop", (e) => {
	buttonTemplate.disabled = true;
	e.preventDefault();
	var file = e.dataTransfer?.files[0]!;
	if(!(/.*(.gtlf|.glb)/.test(file?.name))) {
		alert("File is not .gltf");
		return;
	}
	var reader = new FileReader();
	reader.onload = (e) => {
		LoadObject(reader.result!);
	}
	reader.readAsArrayBuffer(file);
})
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
	buttonWireframe.checked = test.wireframe;
	buttonFlatShade.checked = test.flatShade;
	buttonBoundBox.checked = test.boundBox;

	/// Adding events
	buttonWireframe.addEventListener("click", () => { test.wireframe = buttonWireframe.checked });
	buttonFlatShade.addEventListener("click", () => { test.flatShade = buttonFlatShade.checked });
	buttonBoundBox.addEventListener("click", () => { test.boundBox = buttonBoundBox.checked });
	buttonResetRotation.addEventListener("click", () => { test.ResetRotation() });
	buttonResetPosition.addEventListener("click", () => { test.ResetPosition() });
	buttonResetZoom.addEventListener("click", () => { test.ResetZoom() });
}

buttonTemplate.addEventListener("click", () => {
	buttonTemplate.disabled = true;
	LoadObject("./Objects/JhinPistol.glb");
})

var test: Viewer;
var LoadObject = (objectPath: string | ArrayBuffer) => {
	test = new Viewer({
		div: threeDiv,
		objectPath: objectPath,
		settings: {
			camera: {
				focusDisplay: false,
			},
			object: {
				wireframe: false,
				flatShade: false,
				boundBox: false
			}
		},
		onLoad: buttonsSetup
	});
}