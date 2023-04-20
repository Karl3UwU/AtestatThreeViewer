import './style.css'
import { Viewer } from "./lib/ViewerThree";

var domdiv = document.getElementById("viewer")! as HTMLDivElement;
var buttonWireframe = document.getElementById("wireframe-button")! as HTMLInputElement;

var buttonsSetup = () => {
	/// Setting values
	buttonWireframe.checked = test.wireframe;

	/// Adding events
	buttonWireframe.addEventListener("click", () => { test.wireframe = buttonWireframe.checked });
}

var test = new Viewer({
	div: domdiv,
	objectPath: "/Objects/JhinPistol.glb",
	settings: {
		camera: {
			focusDisplay: false,
		},
		object: {
			wireframe: true,
		}
	},
	onLoad: buttonsSetup
});