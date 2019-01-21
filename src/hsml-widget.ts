import { Hsml, Hsmls, HsmlAttrOnData } from "./hsml";
import { hsmls2idomPatch, Ctx } from "./hsml-idom";
import * as idom from "incremental-dom";

declare const process: any;

const __NODE = typeof process === "object" && process.versions && process.versions.node;

// let hsmls2idomPatch: (node: Element, hmls: Hsmls, ctx?: any) => void;
// let idom: any;
// declare const require: any;
// if (!__NODE) {
//     hsmls2idomPatch = require("./hsml-idom").hsmls2idomPatch;
//     idom = require("incremental-dom");
// }

export interface DomWidget {
    mount(e: Element): this;
    umount(): this;
    onMount?(): void;
    onUmount?(): void;
}

export abstract class Widget implements Ctx, DomWidget {

    private static __count = 0;

    readonly type: string = "Widget"; // this.constructor.name;
    readonly id: string = this.type + "-" + Widget.__count++;
    readonly dom: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched: number;

    constructor(type: string = "") {
        if (type) {
            this.type = type;
        }
    }

    abstract render(): Hsmls;

    onHsml(action: string, data: HsmlAttrOnData, e: Event) {
        console.log("on", action, data, e);
    }

    mount(e: Element = document.body): this {
        !e && console.warn("invalit element", e);
        if (!__NODE && e) {
            if ("widget" in e) {
                const w = (e as any).widget as Widget;
                w && w.umount();
            }
            if (!this.dom) {
                (this as any).dom = e;
                (e as any).widget = this;
                const hsmls = (this as any).render();
                hsmls2idomPatch(e, hsmls, this);
                e.setAttribute("widget", this.type);
                if ((this as any).onMount) {
                    (this as any).onMount();
                }
            }
        }
        return this;
    }

    umount(): this {
        if (!__NODE) {
            if (this.dom) {
                if ((this as any).onUmount) {
                    (this as any).onUmount();
                }
                if (this.dom.hasAttribute("widget")) {
                    this.dom.removeAttribute("widget");
                }
                const wNodes = this.dom.querySelectorAll("[widget]");
                for (let i = 0; i < wNodes.length; i++) {
                    const w = (wNodes[i] as any).widget as Widget;
                    w && w.umount();
                }
                while (this.dom.firstChild /*.hasChildNodes()*/) {
                    this.dom.removeChild(this.dom.firstChild);
                }
                (this.dom as any).widget = undefined;
                (this as any).dom = undefined;
            }
        }
        return this;
    }

    update(): this {
        if (!__NODE) {
            if (this.dom && !this._updateSched) {
                this._updateSched = setTimeout(() => {
                    if (this.dom) {
                        hsmls2idomPatch(this.dom, this.render(), this);
                    }
                    this._updateSched = null;
                }, 0);
            }
        }
        return this;
    }

    toHsml(): Hsml {
        if (this.dom) {
            if (this._updateSched) {
                clearTimeout(this._updateSched);
                this._updateSched = undefined;
            } else {
                return (
                    ["div",
                        {
                            _skip: true,
                            _id: this.id,
                            _key: this.id,
                            widget: this.type
                        }
                    ]
                );
            }
        }
        const hsmls = (this as any).render() as Hsmls;
        if (!__NODE) {
            hsmls.push(
                (e: Element) => {
                    if (!this.dom) {
                        (this as any).dom = e;
                        (e as any).widget = this;
                        if ((this as any).onMount) {
                            (this as any).onMount();
                        }
                    }
                });
        }
        return (
            ["div",
                {
                    _id: this.id,
                    _key: this.id,
                    widget: this.type
                },
                hsmls
            ]
        );
    }

}

if (!__NODE) {
    (idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
        nodes.forEach(node => {
            if (node.nodeType === 1 && "widget" in node) {
                const w = (node as any).widget as Widget;
                w && w.umount();
            }
        });
    };
}
