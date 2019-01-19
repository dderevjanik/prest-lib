
export class Events<C = any> {

    private _ctx: C;
    private _cbs: { [e: string]: Array<(data: any, ctx: C, e: string) => void> };
    private _cb: Array<(data: any, ctx: C, e: string) => void>;

    constructor(ctx?: C) {
        this._cbs = {};
        this._ctx = ctx;
    }

    emit(e: string, data?: any): this {
        if (e in this._cbs) {
            for (let i = 0, l = this._cbs[e].length; i < l; i++) {
                this._cbs[e][i](data, this._ctx, e);
            }
        }
        if (this._cb) {
            for (let i = 0, l = this._cb.length; i < l; i++) {
                this._cb[i](data, this._ctx, e);
            }
        }
        return this;
    }

    on(ev: string | string[], cb: (data: any, ctx: C, e: string) => void): this {
        if (ev.constructor === String) {
            const e = ev as string;
            if (!(e in this._cbs)) {
                this._cbs[e] = [];
            }
            if (this._cbs[e].indexOf(cb) === -1) {
                this._cbs[e].push(cb);
            }
        } else {
            (ev as string[]).forEach(e => this.on(e, cb));
        }
        return this;
    }

    any(cb: (data: any, ctx: C, e: string) => void): this {
        if (!this._cb) {
            this._cb = [];
        }
        this._cb.push(cb);
        return this;
    }

    once(ev: string | string[], cb: (data: any, ctx: C, e: string) => void): this {
        if (ev.constructor === String) {
            const e = ev as string;
            const wrap = (d: any, c: C, evt: string) => {
                this.off(e, wrap);
                cb(d, c, evt);
            };
            this.on(ev, wrap);
        } else {
            (ev as string[]).forEach(e => this.once(e, cb));
        }
        return this;
    }

    off(e?: string, cb?: (data: any, ctx: C, e: string) => void): this {
        if (!e) {
            if (cb) {
                this._cb.splice(this._cbs[e].indexOf(cb), 1);
            } else {
                this._cb.length = 0;
                delete this._cb;
            }
        }
        if (e in this._cbs) {
            if (cb) {
                this._cbs[e].splice(this._cbs[e].indexOf(cb), 1);
            } else {
                this._cbs[e].length = 0;
                delete this._cbs[e];
            }
        }
        return this;
    }

    many(...cbs: { [e: string]: (data: any, ctx: C, e: string) => void }[]): this {
        cbs.forEach(cb =>
            Object.keys(cb).forEach(e =>
                this.on(e, cb[e])));
        return this;
    }

}


// const e = new Events<number>(3);

// e.any((data, ctx, e) => console.log("any:", data, ctx, e));

// e.emit("e", "eee1");
// e.on("e", (data, ctx, e) => console.log(data, ctx, e));
// e.emit("e", "eee2");
// e.off("e");
// e.emit("e", "eee3");

// e.off();

// e.emit("o", "ooo1");
// e.once("o", (data, ctx, e) => console.log(data, ctx, e));
// e.emit("o", "ooo2");
// e.emit("o", "ooo3");

// e.on(["e1", "e3"], (data, ctx, e) => console.log(data, ctx, e));
// e.emit("e1", "all e1");
// e.emit("e2", "all e2");
// e.emit("e3", "all e3");

// e.many(
//     {
//         ex1 : (data, ctx, e) => console.log("ex1-1:", data, ctx, e),
//         ex2 : (data, ctx, e) => console.log("ex2-1:", data, ctx, e)
//     },
//     {
//         ex1 : (data, ctx, e) => console.log("ex1-1:", data, ctx, e),
//         ex2 : (data, ctx, e) => console.log("ex2-2:", data, ctx, e)
//     }
// );
// e.emit("ex1", "ex1-data");
// e.emit("ex2", "ex2-data");
