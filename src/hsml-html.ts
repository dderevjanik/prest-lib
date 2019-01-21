import {
    hsml,
    Hsml,
    Hsmls,
    HsmlAttrs,
    HsmlFnc,
    HsmlObj,
    HsmlHandler
} from "./hsml";

export interface Ctx extends HsmlObj { }

class HsmlHtmlHandler implements HsmlHandler<Ctx> {

    private static _pairTags = [
        "script",
        "html", "head", "body", "title", "div",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "a", "pre", "blockquote", "i", "b", "em", "strong", "tt", "cite",
        "ol", "ul", "li", "dl", "dt", "dd", "table", "tr", "td",
        "textarea", "select", "option"];

    private _onHtml: (html: string) => void;
    private _pretty: boolean;
    private _indent: string;
    private _depth: number = 0;

    constructor(onHtml: (html: string) => void,
                pretty: boolean = false,
                indent: string = "    ") {
        this._onHtml = onHtml;
        this._pretty = pretty;
        this._indent = indent;
    }

    open(tag: string, attrs: HsmlAttrs, children: Hsmls, ctx?: Ctx): boolean {
        const props: any[] = [];
        let id: string = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let widget: any = attrs._widget;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
                    case "_widget":
                        break;
                    case "id":
                        id = attrs[a] as string;
                        break;
                    case "classes":
                        classes = classes.concat(attrs[a]
                            ? attrs[a]
                                .map<string>(c => c.constructor === String
                                    ? c as string
                                    : (c[1] ? c[0] as string : undefined))
                                .filter(c => c)
                            : []);
                    break;
                    case "class":
                        classes = classes.concat((attrs[a] as string).split(" "));
                        break;
                    case "data":
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                if (attrs[a][d].constructor === String) {
                                    props.push(["data-" + d, attrs[a][d]]);
                                } else {
                                    props.push(["data-" + d, JSON.stringify(attrs[a][d])]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        let style = "";
                        for (const d in attrs[a]) {
                            if (attrs[a].hasOwnProperty(d)) {
                                const dd = d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                                style += dd + ":" + attrs[a][d] + ";";
                            }
                        }
                        props.push(["style", style]);
                        break;
                    case "styles":
                        break;
                    case "on":
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            // ignore
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && props.push([a, ""]);
                        } else {
                            props.push([a, attrs[a]]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift(["class", classes.join(" ")]);
        }
        if (id) {
            props.unshift(["id", id]);
        }
        if (widget && "type" in widget) {
            props.unshift(["widget", widget.type]);
        }
        const args = props.map(p => `${p[0]}="${p[1]}"`).join(" ");
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
            this._depth++;
        }
        const pairTag = (children || HsmlHtmlHandler._pairTags.indexOf(tag) !== -1);
        html += "<" + tag + (args ? " " + args : "") + (pairTag ? ">" : "/>");
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
        if (widget && "render" in widget && widget.render.constructor === Function) {
            const hsmls = widget.render() as Hsmls;
            for (const jml of hsmls) {
                if (jml.constructor === String) {
                    this._onHtml(jml + (this._pretty ? "\n" : ""));
                } else if ("toHsml" in (jml as any)) {
                    const obj = jml as HsmlObj;
                    hsml(obj.toHsml(), this);
                } else {
                    hsml(jml as Hsml, this);
                }
            }
        }
        return false;
    }

    close(tag: string, children: Hsmls, ctx?: Ctx): void {
        let html = "";
        const pairTag = (children || HsmlHtmlHandler._pairTags.indexOf(tag) !== -1);
        if (this._pretty) {
            this._depth--;
            if (pairTag) {
                html += this._mkIndent(this._depth);
            }
        }
        if (pairTag) {
            html += "</" + tag + ">";
            if (this._pretty) {
                html += "\n";
            }
            this._onHtml(html);
        }
    }

    text(text: string, ctx?: Ctx): void {
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
        }
        html += text;
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
    }

    fnc(fnc: HsmlFnc, ctx?: Ctx): void {
    }

    obj(obj: HsmlObj, ctx?: Ctx): void {
        if ("toHsml" in obj) {
            hsml(obj.toHsml(), this, obj);
        } else {
            this.text("" + obj, ctx);
        }
    }

    private _mkIndent(count: number): string {
        let indent = "";
        for (let i = 0; i < count; i++) {
            indent += this._indent;
        }
        return indent;
    }

}

export function hsml2html(hsmlEl: Hsml, onHtml: (html: string) => void, pretty = false): void {
    const handler = new HsmlHtmlHandler(onHtml, pretty);
    hsml(hsmlEl, handler);
}

export function hsmls2html(hsmls: Hsmls, onHtml: (html: string) => void, pretty = false): void {
    for (const jml of hsmls) {
        if (jml.constructor === String) {
            onHtml(jml + (pretty ? "\n" : ""));
        } else if ("toHsml" in (jml as any)) {
            const obj = jml as HsmlObj;
            hsml2html(obj.toHsml(), onHtml, pretty);
        } else {
            hsml2html(jml as Hsml, onHtml, pretty);
        }
    }
}

export function hsml2htmls(hsml: Hsml, pretty = false): string[] {
    const htmls: string[] = [];
    hsml2html(hsml, html => htmls.push(html), pretty);
    return htmls;
}

export function hsmls2htmls(hsmls: Hsmls, pretty = false): string[] {
    const htmls: string[] = [];
    hsmls2html(hsmls, html => htmls.push(html), pretty);
    return htmls;
}

// Test

// const hsmls: Hsmls = [
//     "text",
//     ["tag", [
//         "d",
//         [""]
//     ]],
//     ["taga", { attr: "attr", classes: ["class"] }, [
//         "text",
//         123,
//         true
//     ]]
// ];

// const hml: Hsml = ["xxx", {}, [
//         "types", " ", 1235.456, " ", new Date(), " ",
//         ...hsmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]]
//     ]];

// console.log(hsmls, hml);

// const html = hsml2htmls(hml, true);
// console.log(html.join(""));
