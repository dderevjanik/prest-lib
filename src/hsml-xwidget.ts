import { Hsml, Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
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

export type Action = (action: string, data?: HsmlAttrOnData) => void;

export type XAction<S> = (widget: XWidget<S>, action: string, data?: HsmlAttrOnData) => void;

export type View<S> = (state: S, action: Action) => Hsmls;

const actionNode: Action = (action: string, data?: HsmlAttrOnData) => { };

export interface DomWidget {
    mount(e: Element): this;
    umount(): this;
    onHsml(action: string, data?: HsmlAttrOnData, e?: Event): void;
    onAction?(action: string, data?: HsmlAttrOnData): void;
    onMount?(): void;
    onUmount?(): void;
}

export abstract class XWidget<S> implements Ctx, DomWidget {

    private static __count = 0;

    static readonly mounted: { [wid: string]: XWidget<any> } = {};

    static onAction: XAction<any> = (w: XWidget<any>, action: string, data?: HsmlAttrOnData) => {
        console.log("action:", w, action, data);
    }

    static hsml<S, T extends XWidget<S> = XWidget<S>>(
            widgetClass: { new (...args: any[]): T; },
            state?: S): HsmlFnc | Hsmls {
        if (__NODE) {
            return widgetClass.prototype.view(state, actionNode);
        } else {
            return (e: Element) => {
                if ((e as any).widget) {
                    const w = (e as any).widget as XWidget<S>;
                    if (state !== undefined) {
                        w.state = state;
                    }
                    w.update();
                } else {
                    const w = new widgetClass();
                    if (state !== undefined) {
                        w.state = state;
                    }
                    w.mount(e);
                }
                return true;
            };
        }
    }

    readonly type: string = "YWidget"; // this.constructor.name;
    // readonly id: string = this.type + "-" + YWidget.__count++;
    readonly id: string = "w" + XWidget.__count++;
    readonly dom: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private __updateSched: number;

    abstract state: S;
    abstract view(state: S, action: Action): Hsmls;
    abstract onAction(action: string, data?: HsmlAttrOnData): void;
    // abstract onMount(): void;
    // abstract onUmount(): void;

    action(action: string, data?: HsmlAttrOnData): void {
        this.onAction(action, data);
    }

    actionGlobal(action: string, data?: HsmlAttrOnData): void {
        XWidget.onAction(this, action, data);
    }

    constructor(type?: string) {
        if (type) {
            this.type = type;
        }
    }

    render(): Hsmls {
        return this.view(this.state, this.action);
    }

    onHsml(action: string, data?: HsmlAttrOnData, e?: Event): void {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data;
        this.action(action, data);
    }

    mount(e: Element = document.body): this {
        !e && console.warn("invalit element", e);
        if (!__NODE && e) {
            if ("widget" in e) {
                const w = (e as any).widget as XWidget<S>;
                w && w.umount();
            }
            if (!this.dom) {
                XWidget.mounted[this.id] = this;
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
                delete XWidget.mounted[this.id];
                if ((this as any).onUmount) {
                    (this as any).onUmount();
                }
                if (this.dom.hasAttribute("widget")) {
                    this.dom.removeAttribute("widget");
                }
                const wNodes = this.dom.querySelectorAll("[widget]");
                for (let i = 0; i < wNodes.length; i++) {
                    const w = (wNodes[i] as any).widget as XWidget<S>;
                    w && w.umount();
                }
                while (this.dom.firstChild /*.hasChildNodes()*/) {
                    this.dom.removeChild(this.dom.firstChild);
                }
                delete (this.dom as any).widget;
                (this as any).dom = undefined;
            }
        }
        return this;
    }

    update(): this {
        if (!__NODE) {
            if (this.dom && !this.__updateSched) {
                this.__updateSched = setTimeout(() => {
                    if (this.dom) {
                        hsmls2idomPatch(this.dom, this.render(), this);
                    }
                    this.__updateSched = null;
                }, 0);
            }
        }
        return this;
    }

    toHsml(): Hsml {
        if (this.dom) {
            if (this.__updateSched) {
                clearTimeout(this.__updateSched);
                this.__updateSched = undefined;
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
                const w = (node as any).widget as XWidget<any>;
                w && w.umount();
            }
        });
    };
}
