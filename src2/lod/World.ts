import LUMBER from "../Lumber";
import Renderer from "../Renderer";
import Obj from "../objrekt/Obj";
import Rekt from "../objrekt/Rekt";
import pts from "../lib/pts";
import aabb2 from "../lib/aabb2";

import App from "../App";

import { Chunk, ChunkMaster } from "./Chunks";

import { Ply } from "../nested/char/Char";
import { Ploppables } from "./Ploppables";

const SHOW_FRUSTUM = true;

class World {
	static rig() {
		return new World;
	}

	pos: vec2 = [0, 0]
	scale: number = 1
	dpi: number = 1

	focal: vec3
	view: aabb2
	frustum: Rekt

	fg: ChunkMaster<Chunk>
	bg: ChunkMaster<Chunk>

	mtil: vec2 = [0, 0]
	wheelable = true

	constructor() {
		this.init();

		this.view = new aabb2([0, 0], [0, 0]);

		const frustum: Asset = {
			img: 'egyt/128',
			size: [1, 1],
			area: [1, 1],
			offset: [0, 0]
		};

		if (SHOW_FRUSTUM) {
			this.frustum = new Rekt;
			this.frustum.name = 'Frustum';
			this.frustum.sst = frustum;

			this.frustum.plain = true;
			this.frustum.use();
			this.frustum.mesh.renderOrder = 9999999;
			this.frustum.material.wireframe = true;
		}

		console.log('world');
	}
	add(obj: Obj) {
		let c = this.fg.at_tile(obj.tile);

		if (c.objs.add(obj)) {
			obj.chunk = c;
			obj.chunk.changed = true;
			if (c.on)
				obj.comes();
		}
	}
	remove(obj: Obj) {
		if (obj.chunk?.objs.remove(obj)) {
			obj.goes();
			obj.chunk.changed = true;
		}
	}
	update() {
		this.move();
		this.mark_mouse();
		
		this.fg.update();
		this.bg.update();
	}

	mark_mouse() {
		let m: vec2 = [App.pos.x, App.pos.y];
		m[1] = -m[1];
		m = pts.divide(m, LUMBER.wlrd.scale);

		let p = <vec2>[LUMBER.wlrd.view.min[0], LUMBER.wlrd.view.max[1]];
		p = pts.add(p, m);

		const unprojected = World.unproject(p);

		this.mtil = unprojected.tiled;

		this.mtil = pts.floor(this.mtil); // fix for ndpi? no
	}
	init() {
		this.fg = new ChunkMaster<Chunk>(Chunk, 20);
		this.bg = new ChunkMaster<Chunk>(Chunk, 20);

		LUMBER.ply = new Ply;
		LUMBER.ply.tile = [0, 0]
		LUMBER.ply.finish();

		LUMBER.ply.comes();

		this.preloads();
		//this.populate();
	}
	preloads() {
		let textures = 0;
		let loaded = 0;

		function callback() {
			if (++loaded >= textures)
				LUMBER.resourced('POPULAR_ASSETS');
		}

		function preload_textures(strs: string[]) {
			textures = strs.length;
			for (let str of strs)
				Renderer.loadtexture(str, undefined, callback);
		}
		preload_textures([
			'assets/egyt/tileorange.png',
			'assets/egyt/farm/wheat_i.png',
			'assets/egyt/farm/wheat_il.png',
			'assets/egyt/farm/wheat_ili.png',
			'assets/egyt/farm/wheat_ilil.png',
			'assets/egyt/farm/wheat_ilili.png',
			'assets/egyt/tree/oaktree3.png',
			'assets/egyt/tree/oaktree4.png',
			'assets/egyt/ground/stone1.png',
			'assets/egyt/ground/stone2.png',
			'assets/egyt/ground/gravel1.png',
			'assets/egyt/ground/gravel2.png',
		]);
	}
	move() {
		let speed = 5;
		const factor = 1 / this.dpi;

		let p = [...this.pos];

		if (App.keys['x']) speed *= 10;

		if (App.keys['w']) p[1] -= speed;
		if (App.keys['s']) p[1] += speed;
		if (App.keys['a']) p[0] += speed;
		if (App.keys['d']) p[0] -= speed;

		this.pos = <vec2>[...p];

		if (this.wheelable && App.wheel > 0) {
			if (this.scale < 1) {
				this.scale = 1;
			}
			else {
				this.scale += factor;
			}
			if (this.scale > 2 / this.dpi)
				this.scale = 2 / this.dpi;

			//console.log('scale up', this.scale);
		}

		else if (this.wheelable && App.wheel < 0) {
			this.scale -= factor;
			if (this.scale < .5 / this.dpi)
				this.scale = .5 / this.dpi;

			//console.log('scale down', this.scale);
		}

		Renderer.scene.scale.set(this.scale, this.scale, 1);

		let p2 = pts.mult(this.pos, this.scale);

		Renderer.scene.position.set(p2[0], p2[1], 0);

		let w = Renderer.w; // tq.target.width;
		let h = Renderer.h; // tq.target.height;

		//console.log(`tq target ${w} x ${h}`)

		let w2 = w / this.dpi / this.scale;
		let h2 = h / this.dpi / this.scale;

		this.view = new aabb2(
			[-p[0] - w2 / 2, -p[1] - h2 / 2],
			[-p[0] + w2 / 2, -p[1] + h2 / 2]
		);
		this.view.min = pts.floor(this.view.min);
		this.view.max = pts.floor(this.view.max);

		this.focal = [-p[0], -p[1], 0];

		//return;

		if (SHOW_FRUSTUM) {
			this.frustum.mesh.scale.set(w2, h2, 1);
			this.frustum.tile = pts.divide(<vec2><unknown>this.focal, LUMBER.EVEN);
			this.frustum.update();
		}
	}
	populate() {

		const desert1010: Asset = {
			img: 'balmora/desert1010',
			size: [480, 240],
			area: [10, 10],
			offset: [0, 0],
		}
		const every = (pos: vec2) => {
			let obj = new Obj;
			obj.rtt = false;
			obj.rekt = new Rekt;
			//obj.rekt.low = true;
			obj.rekt.sst = desert1010;
			obj.tile = obj.rekt.tile = pts.mult(pos, 20);
			LUMBER.wlrd.add(obj);
		}
	}
}

namespace World {
	type Un = { untiled: vec2, tiled: vec2, mult: vec2 };

	export function unproject(query: vec2): Un {
		let p = query;

		let un = pts.unproject(p);

		let p2;
		p2 = pts.divide(un, 24);
		p2 = pts.floor(p2);
		p2[0] += 1; // necessary

		let p3 = pts.mult(p2, 24);

		return { untiled: un, tiled: p2, mult: p3 };
	}
}

export default World;