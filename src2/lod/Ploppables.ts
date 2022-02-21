import LUMBER from "../Lumber";
import Obj from "../objrekt/Obj";
import Rekt from "../objrekt/Rekt";

import pts from "../lib/pts";
import aabb2 from "../lib/aabb2";
import App from "../App";
import Building from "../objs/Building";
import World from "./World";
import Renderer from "../Renderer";

type Factorio = 'twotwo' | 'threethree' | 'sandhovel1' | 'sandhovel2' | 'sandalleygate' | 'stairs2' | 'stairs3' | 'platform22' | 'platform23' | 'tree';

export namespace Ploppables {

	export var types: Factorio[] = [
		'twotwo',
		'threethree',
		'sandhovel1',
		'sandhovel2',
		'sandalleygate',
		'stairs2',
		'stairs3',
		'platform22',
		'platform23',
		'tree'
	]
	export var index = 0;
	export var ghost: Obj | null = null;

	export function update() {
		let remake = false;
		let obj: Obj | null = null;

		if (ghost) {
			if (App.wheel < 0 && index + 1 < types.length) {
				index++;
				remake = true;
			}
			else if (App.wheel > 0 && index - 1 >= 0) {
				index--;
				remake = true;
			}
		}

		const shortcuts: { [key: string]: Factorio } = {
			'y': 'twotwo',
			'b': 'sandhovel1',
			'p': 'platform22',
			't': 'tree'
		}

		for (const s in shortcuts) {
			if (App.keys[s] == 1) {
				index = types.indexOf(shortcuts[s]);
				remake = true;
				break;
			}
		}

		if (remake) {
			LUMBER.wlrd.wheelable = false;
			obj = factory(types[index]);
			obj.finish();
			obj.comes();
			ghost?.unset();
			ghost = obj;
		}

		if (ghost) {
			let changed = !pts.equals(LUMBER.wlrd.mtil, ghost.tile);
			ghost.tile = LUMBER.wlrd.mtil;
			if (ghost.rekt)
				ghost.rekt.tile = ghost.tile;
			if (changed)
				ghost.update_manual();
			ghost.update_tick();
		}

		if (ghost && App.buttons[0]) {
			LUMBER.wlrd.wheelable = true;
			console.log('plop');
			ghost.goes();
			LUMBER.wlrd.add(ghost);
			ghost.update_manual();
			ghost = null;
		}

		if (ghost && App.keys['escape'] == 1) {
			LUMBER.wlrd.wheelable = true;
			console.log('unplop');
			ghost.unset();
			ghost = null;
		}

		if (App.keys['x'] == 1) {
			let ct = LUMBER.wlrd.fg.big(LUMBER.wlrd.mtil);

			let c = LUMBER.wlrd.fg.at(ct[0], ct[1]);
			if (c) {
				let obj = c.objs.get(LUMBER.wlrd.mtil);
				if (obj) {
					LUMBER.wlrd.remove(obj);
					obj.unset();
				}
				else
					console.log('no obj there at', pts.to_string(LUMBER.wlrd.mtil));
			}
		}
	}

	export function factory(type: Factorio): Obj {
		if (type == 'twotwo')
			return new Building(Building.TwoTwo);
		else if (type == 'threethree')
			return new Building(Building.ThreeThree);
		else if (type == 'sandhovel1')
			return new Building(Building.SandHovel1);
		else if (type == 'sandhovel2')
			return new Building(Building.SandHovel2);
		else if (type == 'sandalleygate')
			return new Building(Building.SandAlleyGate);
		else if (type == 'stairs2')
			return new Building(Building.Stairs2);
		else if (type == 'stairs3')
			return new Building(Building.Stairs3);
		else if (type == 'platform22')
			return new Building(Building.Platform22);
		else if (type == 'platform23')
			return new Building(Building.Platform23);
		else if (type == 'tree')
			return new Tree();
		else
			return new Obj;
	}
}

let tree_positions: vec2[] = [[12, 5], [20, 7], [16, 4], [8, 11], [28, 7], [40, 8], [39, 13], [17, 32], [-21, 11], [-18, 16], [-19, -28], [-24, -29], [-27, -13], [-17, 9], [-18, -1], [-6, 34], [65, 11], [0, 87], [5, 125], [-1, 172], [-62, 36], [-72, 125], [-65, 216], [4, 182], [14, 162], [2, 177], [3, 198], [6, 155], [7, 291], [-38, 350], [-59, 162], [-43, 112], [-106, 52], [154, 20], [213, 21], [141, -53], [23, -60], [62, -65], [260, -62], [241, -49], [251, -45], [220, -36], [209, -57], [223, -65], [209, -45], [181, -67], [190, -83], [221, -88], [264, -87], [274, -95], [263, -106], [255, -106], [237, -110], [248, -124], [239, -65], [221, -49], [189, -94], [263, -55], [271, -44], [278, -61], [246, -51], [240, -55], [226, -43], [228, -39], [208, -49], [248, -65], [227, -70], [230, -17], [210, 12], [269, 33], [275, 156], [66, -210], [125, -49], [-106, 46], [-98, 44], [-97, 55], [-108, -67], [92, -26], [73, -29], [110, -11], [3, -26], [-19, -52], [70, -36], [-35, -82], [-23, -90], [-19, -118], [-169, 19], [20, 160], [36, 92], [-62, 91], [-112, 181], [-114, 177], [-106, 179], [-107, 174], [-102, 167], [-108, 159], [-101, 192], [30, -29], [25, -33], [31, -36], [36, -25], [41, -38], [6, -55], [25, -79], [23, -87], [125, -54], [176, -4], [-164, 12], [-157, 19], [-7, 254], [-26, 58]]

const trees: Asset[] = [
	{
		img: 'egyt/tree/oaktree3',
		offset: [1, -1],
		size: [120, 132],
		area: [1, 1]
	},
	{
		img: 'egyt/tree/oaktree4',
		offset: [1, -1],
		size: [120, 132],
		area: [1, 1]
	}
	//'egyt/birchtree1',
	//'egyt/birchtree2',
	//'egyt/birchtree3',
]

const tillering = [
	'egyt/farm/wheat_i',
	'egyt/farm/wheat_i',
	'egyt/farm/wheat_il',
	'egyt/farm/wheat_il',
	'egyt/farm/wheat_il',
	'egyt/farm/wheat_ili',
]

const ripening = [
	'egyt/farm/wheat_il',
	'egyt/farm/wheat_ili',
	'egyt/farm/wheat_ili',
	'egyt/farm/wheat_ilil',
	'egyt/farm/wheat_ilil',
]

export class Tree extends Obj {

	static trees: Tree[] = []

	constructor() {
		super();
		this.rate = 10;
		Tree.trees.push(this);
	}
	finish() {
		const asset = {
			img: 'egyt/tree/oaktree3',
			size: [120, 132],
			area: [1, 1],
			offset: [1, -1],
		}
		this.rekt = new Rekt;
		this.rekt.obj = this;
		this.rekt.sst = LUMBER.sample(trees);
		this.rekt.tile = this.tile;
	}
}

/*
export class Tile extends Obj {
	asset: string = 'egyt/ground/stone1'
	constructor(asset) {
		super();
		//this.rtt = false;
	}
	finish() {
		this.rekt = new Rekt;
		this.rekt.obj = this;
		this.rekt.asset = this.asset;
		this.rekt.tile = this.tile;
		this.rekt.size = [24, 12];
	}
}
*/

/*
const wheat: Asset = {
	img
}

export class Wheat extends Obj {
	flick = false

	constructor(public growth: number) {
		super();
		this.rate = 2.0;
	}
	finish() {
		this.rekt = new Rekt;
		this.rekt.obj = this;
		this.rekt.asset =
		this.growth == 1 ? LUMBER.sample(tillering) :
		this.growth == 2 ? LUMBER.sample(ripening) :
		this.growth == 3 ? 'egyt/farm/wheat_ilili' : '';
		this.rekt.tile = this.tile;
		this.rekt.size = [22, 22];
	}
}
*/

/*
export class Wall extends Obj {
	asset: string = 'egyt/ground/stone1'
	constructor(asset) {
		super();
		//this.rtt = false;
	}
	finish() {
		this.rekt = new Rekt;
		this.rekt.obj = this;
		this.rekt.asset = this.asset;
		this.rekt.tile = this.tile;
		this.rekt.size = [24, 12];
	}
}
*/