import LUMBER from "../Lumber";
import Renderer from "../Renderer";
import pts from "../lib/pts";

import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3 } from "three";

class Selection {

	mesh: Mesh
	meshShadow: Mesh

	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry

	dim: vec2
	start: vec2
	end: vec2

	enuf: boolean

	constructor() {
		this.enuf = false;
	}

	Make() {
		this.geometry = new PlaneBufferGeometry(1, 1);

		this.material = new MeshBasicMaterial({
			transparent: true,
			//opacity: .5,
			color: 'white',
			wireframe: true
		});

		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.scale.set(1, 1, 1);

		this.mesh.renderOrder = 500;

		Renderer.scene.add(this.mesh);
	}

	Update(mouse: vec2) {
		this.View(mouse);
		this.Save(mouse);
		this.Sufficient(mouse);
		this.Set(mouse);
	}

	Sufficient(mouse: vec2) {
		let rem = pts.subtract(
			<vec2>pts.clone(this.end), this.start);

		const px = pts.together(
			pts.abs(rem as vec2));

		if (!this.enuf && px > 15) {
			this.enuf = true;

			this.Make();
		}
	}

	View(mouse: vec2) {
		pts.subtract(mouse, LUMBER.wlrd.pos);

		pts.subtract(
			mouse, pts.divide(
				<vec2>pts.clone(Renderer.wh), 2));

		let scale = 1;

		if (LUMBER.wlrd.scale == 0.5)
			scale = 2;

		pts.mult(
			mouse, scale);
	}

	Save(mouse: vec2) {
		if (!this.start)
			this.start = [...mouse] as vec2;

		this.end = [...mouse] as vec2;
	}

	Set(mouse: vec2) {
		if (!this.enuf)
			return;

		let size = pts.subtract(
			<vec2>pts.clone(this.end), this.start);

		let pos = pts.subtract(
			<vec2>pts.clone(mouse), pts.divide(<vec2>pts.clone(size), 2));

		this.mesh.scale.set(size[0], size[1], 1);
		this.mesh.position.set(pos[0], pos[1], 0);
	}

	End() {
		if (!this.enuf)
			return;

		Renderer.scene.remove(this.mesh);

		this.geometry.dispose();
		this.material.dispose();
	}
}

namespace Selection {
	//export type Stats = Selection['stats']
}

export default Selection;