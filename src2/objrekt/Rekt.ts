import LUMBER from "../Lumber";
import Renderer from "../Renderer";
import Obj from "./Obj";

import pts from "../lib/pts";

import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Color } from "three";

import { Chunk } from "../lod/Chunks";
import aabb2 from "../lib/aabb2";

class Rekt {
	name: string
	tile: vec2 = [0, 0]
	sst: Asset
	obj?: Obj
	color?: string
	flip?: boolean
	opacity: number = 1
	bound?: aabb2

	mesh: Mesh
	meshShadow: Mesh

	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry

	center: vec2 = [0, 0]
	position: vec3 = [0, 0, 0]

	//low = false
	used = false
	flick = false
	plain = false

	constructor() {
		Rekt.num++;
	}
	unset() {
		Rekt.num--;
		this.unuse();
	}
	paint_alternate() {
		if (!LUMBER.PAINT_OBJ_TICK_RATE)
			return;
		if (!this.used)
			return;
		this.flick = !this.flick;
		this.material.color.set(new Color(this.flick ? 'red' : 'blue'));
		if (this.obj?.chunk)
			this.obj.chunk.changed = true;
	}
	unuse() {
		if (!this.used)
			return;
		this.used = false;
		this.get_group().remove(this.mesh);
		Rekt.active--;
		this.geometry.dispose();
		this.material.dispose();
	}
	use() {
		if (this.used)
			console.warn('rekt already inuse');

		Rekt.active++;

		this.used = true;

		this.geometry = new PlaneBufferGeometry(
			this.sst.size[0], this.sst.size[1], 2, 2);

		let map;
		if (this.sst)
			map = Renderer.loadtexture(`assets/${this.sst.img}.png`);

		this.material = new MeshBasicMaterial({
			map: map,
			transparent: true,
			opacity: this.opacity,
			color: 0xffffff
		});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		this.mesh.scale.set(1, 1, 1);

		if (this.flip)
			this.mesh.scale.x = -this.mesh.scale.x;

		//UV.FlipPlane(this.geometry, 0, true);

		this.update();

		this.get_group().add(this.mesh);
	}
	get_group() {
		let c: Chunk | null | undefined;
		if (c = this.obj?.chunk)
			if (this.obj?.rtt && LUMBER.USE_CHUNK_RT)
				return c.grouprt;
			else
				return c.group;
		else
			return Renderer.scene;
	}
	update() {
		let x, y;

		let xy = pts.add(this.tile, this.sst.offset || [0, 0]);

		//let squared = this.size[0] / 2 / Lumber.HALVE;
		//console.log('squared',squared);

		if (this.plain) {
			x = xy[0];
			y = xy[1];
		}
		else {
			xy = pts.mult(xy, LUMBER.EVEN);

			if (LUMBER.OFFSET_CHUNK_OBJ_REKT && this.obj?.chunk)
				xy = pts.subtract(xy, this.obj.chunk.rekt_offset);

			x = xy[0] / 2 + xy[1] / 2;
			y = xy[1] / 4 - xy[0] / 4;

			this.center = [x, y];

			// middle bottom
			const w = this.sst.size[0] / 2;
			const h = this.sst.size[1] / 2;

			y += h;

			this.bound = new aabb2([0, 0], this.sst.size);
			this.bound.translate([x, y]);
		}

		this.position = [x, y, 0];

		if (this.mesh) {
			this.set_depth();
			this.mesh.position.fromArray(this.position);
			this.mesh.updateMatrix();
			this.material.color = new Color(this.obj?.chunk?.childobjscolor || this.color || 0xffffff);
		}
	}
	set_depth() {
		let depth = this.obj?.weight.order || Rekt.ptdepth(this.tile);
		if (this.mesh)
			this.mesh.renderOrder = depth;
	}
}

namespace Rekt {
	export let num = 0;
	export let active = 0;

	//export type Struct = Rekt['struct']

	export function ptdepth(t: vec2) {
		return -t[1] + t[0];
	}
}

export default Rekt;