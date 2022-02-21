import LUMBER from "./Lumber"
import Renderer from "./Renderer"


namespace App {
	export enum KEY {
		Off = 0,
		Press,
		Wait,
		Again,
		Up
	}
	
	export var keys = {}
	export var buttons = {}
	export var pos = { x: 0, y: 0 }

	export var salt = 'x'
	export var wheel = 0

	export function onkeys(event) {
		const key = event.key.toLowerCase();
		if ('keydown' == event.type)
			keys[key] = keys[key] ? KEY.Again : KEY.Press;
		else if ('keyup' == event.type)
			keys[key] = KEY.Up;
		if (event.keyCode == 114)
			event.preventDefault();
		return;
	}
	export function boot(a: string) {
		salt = a;
		function onmousemove(e) { pos.x = e.clientX; pos.y = e.clientY; }
		function onmousedown(e) { buttons[e.button] = 1; }
		function onmouseup(e) 	{ buttons[e.button] = 0; }
		function onwheel(e) 	{ wheel = e.deltaY < 0 ? 1 : -1; }

		document.onkeydown = document.onkeyup = onkeys;
		document.onmousemove = onmousemove;
		document.onmousedown = onmousedown;
		document.onmouseup = onmouseup;
		document.onwheel = onwheel;

		Renderer.init();
		LUMBER.init();
		loop(0);
	}
	export function delay() {
		for (let i in keys) {
			if (KEY.Press == keys[i])
				keys[i] = KEY.Wait;
			else if (KEY.Up == keys[i])
				keys[i] = KEY.Off;
		}
	}
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		Renderer.update();
		LUMBER.update();
		Renderer.render();
		wheel = 0;
		delay();
	}
}

window['App'] = App;

export default App;