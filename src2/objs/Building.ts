import LUMBER from "../Lumber";
import Obj from "../objrekt/Obj";
import Rekt from "../objrekt/Rekt";
import aabb2 from "../lib/aabb2";

interface Preset {
	asset: Asset
	weight?: number
};

class Building extends Obj {
	static lastName = 1
	constructor(private pst: Preset) {
		super();
		this.rtt = false;
		this.name = 'Hovel ' + Building.lastName++;
	}
	finish() {
		//console.log('asset',this.pst.asset);
		
		this.asset = this.pst.asset;
		this.rekt = new Rekt;
		this.rekt.obj = this;
		this.rekt.tile = this.tile;
		this.rekt.sst = this.pst.asset;
		super.finish();
	}
}

namespace Building {
	export var TwoTwo: Preset = {
		asset: {
			img: 'twotwo',
			size: [48, 24],
			area: [2, 2],
		}
	}

	export var ThreeThree: Preset = {
		asset: {
			img: 'threethree',
			size: [72, 36],
			area: [3, 3],
		}
	}

	export var SandHovel1: Preset = {
		asset: {
			img: 'balmora/hovel1',
			size: [192, 149],
			area: [6, 8],
		}
	}

	export var SandHovel2: Preset = {
		asset: {
			img: 'balmora/hovel2',
			size: [168, 143],
			area: [5, 7],
		}
	}

	export var SandAlleyGate: Preset = {
		asset: {
			img: 'balmora/alleygate',
			size: [144, 96],
			area: [1, 4],
		}
	}

	export var Stairs2: Preset = {
		asset: {
			img: 'balmora/stairs2',
			size: [120, 72],
			area: [4, 2],
		}
	}

	export var Stairs3: Preset = {
		asset: {
			img: 'balmora/stairs3',
			size: [120, 72],
			area: [4, 3],
		}
	}

	export var Platform22: Preset = {
		asset: {
			img: 'balmora/platform22',
			size: [48, 52],
			area: [2, 2],
		}
	}

	export var Platform23: Preset = {
		asset: {
			img: 'balmora/platform23',
			size: [72, 65],
			area: [3, 3],
		}
	}
}

export default Building;