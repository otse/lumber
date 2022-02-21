var lumber = (function (THREE) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var THREE__default = /*#__PURE__*/_interopDefaultLegacy(THREE);

    const fragmentPost = `
// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	gl_FragColor = clr;
}`;
    const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
    // three quarter
    var Renderer;
    (function (Renderer) {
        Renderer.delta = 0;
        //export var ambientLight: AmbientLight
        //export var directionalLight: DirectionalLight
        function update() {
            Renderer.delta = Renderer.clock.getDelta();
            //filmic.composer.render();
        }
        Renderer.update = update;
        var reset = 0;
        var frames = 0;
        // https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
        function calc() {
            const s = Date.now() / 1000;
            frames++;
            if (s - reset >= 1) {
                reset = s;
                Renderer.fps = frames;
                frames = 0;
            }
            Renderer.memory = window.performance.memory;
        }
        Renderer.calc = calc;
        function render() {
            calc();
            Renderer.renderer.setRenderTarget(Renderer.target);
            Renderer.renderer.clear();
            Renderer.renderer.render(Renderer.scene, Renderer.camera);
            Renderer.renderer.setRenderTarget(null); // Naar scherm
            Renderer.renderer.clear();
            Renderer.renderer.render(Renderer.scene2, Renderer.camera);
        }
        Renderer.render = render;
        function init() {
            console.log('ThreeQuarter Init');
            Renderer.clock = new THREE.Clock();
            Renderer.scene = new THREE.Scene();
            Renderer.scene.background = new THREE.Color('#292929');
            Renderer.scene2 = new THREE.Scene();
            Renderer.rttscene = new THREE.Scene();
            Renderer.ndpi = window.devicePixelRatio;
            console.log(`window innerWidth, innerHeight ${window.innerWidth} x ${window.innerHeight}`);
            if (Renderer.ndpi > 1) {
                console.warn('Dpi i> 1. Game may scale.');
            }
            Renderer.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE__default['default'].NearestFilter,
                magFilter: THREE__default['default'].NearestFilter,
                format: THREE__default['default'].RGBFormat
            });
            Renderer.renderer = new THREE.WebGLRenderer({ antialias: false });
            Renderer.renderer.setPixelRatio(Renderer.ndpi);
            Renderer.renderer.setSize(100, 100);
            Renderer.renderer.autoClear = true;
            Renderer.renderer.setClearColor(0xffffff, 0);
            document.body.appendChild(Renderer.renderer.domElement);
            window.addEventListener('resize', onWindowResize, false);
            Renderer.materialPost = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: Renderer.target.texture } },
                vertexShader: vertexScreen,
                fragmentShader: fragmentPost,
                depthWrite: false
            });
            onWindowResize();
            Renderer.quadPost = new THREE.Mesh(Renderer.plane, Renderer.materialPost);
            Renderer.quadPost.position.z = -100;
            //quadPost.position.x = (-(w2 - w)) / 2;
            //quadPost.position.y = (h2 - h) / 2;
            console.log('neg -(w2 - w)', Renderer.quadPost.position.x);
            Renderer.scene2.add(Renderer.quadPost);
            window.Renderer = Renderer;
        }
        Renderer.init = init;
        function onWindowResize() {
            Renderer.w = window.innerWidth;
            Renderer.h = window.innerHeight;
            Renderer.w2 = Renderer.w * Renderer.ndpi;
            Renderer.h2 = Renderer.h * Renderer.ndpi;
            Renderer.w3 = Renderer.w2 - (Renderer.w2 - Renderer.w);
            Renderer.h3 = Renderer.h2 - (Renderer.h2 - Renderer.h);
            if (Renderer.w2 % 2 != 0) {
                Renderer.w2 -= 1;
            }
            if (Renderer.h2 % 2 != 0) {
                Renderer.h2 -= 1;
            }
            Renderer.target.setSize(Renderer.w2, Renderer.h2);
            Renderer.plane = new THREE.PlaneBufferGeometry(Renderer.w2, Renderer.h2);
            if (Renderer.quadPost)
                Renderer.quadPost.geometry = Renderer.plane;
            Renderer.camera = ortographiccamera(Renderer.w2, Renderer.h2);
            Renderer.camera.updateProjectionMatrix();
            Renderer.renderer.setSize(Renderer.w, Renderer.h);
            //renderer.domElement.width = renderer.domElement.clientWidth;// * ndpi;
            //renderer.domElement.height = renderer.domElement.clientHeight;// * ndpi;
        }
        let mem = [];
        function loadtexture(file, key, cb) {
            if (mem[key || file])
                return mem[key || file];
            let texture = new THREE.TextureLoader().load(file + `?v=${App$1.salt}`, cb);
            texture.magFilter = THREE__default['default'].NearestFilter;
            texture.minFilter = THREE__default['default'].NearestFilter;
            mem[key || file] = texture;
            return texture;
        }
        Renderer.loadtexture = loadtexture;
        function rendertarget(w, h) {
            const o = {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            };
            let target = new THREE.WebGLRenderTarget(w, h, o);
            return target;
        }
        Renderer.rendertarget = rendertarget;
        function ortographiccamera(w, h) {
            let camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -100, 100);
            camera.updateProjectionMatrix();
            return camera;
        }
        Renderer.ortographiccamera = ortographiccamera;
        function erase_children(group) {
            while (group.children.length > 0)
                group.remove(group.children[0]);
        }
        Renderer.erase_children = erase_children;
    })(Renderer || (Renderer = {}));
    var Renderer$1 = Renderer;

    class pts {
        static pt(a) {
            return { x: a[0], y: a[1] };
        }
        static clone(zx) {
            return [zx[0], zx[1]];
        }
        static make(n, m) {
            return [n, m];
        }
        static area_every(bb, callback) {
            let y = bb.min[1];
            for (; y <= bb.max[1]; y++) {
                let x = bb.max[0];
                for (; x >= bb.min[0]; x--) {
                    callback([x, y]);
                }
            }
        }
        static project(a) {
            return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
        }
        static unproject(a) {
            return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
        }
        static to_string(a) {
            const pr = (b) => b != undefined ? `, ${b}` : '';
            return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
        }
        static equals(a, b) {
            return a[0] == b[0] && a[1] == b[1];
        }
        static floor(a) {
            return [Math.floor(a[0]), Math.floor(a[1])];
        }
        static ceil(a) {
            return [Math.ceil(a[0]), Math.ceil(a[1])];
        }
        static inv(a) {
            return [-a[0], -a[1]];
        }
        static mult(a, n, m) {
            return [a[0] * n, a[1] * (m || n)];
        }
        static divide(a, n, m) {
            return [a[0] / n, a[1] / (m || n)];
        }
        static subtract(a, b) {
            return [a[0] - b[0], a[1] - b[1]];
        }
        static add(a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        }
        static abs(a) {
            return [Math.abs(a[0]), Math.abs(a[1])];
        }
        static min(a, b) {
            return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
        }
        static max(a, b) {
            return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
        }
        static together(zx) {
            return zx[0] + zx[1];
        }
    }

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));
    class aabb2 {
        constructor(a, b) {
            this.min = this.max = [...a];
            if (b) {
                this.extend(b);
            }
        }
        static dupe(bb) {
            return new aabb2(bb.min, bb.max);
        }
        extend(v) {
            this.min = pts.min(this.min, v);
            this.max = pts.max(this.max, v);
        }
        diagonal() {
            return pts.subtract(this.max, this.min);
        }
        center() {
            return pts.add(this.min, pts.mult(this.diagonal(), 0.5));
        }
        translate(v) {
            this.min = pts.add(this.min, v);
            this.max = pts.add(this.max, v);
        }
        test(b) {
            if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
                this.max[1] < b.min[1] || this.min[1] > b.max[1])
                return 0;
            if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
                this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
                return 1;
            return 2;
        }
    }
    aabb2.TEST = TEST;

    class Rekt {
        constructor() {
            this.tile = [0, 0];
            this.opacity = 1;
            this.center = [0, 0];
            this.position = [0, 0, 0];
            //low = false
            this.used = false;
            this.flick = false;
            this.plain = false;
            Rekt.num++;
        }
        unset() {
            Rekt.num--;
            this.unuse();
        }
        paint_alternate() {
            var _a;
            if (!LUMBER$1.PAINT_OBJ_TICK_RATE)
                return;
            if (!this.used)
                return;
            this.flick = !this.flick;
            this.material.color.set(new THREE.Color(this.flick ? 'red' : 'blue'));
            if ((_a = this.obj) === null || _a === void 0 ? void 0 : _a.chunk)
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
            this.geometry = new THREE.PlaneBufferGeometry(this.sst.size[0], this.sst.size[1], 2, 2);
            let map;
            if (this.sst)
                map = Renderer$1.loadtexture(`assets/${this.sst.img}.png`);
            this.material = new THREE.MeshBasicMaterial({
                map: map,
                transparent: true,
                opacity: this.opacity,
                color: 0xffffff
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
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
            var _a, _b;
            let c;
            if (c = (_a = this.obj) === null || _a === void 0 ? void 0 : _a.chunk)
                if (((_b = this.obj) === null || _b === void 0 ? void 0 : _b.rtt) && LUMBER$1.USE_CHUNK_RT)
                    return c.grouprt;
                else
                    return c.group;
            else
                return Renderer$1.scene;
        }
        update() {
            var _a, _b, _c;
            let x, y;
            let xy = pts.add(this.tile, this.sst.offset || [0, 0]);
            //let squared = this.size[0] / 2 / Lumber.HALVE;
            //console.log('squared',squared);
            if (this.plain) {
                x = xy[0];
                y = xy[1];
            }
            else {
                xy = pts.mult(xy, LUMBER$1.EVEN);
                if (LUMBER$1.OFFSET_CHUNK_OBJ_REKT && ((_a = this.obj) === null || _a === void 0 ? void 0 : _a.chunk))
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
                this.material.color = new THREE.Color(((_c = (_b = this.obj) === null || _b === void 0 ? void 0 : _b.chunk) === null || _c === void 0 ? void 0 : _c.childobjscolor) || this.color || 0xffffff);
            }
        }
        set_depth() {
            var _a;
            let depth = ((_a = this.obj) === null || _a === void 0 ? void 0 : _a.weight.order) || Rekt.ptdepth(this.tile);
            if (this.mesh)
                this.mesh.renderOrder = depth;
        }
    }
    (function (Rekt) {
        Rekt.num = 0;
        Rekt.active = 0;
        //export type Struct = Rekt['struct']
        function ptdepth(t) {
            return -t[1] + t[0];
        }
        Rekt.ptdepth = ptdepth;
    })(Rekt || (Rekt = {}));
    var Rekt$1 = Rekt;

    class Weight {
        constructor(obj) {
            this.obj = obj;
            this.order = 0;
            this.childs = [];
            this.parents = [];
        }
        array(b) {
            return b ? this.childs : this.parents;
        }
        add(obj, b) {
            if (-1 == this.array(b).indexOf(obj))
                this.array(b).push(obj);
        }
        remove(obj, b) {
            let i = this.array(b).indexOf(obj);
            if (i != -1)
                this.array(b).splice(i, 1);
        }
        clear() {
            for (let b of [true, false]) {
                for (let obj of this.array(b))
                    obj.weight.remove(this.obj, !b);
                this.array(b).length = 0;
            }
        }
        range(b, max, seed = 0) {
            let res = this.order;
            if (this.array(b).length == 0)
                return res;
            res = this.array(b)[0].weight.order;
            for (let obj of this.array(b))
                res = (!max ? Math.min : Math.max)(res, obj.weight.order);
            return res + seed;
        }
        weigh() {
            var _a;
            this.order = this.obj.depth;
            if (!this.childs.length && this.parents.length)
                this.order = this.range(false, false, -20);
            else if (this.childs.length && !this.parents.length)
                this.order = this.range(true, true, 20);
            else if (this.childs.length && this.parents.length) {
                let min = this.range(false, false, 0);
                let max = this.range(true, true, 0);
                this.order = (min - max) / 2 + max;
            }
            (_a = this.obj.rekt) === null || _a === void 0 ? void 0 : _a.update();
        }
    }
    class Obj {
        constructor() {
            this.name = 'An Obj';
            this.depth = 0;
            this.rate = 1;
            this.rtt = true;
            this.tile = [0, 0];
            this.rekt = null;
            this.chunk = null;
            Obj.num++;
            this.weight = new Weight(this);
        }
        comes() {
            var _a;
            Obj.active++;
            this.update_manual();
            (_a = this.rekt) === null || _a === void 0 ? void 0 : _a.use();
        }
        goes() {
            var _a;
            Obj.active--;
            (_a = this.rekt) === null || _a === void 0 ? void 0 : _a.unuse();
            this.weight.clear();
        }
        unset() {
            var _a;
            Obj.num--;
            this.goes();
            (_a = this.rekt) === null || _a === void 0 ? void 0 : _a.unset();
        }
        finish() {
            if (!this.asset)
                console.warn('obj no asset');
            this.update_manual();
        }
        set_area() {
            let pt = pts.pt(pts.subtract(this.asset.area || [1, 1], [1, 1]));
            this.bound = new aabb2([-pt.x, 0], [0, pt.y]);
            this.bound.translate(this.tile);
        }
        update_tick() {
            var _a;
            if (LUMBER$1.PAINT_OBJ_TICK_RATE)
                (_a = this.rekt) === null || _a === void 0 ? void 0 : _a.paint_alternate();
        }
        update_manual() {
            var _a;
            this.set_area();
            this.fit_area();
            (_a = this.rekt) === null || _a === void 0 ? void 0 : _a.update();
        }
        fit_area() {
            var _a, _b;
            this.depth = Rekt$1.ptdepth(this.tile);
            this.weight.clear();
            if (!this.bound || !this.rekt)
                return;
            const around = [
                [-1, 1], [0, 1], [1, 1],
                [-1, 0], [0, 0], [1, 0],
                [-1, -1], [0, -1], [1, -1]
            ];
            let big = LUMBER$1.wlrd.fg.big(this.tile);
            for (const a of around) {
                let p = pts.add(big, a);
                //console.log('p', pts.to_string(p));
                let c = LUMBER$1.wlrd.fg.at(p[0], p[1]);
                if (!c)
                    continue;
                for (const t of c.objs.tuple.tuple) {
                    const obj = t[0];
                    if (obj == this || !((_a = this.rekt) === null || _a === void 0 ? void 0 : _a.bound) || !((_b = obj.rekt) === null || _b === void 0 ? void 0 : _b.bound))
                        continue;
                    // image clip
                    if (!this.rekt.bound.test(obj.rekt.bound)) {
                        //this.rekt.color = 'white';
                        continue;
                    }
                    //this.rekt.color = 'pink';
                    const a = this.bound;
                    const b = obj.bound;
                    const test = this.bound.test(obj.bound);
                    //this.rekt.color = ['white', 'red', 'cyan'][test];
                    // nwnw test
                    if (test)
                        ;
                    else if ( // behind aka n w nw
                    a.min[0] <= b.max[0] && a.max[0] >= b.min[0] && a.min[1] > b.max[1] ||
                        a.max[0] < b.min[0] && a.max[1] >= b.min[1] && a.min[1] <= b.max[1] ||
                        a.min[0] < b.min[0] && a.max[1] > b.max[1]) {
                        //this.rekt.color = 'purple';
                        obj.weight.add(this, true);
                        this.weight.add(obj, false);
                    }
                    else if ( // diagonal dont care
                    a.max[0] < b.min[0] && a.max[1] < b.min[1] ||
                        a.min[0] > b.max[0] && a.min[1] > b.max[1]) ;
                    else {
                        //this.rekt.color = 'salmon';
                        this.weight.add(obj, true);
                        obj.weight.add(this, false);
                    }
                }
            }
            this.weight.weigh();
            this.rekt.update();
        }
    }
    (function (Obj) {
        Obj.active = 0;
        Obj.num = 0;
        //export type Struct = Obj['struct']
    })(Obj || (Obj = {}));
    var Obj$1 = Obj;
    /*
                        let obscured = false;
                        // n ne e se s sw w nw
                        if (this.bound.test(obj.bound)) {
                            this.rekt.color = 'red';
                        }
                        else if (a.min[0] < b.max[0] && a.max[0] > b.min[0] && a.min[1] >= b.max[1]) // n
                        {
                            obscured = true;
                            //this.rekt.color = 'blue';
                        }
                        else if (a.min[0] >= b.max[0] && a.min[1] >= b.max[1]) // ne
                        {
                            obscured = false;
                            //this.rekt.color = 'purple';
                        }
                        else if (a.min[0] >= b.max[0] && a.max[1] > b.min[1]) // e
                        {
                            obscured = false;
                            //this.rekt.color = 'cyan';
                        }
                        else if (a.min[0] >= b.max[0] && a.max[1] <= b.min[1]) // se
                        {
                            obscured = false;
                            //this.rekt.color = 'salmon';
                        }
                        else if (a.max[0] > b.min[0] && a.max[1] <= b.min[1]) // s
                        {
                            obscured = false;
                            //this.rekt.color = 'pink';
                        }
                        else if (a.max[0] <= b.min[0] && a.max[1] <= b.min[1]) // sw
                        {
                            obscured = false;
                            //this.rekt.color = 'orange';
                        }
                        else if (a.max[0] <= b.min[0] && a.min[1] < b.max[1]) // w
                        {
                            obscured = true;
                            //this.rekt.color = 'yellow';
                        }
                        else if (a.max[0] <= b.min[0] && a.min[1] >= b.min[1]) // nw
                        {
                            obscured = true;
                            //this.rekt.color = 'gold';
                        }
                        else {
                            //this.rekt.color = 'white';
                        }
                        if (obscured) {
                            this.depth = obj.depth - 1;
                        }
                        else {
                            this.depth = obj.depth + 1;
                        }
                        */

    const count = (c, prop) => {
        let num = 0;
        for (let t of c.objs.tuple.tuple)
            if (t[0][prop])
                num++;
        return num;
    };
    class Chunk {
        constructor(x, y, master) {
            this.master = master;
            this.on = false;
            this.changed = true;
            this.rektcolor = 'white';
            this.master.total++;
            this.objs = new Objs(this);
            //this.childobjscolor = Lumber.sample(colors);
            this.p = [x, y];
            this.p2 = [x + 1, y];
            this.group = new THREE.Group;
            this.grouprt = new THREE.Group;
            this.set_bounds();
        }
        anchor() {
        }
        set_bounds() {
            const pt = pts.pt(this.p);
            let p3 = pts.clone(this.p);
            this.basest_tile = pts.mult(this.p2, this.master.span * LUMBER$1.EVEN);
            this.north = pts.mult(p3, this.master.span * LUMBER$1.EVEN);
            this.order_tile = this.north;
            this.rekt_offset = pts.clone(this.basest_tile);
            if (LUMBER$1.OFFSET_CHUNK_OBJ_REKT) {
                const zx = pts.project(this.basest_tile);
                const zxc = [...zx, 0];
                this.group.position.fromArray(zxc);
                this.grouprt.position.fromArray(zxc);
                const depth = Rekt$1.ptdepth(this.order_tile);
                this.group.renderOrder = depth;
                this.grouprt.renderOrder = depth;
            }
            // note: non screen bound not used anymore
            this.dimetricBoundCurrentlyNotUsed = new aabb2([pt.x * this.master.span, pt.y * this.master.span], [(pt.x + 1) * this.master.span, (pt.y + 1) * this.master.span]);
            this.screen = Chunk.Sscreen(pt.x, pt.y, this.master);
        }
        empty() {
            return this.objs.tuple.tuple.length < 1;
        }
        comes() {
            if (this.on || this.empty())
                return;
            this.objs.comes();
            Renderer$1.scene.add(this.group, this.grouprt);
            this.comes_pt2();
            this.on = true;
            return true;
        }
        comes_pt2() {
            if (!LUMBER$1.USE_CHUNK_RT)
                return;
            if (LUMBER$1.MINIMUM_REKTS_BEFORE_RT <= count(this, 'rtt'))
                return;
            if (!this.rt)
                this.rt = new RtChunk(this);
            this.rt.comes();
            this.rt.render();
        }
        goes() {
            var _a;
            if (!this.on)
                return;
            Renderer$1.scene.remove(this.group, this.grouprt);
            Renderer$1.erase_children(this.group);
            Renderer$1.erase_children(this.grouprt);
            this.objs.goes();
            (_a = this.rt) === null || _a === void 0 ? void 0 : _a.goes();
            this.on = false;
        }
        oob() {
            return LUMBER$1.wlrd.view.test(this.screen) == aabb2.TEST.Outside;
        }
        update() {
            var _a;
            this.objs.updates();
            if (LUMBER$1.USE_CHUNK_RT && this.changed)
                (_a = this.rt) === null || _a === void 0 ? void 0 : _a.render();
            this.changed = false;
        }
    }
    (function (Chunk) {
        function Sscreen(x, y, master) {
            let basest_tile = pts.mult([x + 1, y], master.span * LUMBER$1.EVEN);
            let real = pts.subtract(pts.project(basest_tile), [0, -master.height / 2]);
            return new aabb2(pts.add(real, [-master.width / 2, -master.height / 2]), pts.add(real, [master.width / 2, master.height / 2]));
        }
        Chunk.Sscreen = Sscreen;
    })(Chunk || (Chunk = {}));
    class Tuple {
        constructor(key = 0) {
            this.key = key;
            this.tuple = [];
        }
        search(k = this.key, v) {
            let i = this.tuple.length;
            while (i--)
                if (this.tuple[i][k] == v)
                    return i;
        }
        add(t, k = this.key) {
            let i = this.search(k, t[k]);
            if (i == undefined) {
                this.tuple.push(t);
                return true;
            }
            return false;
        }
        remove(v, k = this.key) {
            let i = this.search(k, v);
            if (i != undefined) {
                this.tuple.splice(i, 1);
                return true;
            }
            return false;
        }
    }
    class Objs {
        constructor(chunk) {
            this.chunk = chunk;
            this.rtts = 0;
            this.tuple = new Tuple;
        }
        rate(obj) {
            return this.tuple.tuple.length * obj.rate;
        }
        add(obj) {
            return this.tuple.add([obj, this.rate(obj)]);
        }
        get(tile) {
            for (let t of this.tuple.tuple)
                if (pts.equals(t[0].tile, tile))
                    return t[0];
        }
        remove(obj) {
            return this.tuple.remove(obj);
        }
        updates() {
            for (let t of this.tuple.tuple) {
                let rate = t[1]--;
                if (rate <= 0) {
                    t[0].update_tick();
                    t[1] = this.rate(t[0]);
                }
            }
        }
        comes() {
            for (let t of this.tuple.tuple)
                t[0].comes();
        }
        goes() {
            for (let t of this.tuple.tuple)
                t[0].goes();
        }
    }
    class ChunkMaster {
        constructor(testType, span) {
            this.testType = testType;
            this.total = 0;
            this.arrays = [];
            this.refit = true;
            this.span = span;
            this.span2 = span * span;
            this.width = span * LUMBER$1.EVEN;
            this.height = span * LUMBER$1.EVEN / 2;
            this.fitter = new Tailorer(this);
        }
        update() {
            if (this.refit)
                this.fitter.update();
        }
        big(zx) {
            return pts.floor(pts.divide(zx, this.span));
        }
        at(x, y) {
            if (this.arrays[y] == undefined)
                this.arrays[y] = [];
            return this.arrays[y][x];
        }
        atmake(x, y) {
            return this.at(x, y) || this.make(x, y);
        }
        at_tile(t) {
            let b = this.big(t);
            let c = this.atmake(b[0], b[1]);
            return c;
        }
        make(x, y) {
            let c = this.at(x, y);
            if (c)
                return c;
            c = this.arrays[y][x] = new this.testType(x, y, this);
            return c;
        }
    }
    class Tailorer {
        constructor(master) {
            this.master = master;
            this.shown = [];
            this.colors = [];
        }
        off() {
            let i = this.shown.length;
            while (i--) {
                let c;
                c = this.shown[i];
                c.update();
                if (c.oob()) {
                    c.goes();
                    this.shown.splice(i, 1);
                }
            }
        }
        update() {
            let middle = World$1.unproject(LUMBER$1.wlrd.view.center()).tiled;
            let b = this.master.big(middle);
            this.lines = this.total = 0;
            this.off();
            this.slither(b, Tailorer.forward);
            this.slither(b, Tailorer.reverse);
        }
        slither(b, n) {
            let x = b[0], y = b[1];
            let i = 0, j = 0, s = 0, u = 0;
            while (true) {
                i++;
                let c;
                c = this.master.atmake(x, y);
                if (!c.on && c.oob()) {
                    if (s > 2) {
                        if (j == 0) {
                            j = 1;
                        }
                        if (j == 2) {
                            j = 3;
                        }
                    }
                    u++;
                }
                else {
                    u = 0;
                    if (c.comes()) {
                        this.shown.push(c);
                    }
                }
                if (j == 0) {
                    y += n;
                    s++;
                }
                else if (j == 1) {
                    x -= n;
                    j = 2;
                    s = 0;
                }
                else if (j == 2) {
                    y -= n;
                    s++;
                }
                else if (j == 3) {
                    x -= n;
                    j = 0;
                    s = 0;
                }
                if (!s) {
                    this.lines++;
                }
                this.total++;
                if (u > 5 || i >= 350) {
                    break;
                }
            }
        }
    }
    Tailorer.forward = 1;
    Tailorer.reverse = -1;
    class RtChunk {
        constructor(chunk) {
            this.chunk = chunk;
            this.padding = LUMBER$1.EVEN * 4;
            this.offset = [0, 0];
            // todo, width height
            this.width = this.chunk.master.width + this.padding;
            this.height = this.chunk.master.height + this.padding;
            this.camera = Renderer$1.ortographiccamera(this.width, this.height);
            // todo, pts.make(blah)
            let t = pts.mult(this.chunk.p2, this.chunk.master.span);
            const img = {
                img: 'egyt/tenbyten',
                size: [this.width, this.height]
            };
            this.rekt = new Rekt$1;
            this.rekt.tile = t;
            this.rekt.sst = img;
        }
        // todo pool the rts?
        comes() {
            this.rekt.use();
            this.rekt.mesh.renderOrder = Rekt$1.ptdepth(this.chunk.order_tile);
            this.target = Renderer$1.rendertarget(this.width, this.height);
        }
        goes() {
            this.rekt.unuse();
            this.target.dispose();
        }
        render() {
            while (Renderer$1.rttscene.children.length > 0)
                Renderer$1.rttscene.remove(Renderer$1.rttscene.children[0]);
            const group = this.chunk.grouprt;
            group.position.set(0, -this.height / 2, 0);
            Renderer$1.rttscene.add(group);
            Renderer$1.renderer.setRenderTarget(this.target);
            Renderer$1.renderer.clear();
            Renderer$1.renderer.render(Renderer$1.rttscene, this.camera);
            this.rekt.material.map = this.target.texture;
        }
    }

    class Man extends Obj$1 {
        constructor() {
            super();
        }
        man_produce() {
            return;
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
            };
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

    class World {
        constructor() {
            this.pos = [0, 0];
            this.scale = 1;
            this.dpi = 1;
            this.mtil = [0, 0];
            this.wheelable = true;
            this.init();
            this.view = new aabb2([0, 0], [0, 0]);
            const frustum = {
                img: 'egyt/128',
                size: [1, 1],
                area: [1, 1],
                offset: [0, 0]
            };
            {
                this.frustum = new Rekt$1;
                this.frustum.name = 'Frustum';
                this.frustum.sst = frustum;
                this.frustum.plain = true;
                this.frustum.use();
                this.frustum.mesh.renderOrder = 9999999;
                this.frustum.material.wireframe = true;
            }
            console.log('world');
        }
        static rig() {
            return new World;
        }
        add(obj) {
            let c = this.fg.at_tile(obj.tile);
            if (c.objs.add(obj)) {
                obj.chunk = c;
                obj.chunk.changed = true;
                if (c.on)
                    obj.comes();
            }
        }
        remove(obj) {
            var _a;
            if ((_a = obj.chunk) === null || _a === void 0 ? void 0 : _a.objs.remove(obj)) {
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
            let m = [App$1.pos.x, App$1.pos.y];
            m[1] = -m[1];
            m = pts.divide(m, LUMBER$1.wlrd.scale);
            let p = [LUMBER$1.wlrd.view.min[0], LUMBER$1.wlrd.view.max[1]];
            p = pts.add(p, m);
            const unprojected = World.unproject(p);
            this.mtil = unprojected.tiled;
            this.mtil = pts.floor(this.mtil); // fix for ndpi? no
        }
        init() {
            this.fg = new ChunkMaster(Chunk, 20);
            this.bg = new ChunkMaster(Chunk, 20);
            LUMBER$1.ply = new Ply;
            LUMBER$1.ply.tile = [0, 0];
            LUMBER$1.ply.finish();
            LUMBER$1.ply.comes();
            this.preloads();
            //this.populate();
        }
        preloads() {
            let textures = 0;
            let loaded = 0;
            function callback() {
                if (++loaded >= textures)
                    LUMBER$1.resourced('POPULAR_ASSETS');
            }
            function preload_textures(strs) {
                textures = strs.length;
                for (let str of strs)
                    Renderer$1.loadtexture(str, undefined, callback);
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
            if (App$1.keys['x'])
                speed *= 10;
            if (App$1.keys['w'])
                p[1] -= speed;
            if (App$1.keys['s'])
                p[1] += speed;
            if (App$1.keys['a'])
                p[0] += speed;
            if (App$1.keys['d'])
                p[0] -= speed;
            this.pos = [...p];
            if (this.wheelable && App$1.wheel > 0) {
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
            else if (this.wheelable && App$1.wheel < 0) {
                this.scale -= factor;
                if (this.scale < .5 / this.dpi)
                    this.scale = .5 / this.dpi;
                //console.log('scale down', this.scale);
            }
            Renderer$1.scene.scale.set(this.scale, this.scale, 1);
            let p2 = pts.mult(this.pos, this.scale);
            Renderer$1.scene.position.set(p2[0], p2[1], 0);
            let w = Renderer$1.w; // tq.target.width;
            let h = Renderer$1.h; // tq.target.height;
            //console.log(`tq target ${w} x ${h}`)
            let w2 = w / this.dpi / this.scale;
            let h2 = h / this.dpi / this.scale;
            this.view = new aabb2([-p[0] - w2 / 2, -p[1] - h2 / 2], [-p[0] + w2 / 2, -p[1] + h2 / 2]);
            this.view.min = pts.floor(this.view.min);
            this.view.max = pts.floor(this.view.max);
            this.focal = [-p[0], -p[1], 0];
            //return;
            {
                this.frustum.mesh.scale.set(w2, h2, 1);
                this.frustum.tile = pts.divide(this.focal, LUMBER$1.EVEN);
                this.frustum.update();
            }
        }
        populate() {
        }
    }
    (function (World) {
        function unproject(query) {
            let p = query;
            let un = pts.unproject(p);
            let p2;
            p2 = pts.divide(un, 24);
            p2 = pts.floor(p2);
            p2[0] += 1; // necessary
            let p3 = pts.mult(p2, 24);
            return { untiled: un, tiled: p2, mult: p3 };
        }
        World.unproject = unproject;
    })(World || (World = {}));
    var World$1 = World;

    var Board;
    (function (Board) {
        var body;
        function collapse() {
        }
        Board.collapse = collapse;
        Board.collapsed = {};
        function rig_charges(nyan) {
            /*
                A hyperlink and a paragraph form a collapser
            */
            const _collapse = (jay) => {
                Board.collapsed[jay.text()] = !!jay.hasClass('toggle');
            };
            nyan.find('a').next('div').addClass('bar').prev().addClass('foo').click(function () {
                let jay = $(this);
                jay.toggleClass("toggle").next('.bar').toggleClass('toggle');
                _collapse(jay);
            }).append('<span>');
            nyan.find('a.foo').each((i, e) => {
                let jay = $(e);
                window.afoo = jay;
                if (jay.attr('collapse') == "") {
                    jay.addClass('toggle').next().addClass('toggle');
                    _collapse(jay);
                }
            });
            /*
                A div with two spans is an rpg item.
            */
            nyan.find('div').children().find('span').next('span').parent().addClass('rpgitem');
        }
        Board.rig_charges = rig_charges;
        function messageslide(title, message) {
            let jay = $('<div>').addClass('messageslide').append(`<span>${title}`).append(`<span>${message}`);
            Board.win.append(jay);
        }
        Board.messageslide = messageslide;
        function init() {
            window.Chains = Board;
            body = $('body');
            Board.win = $('#win');
        }
        Board.init = init;
        function update() {
            if (Board.collapsed.Stats) {
                Board.win.find('#fpsStat').text(`Fps: ${parseInt(Renderer$1.fps)}`);
                //Board.win.find('#memoryStat').text(`Memory: ${(tq.memory.usedJSHeapSize / 1048576).toFixed(4)} / ${tq.memory.jsHeapSizeLimit / 1048576}`);
                Board.win.find('#gameZoom').html(`Scale: <span>${LUMBER$1.wlrd.scale} / ndpi ${LUMBER$1.wlrd.dpi} / ${window.devicePixelRatio}`);
                Board.win.find('#gameAabb').html(`View bounding volume: <span>${LUMBER$1.wlrd.view.min[0]}, ${LUMBER$1.wlrd.view.min[1]} x ${LUMBER$1.wlrd.view.max[0]}, ${LUMBER$1.wlrd.view.max[1]}`);
                //Board.win.find('#gamePos').text(`View pos: ${points.string(Egyt.game.pos)}`);
                Board.win.find('#numChunks').text(`Num chunks: ${LUMBER$1.wlrd.fg.fitter.shown.length} / ${LUMBER$1.wlrd.fg.total}`);
                Board.win.find('#numObjs').html(`Num objs: ${Obj$1.active} / ${Obj$1.num}`);
                Board.win.find('#numRekts').html(`Num rekts: ${Rekt$1.active} / ${Rekt$1.num}`);
                let b = LUMBER$1.wlrd.fg.big(LUMBER$1.wlrd.mtil);
                let c = LUMBER$1.wlrd.fg.at(b[0], b[1]);
                Board.win.find('#square').text(`Mouse: ${pts.to_string(LUMBER$1.wlrd.mtil)}`);
                Board.win.find('#squareChunk').text(`Mouse chunk: ${pts.to_string(b)}`);
                Board.win.find('#squareChunkRt').text(`Mouse chunk rt: ${(c === null || c === void 0 ? void 0 : c.rt) ? 'true' : 'false'}`);
                Board.win.find('#snakeTurns').text(`CSnake turns: ${LUMBER$1.wlrd.fg.fitter.lines}`);
                Board.win.find('#snakeTotal').text(`CSnake total: ${LUMBER$1.wlrd.fg.fitter.total}`);
            }
        }
        Board.update = update;
        function raw(html) {
            let nyan = $('<nyan>');
            let jay = $(html);
            nyan.append(jay);
            rig_charges(nyan);
            Board.win.append(jay);
            return nyan;
        }
        Board.raw = raw;
    })(Board || (Board = {}));

    class Building extends Obj$1 {
        constructor(pst) {
            super();
            this.pst = pst;
            this.rtt = false;
            this.name = 'Hovel ' + Building.lastName++;
        }
        finish() {
            //console.log('asset',this.pst.asset);
            this.asset = this.pst.asset;
            this.rekt = new Rekt$1;
            this.rekt.obj = this;
            this.rekt.tile = this.tile;
            this.rekt.sst = this.pst.asset;
            super.finish();
        }
    }
    Building.lastName = 1;
    (function (Building) {
        Building.TwoTwo = {
            asset: {
                img: 'twotwo',
                size: [48, 24],
                area: [2, 2],
            }
        };
        Building.ThreeThree = {
            asset: {
                img: 'threethree',
                size: [72, 36],
                area: [3, 3],
            }
        };
        Building.SandHovel1 = {
            asset: {
                img: 'balmora/hovel1',
                size: [192, 149],
                area: [6, 8],
            }
        };
        Building.SandHovel2 = {
            asset: {
                img: 'balmora/hovel2',
                size: [168, 143],
                area: [5, 7],
            }
        };
        Building.SandAlleyGate = {
            asset: {
                img: 'balmora/alleygate',
                size: [144, 96],
                area: [1, 4],
            }
        };
        Building.Stairs2 = {
            asset: {
                img: 'balmora/stairs2',
                size: [120, 72],
                area: [4, 2],
            }
        };
        Building.Stairs3 = {
            asset: {
                img: 'balmora/stairs3',
                size: [120, 72],
                area: [4, 3],
            }
        };
        Building.Platform22 = {
            asset: {
                img: 'balmora/platform22',
                size: [48, 52],
                area: [2, 2],
            }
        };
        Building.Platform23 = {
            asset: {
                img: 'balmora/platform23',
                size: [72, 65],
                area: [3, 3],
            }
        };
    })(Building || (Building = {}));
    var Building$1 = Building;

    var Ploppables;
    (function (Ploppables) {
        Ploppables.types = [
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
        ];
        Ploppables.index = 0;
        Ploppables.ghost = null;
        function update() {
            let remake = false;
            let obj = null;
            if (Ploppables.ghost) {
                if (App$1.wheel < 0 && Ploppables.index + 1 < Ploppables.types.length) {
                    Ploppables.index++;
                    remake = true;
                }
                else if (App$1.wheel > 0 && Ploppables.index - 1 >= 0) {
                    Ploppables.index--;
                    remake = true;
                }
            }
            const shortcuts = {
                'y': 'twotwo',
                'b': 'sandhovel1',
                'p': 'platform22',
                't': 'tree'
            };
            for (const s in shortcuts) {
                if (App$1.keys[s] == 1) {
                    Ploppables.index = Ploppables.types.indexOf(shortcuts[s]);
                    remake = true;
                    break;
                }
            }
            if (remake) {
                LUMBER$1.wlrd.wheelable = false;
                obj = factory(Ploppables.types[Ploppables.index]);
                obj.finish();
                obj.comes();
                Ploppables.ghost === null || Ploppables.ghost === void 0 ? void 0 : Ploppables.ghost.unset();
                Ploppables.ghost = obj;
            }
            if (Ploppables.ghost) {
                let changed = !pts.equals(LUMBER$1.wlrd.mtil, Ploppables.ghost.tile);
                Ploppables.ghost.tile = LUMBER$1.wlrd.mtil;
                if (Ploppables.ghost.rekt)
                    Ploppables.ghost.rekt.tile = Ploppables.ghost.tile;
                if (changed)
                    Ploppables.ghost.update_manual();
                Ploppables.ghost.update_tick();
            }
            if (Ploppables.ghost && App$1.buttons[0]) {
                LUMBER$1.wlrd.wheelable = true;
                console.log('plop');
                Ploppables.ghost.goes();
                LUMBER$1.wlrd.add(Ploppables.ghost);
                Ploppables.ghost.update_manual();
                Ploppables.ghost = null;
            }
            if (Ploppables.ghost && App$1.keys['escape'] == 1) {
                LUMBER$1.wlrd.wheelable = true;
                console.log('unplop');
                Ploppables.ghost.unset();
                Ploppables.ghost = null;
            }
            if (App$1.keys['x'] == 1) {
                let ct = LUMBER$1.wlrd.fg.big(LUMBER$1.wlrd.mtil);
                let c = LUMBER$1.wlrd.fg.at(ct[0], ct[1]);
                if (c) {
                    let obj = c.objs.get(LUMBER$1.wlrd.mtil);
                    if (obj) {
                        LUMBER$1.wlrd.remove(obj);
                        obj.unset();
                    }
                    else
                        console.log('no obj there at', pts.to_string(LUMBER$1.wlrd.mtil));
                }
            }
        }
        Ploppables.update = update;
        function factory(type) {
            if (type == 'twotwo')
                return new Building$1(Building$1.TwoTwo);
            else if (type == 'threethree')
                return new Building$1(Building$1.ThreeThree);
            else if (type == 'sandhovel1')
                return new Building$1(Building$1.SandHovel1);
            else if (type == 'sandhovel2')
                return new Building$1(Building$1.SandHovel2);
            else if (type == 'sandalleygate')
                return new Building$1(Building$1.SandAlleyGate);
            else if (type == 'stairs2')
                return new Building$1(Building$1.Stairs2);
            else if (type == 'stairs3')
                return new Building$1(Building$1.Stairs3);
            else if (type == 'platform22')
                return new Building$1(Building$1.Platform22);
            else if (type == 'platform23')
                return new Building$1(Building$1.Platform23);
            else if (type == 'tree')
                return new Tree();
            else
                return new Obj$1;
        }
        Ploppables.factory = factory;
    })(Ploppables || (Ploppables = {}));
    const trees = [
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
    ];
    class Tree extends Obj$1 {
        constructor() {
            super();
            this.rate = 10;
            Tree.trees.push(this);
        }
        finish() {
            this.rekt = new Rekt$1;
            this.rekt.obj = this;
            this.rekt.sst = LUMBER$1.sample(trees);
            this.rekt.tile = this.tile;
        }
    }
    Tree.trees = [];
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

    var LUMBER;
    (function (LUMBER) {
        LUMBER.USE_CHUNK_RT = false;
        LUMBER.OFFSET_CHUNK_OBJ_REKT = false;
        LUMBER.PAINT_OBJ_TICK_RATE = false;
        LUMBER.MINIMUM_REKTS_BEFORE_RT = 0;
        LUMBER.EVEN = 24; // very evenly divisible
        LUMBER.HALVE = LUMBER.EVEN / 2;
        LUMBER.YUM = LUMBER.EVEN;
        var started = false;
        function sample(a) {
            return a[Math.floor(Math.random() * a.length)];
        }
        LUMBER.sample = sample;
        function clamp(val, min, max) {
            return val > max ? max : val < min ? min : val;
        }
        LUMBER.clamp = clamp;
        let RESOURCES;
        (function (RESOURCES) {
            RESOURCES[RESOURCES["RC_UNDEFINED"] = 0] = "RC_UNDEFINED";
            RESOURCES[RESOURCES["POPULAR_ASSETS"] = 1] = "POPULAR_ASSETS";
            RESOURCES[RESOURCES["READY"] = 2] = "READY";
            RESOURCES[RESOURCES["COUNT"] = 3] = "COUNT";
        })(RESOURCES = LUMBER.RESOURCES || (LUMBER.RESOURCES = {}));
        let resources_loaded = 0b0;
        function resourced(word) {
            resources_loaded |= 0b1 << RESOURCES[word];
            try_start();
        }
        LUMBER.resourced = resourced;
        function try_start() {
            let count = 0;
            let i = 0;
            for (; i < RESOURCES.COUNT; i++)
                (resources_loaded & 0b1 << i) ? count++ : void (0);
            if (count == RESOURCES.COUNT)
                start();
        }
        function critical(mask) {
            // Couldn't load
            console.error('resource', mask);
        }
        LUMBER.critical = critical;
        function init() {
            console.log('egyt init');
            LUMBER.wlrd = World$1.rig();
            resourced('RC_UNDEFINED');
            resourced('READY');
            window['Lumber'] = LUMBER;
        }
        LUMBER.init = init;
        function start() {
            if (started)
                return;
            console.log('lumber starting');
            if (window.location.href.indexOf("#nochunkrt") != -1)
                LUMBER.USE_CHUNK_RT = false;
            LUMBER.wlrd.populate();
            Board.init();
            Board.raw(`
		<!-- <div>May have to reload for latest version<br/> -->
		<br />
		<div class="region small">
			<a>Tutorial</a>
			<div>
				Move the view with <key>W</key> <key>A</key> <key>S</key> <key>D</key>.
				Hold <key>X</key> to go faster. Scrollwheel to zoom. 
			</div>

			<a>World editing</a>
			<div>
				Very simple. Once you got an object following the curor, you can use scrollwheel to change it.
				<br/><br/>
				<key>b</key> structure<br/>
				<key>t</key> tree<br/>
				<key>y</key> tile<br/>
				<key>u</key> tile area<br/>
				<key>x</key> delete<br/>
				<key>esc</key> cancel<br/>
			</div>

			<a>Settings</a>
			<div>
				Nothing here yet
			</div>

			<a collapse>Stats</a>
			<div class="stats">
				<span id="fpsStat">xx</span><br/>
				<!-- <span id="memoryStat">xx</span><br/> -->
				<br/>
				<span id="gameZoom"></span><br/>
				<span id="gameAabb"></span><br/>
				<br/>
				<span id="numChunks"></span><br/>
				<span id="numObjs"></span><br/>
				<span id="numRekts"></span><br/>
				<br/>
				<span id="square"></span><br/>
				<span id="squareChunk"></span><br/>
				<span id="squareChunkRt">xx</span><br/>
				<br />
				<span id="snakeTurns"></span><br/>
				<span id="snakeTotal"></span><br/>
				<br/>
				<span id="USE_CHUNK_RTT">USE_CHUNK_RTT: ${LUMBER.USE_CHUNK_RT}</span><br/>
				<span id="OFFSET_CHUNK_OBJ_REKT">OFFSET_CHUNK_OBJ_REKT: ${LUMBER.OFFSET_CHUNK_OBJ_REKT}</span><br/>
				<span id="PAINT_OBJ_TICK_RATE">PAINT_OBJ_TICK_RATE: ${LUMBER.PAINT_OBJ_TICK_RATE}</span><br/>
				<span id="PAINT_OBJ_TICK_RATE">MINIMUM_REKTS_BEFORE_RT: ${LUMBER.MINIMUM_REKTS_BEFORE_RT}</span><br/>
			</div>`);
            //setTimeout(() => Board.messageslide('', 'You get one cheap set of shoes, and a well-kept shovel.'), 1000);
            started = true;
        }
        function update() {
            if (!started)
                return;
            LUMBER.wlrd.update();
            Board.update();
            Ploppables.update();
        }
        LUMBER.update = update;
    })(LUMBER || (LUMBER = {}));
    var LUMBER$1 = LUMBER;

    var App;
    (function (App) {
        let KEY;
        (function (KEY) {
            KEY[KEY["Off"] = 0] = "Off";
            KEY[KEY["Press"] = 1] = "Press";
            KEY[KEY["Wait"] = 2] = "Wait";
            KEY[KEY["Again"] = 3] = "Again";
            KEY[KEY["Up"] = 4] = "Up";
        })(KEY = App.KEY || (App.KEY = {}));
        App.keys = {};
        App.buttons = {};
        App.pos = { x: 0, y: 0 };
        App.salt = 'x';
        App.wheel = 0;
        function onkeys(event) {
            const key = event.key.toLowerCase();
            if ('keydown' == event.type)
                App.keys[key] = App.keys[key] ? KEY.Again : KEY.Press;
            else if ('keyup' == event.type)
                App.keys[key] = KEY.Up;
            if (event.keyCode == 114)
                event.preventDefault();
            return;
        }
        App.onkeys = onkeys;
        function boot(a) {
            App.salt = a;
            function onmousemove(e) { App.pos.x = e.clientX; App.pos.y = e.clientY; }
            function onmousedown(e) { App.buttons[e.button] = 1; }
            function onmouseup(e) { App.buttons[e.button] = 0; }
            function onwheel(e) { App.wheel = e.deltaY < 0 ? 1 : -1; }
            document.onkeydown = document.onkeyup = onkeys;
            document.onmousemove = onmousemove;
            document.onmousedown = onmousedown;
            document.onmouseup = onmouseup;
            document.onwheel = onwheel;
            Renderer$1.init();
            LUMBER$1.init();
            loop();
        }
        App.boot = boot;
        function delay() {
            for (let i in App.keys) {
                if (KEY.Press == App.keys[i])
                    App.keys[i] = KEY.Wait;
                else if (KEY.Up == App.keys[i])
                    App.keys[i] = KEY.Off;
            }
        }
        App.delay = delay;
        function loop(timestamp) {
            requestAnimationFrame(loop);
            Renderer$1.update();
            LUMBER$1.update();
            Renderer$1.render();
            App.wheel = 0;
            delay();
        }
        App.loop = loop;
    })(App || (App = {}));
    window['App'] = App;
    var App$1 = App;

    return App$1;

}(THREE));
