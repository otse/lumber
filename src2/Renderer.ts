import { default as THREE, OrthographicCamera, Clock, Scene, WebGLRenderer, Texture, TextureLoader, WebGLRenderTarget, ShaderMaterial, Mesh, PlaneBufferGeometry, Color, NearestFilter, RGBAFormat, Group, Renderer } from 'three';

import App from './App';

export { THREE };

const fragmentBackdrop = `
varying vec2 vUv;
//uniform float time;
void main() {
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 );
}`

const fragmentPost = `
// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	gl_FragColor = clr;
}`


const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

// three quarter

namespace Renderer {

	export var ndpi;
	export var delta = 0;

	export var clock: Clock
	export var scene: Scene
	export var scene2: Scene
	export var rttscene: Scene
	export var camera: OrthographicCamera
	export var camera3: OrthographicCamera
	export var target: WebGLRenderTarget
	export var renderer: WebGLRenderer

	export var materialBg: ShaderMaterial
	export var materialPost: ShaderMaterial

	export var quadPost: Mesh

	//export var ambientLight: AmbientLight
	//export var directionalLight: DirectionalLight

	export function update() {

		delta = clock.getDelta();

		//filmic.composer.render();
	}

	var reset = 0;
	var frames = 0;
	export var fps;
	export var memory;

	// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
	export function calc() {
		const s = Date.now() / 1000;
		frames++;
		if (s - reset >= 1) {
			reset = s;
			fps = frames;
			frames = 0;
		}

		memory = (<any>window.performance).memory;
	}
	export function render() {

		calc();

		renderer.setRenderTarget(target);
		renderer.clear();
		renderer.render(scene, camera);

		renderer.setRenderTarget(null); // Naar scherm
		renderer.clear();
		renderer.render(scene2, camera);
	}

	export var wh: vec2;
	export var plane;

	export function init() {

		console.log('ThreeQuarter Init');

		clock = new Clock();

		scene = new Scene();
		scene.background = new Color('#292929');
		scene2 = new Scene();
		rttscene = new Scene();

		ndpi = window.devicePixelRatio;

		console.log(`window innerWidth, innerHeight ${window.innerWidth} x ${window.innerHeight}`);

		if (ndpi > 1) {
			console.warn('Dpi i> 1. Game may scale.');
		}

		target = new WebGLRenderTarget(
			window.innerWidth, window.innerHeight,
			{
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBFormat
			});

		renderer = new WebGLRenderer({ antialias: false });
		renderer.setPixelRatio(ndpi);
		renderer.setSize(100, 100);
		renderer.autoClear = true;
		renderer.setClearColor(0xffffff, 0);

		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		materialPost = new ShaderMaterial({
			uniforms: { tDiffuse: { value: target.texture } },
			vertexShader: vertexScreen,
			fragmentShader: fragmentPost,
			depthWrite: false
		});

		onWindowResize();

		quadPost = new Mesh(plane, materialPost);
		quadPost.position.z = -100;
		//quadPost.position.x = (-(w2 - w)) / 2;
		//quadPost.position.y = (h2 - h) / 2;
		console.log('neg -(w2 - w)', quadPost.position.x);

		scene2.add(quadPost);

		(window as any).Renderer = Renderer;
	}

	export var w, h, w2, h2, w3, h3;

	function onWindowResize() {
		w = window.innerWidth;
		h = window.innerHeight;
		w2 = w * ndpi;
		h2 = h * ndpi;
		w3 = w2 - (w2 - w);
		h3 = h2 - (h2 - h);
		if (w2 % 2 != 0) {
			w2 -= 1;
		}
		if (h2 % 2 != 0) {
			h2 -= 1;
		}
		target.setSize(w2, h2);
		plane = new PlaneBufferGeometry(w2, h2);
		if (quadPost)
			quadPost.geometry = plane;
		camera = ortographiccamera(w2, h2);
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
		//renderer.domElement.width = renderer.domElement.clientWidth;// * ndpi;
		//renderer.domElement.height = renderer.domElement.clientHeight;// * ndpi;
	}

	let mem = [];

	export function loadtexture(file: string, key?: string, cb?): Texture {
		if (mem[key || file])
			return mem[key || file];

		let texture = new TextureLoader().load(file + `?v=${App.salt}`, cb);

		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;

		mem[key || file] = texture;

		return texture;
	}

	export function rendertarget(w, h) {
		const o = {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		};
		let target = new WebGLRenderTarget(w, h, o);
		return target;
	}

	export function ortographiccamera(w, h) {
		let camera = new OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, - 100, 100);
		camera.updateProjectionMatrix();

		return camera;
	}

	export function erase_children(group: Group) {
		while (group.children.length > 0)
			group.remove(group.children[0]);
	}
}

export default Renderer;