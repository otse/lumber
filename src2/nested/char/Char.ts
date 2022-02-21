import Obj from "../../objrekt/Obj";
import Rekt from "../../objrekt/Rekt";


class Man extends Obj {

	rekt: Rekt

	constructor() {
		super();
	}

	man_produce() {
		return;
		//this.rekt = new Rekt;
		//this.rekt.tile = this.tile;
		//this.rekt.size = [22, 25];
		//this.rekt.asset = 'egyt/pumpkin';

		this.rekt.use();

		this.rekt.mesh.renderOrder = 1;
	}

	deproduce() {

	}

	update_tick() {
		
	}
}

class Ply extends Man {
	
	constructor() {
		super();

		this.asset = {
			img: 'blah',
			size: [10, 10],
			area: [1, 1],
			offset: [0, 0]
		}
		this.depth = 9;
	}

	man_produce() {
		super.man_produce();
	}

	deproduce() {

	}

	update_tick() {

	}
}

export { Man, Ply }