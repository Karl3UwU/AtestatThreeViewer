import './style.css'
import { Viewer } from "./lib/ViewerThree";

var domdiv = document.getElementById("viewer")! as HTMLDivElement;
var buttonWireframe = document.getElementById("wireframe-button")! as HTMLInputElement;
var buttonFlatShade = document.getElementById("flatshade-button")! as HTMLInputElement;
var buttonBoundBox = document.getElementById("boundbox-button")! as HTMLInputElement;
var buttonResetRotation = document.getElementById("reset-rot")! as HTMLButtonElement;
var buttonResetPosition = document.getElementById("reset-pos")! as HTMLButtonElement;
var buttonResetZoom = document.getElementById("reset-zoom")! as HTMLButtonElement;

var buttonsSetup = () => {
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

var test = new Viewer({
	div: domdiv,
	objectPath: "/Objects/JhinPistol.glb",
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