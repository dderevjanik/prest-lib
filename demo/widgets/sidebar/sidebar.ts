import { Signal } from "../../../src/signal";
import { html, select, Widget } from "../../../src/dom";

export class Sidebar implements Widget {

    readonly name: string;

    private _element: HTMLElement;

    private _title: string;
    private _content: Widget;

    private cancelOnClickOut = false;
    private cancelOnEsc = false;

    sigOpen = new Signal<Sidebar>();
    sigClose = new Signal<Sidebar>();
    sigCancel = new Signal<Sidebar>();

    constructor(name: string = "") {
        this.name = name;
    }

    setTitle(title: string): Sidebar {
        this._title = title;
        if (this._element) {
            const e = select("h3", this._element) as HTMLHeadingElement;
            e.innerHTML = this._title || "";
        }
        return this;
    }

    getContent(): Widget {
        return this._content;
    }

    setContent(content: Widget): Sidebar {
        this._content = content;
        this._insertContent();
        return this;
    }

    setCancelOnClickOut(closeOnClickOut: boolean = true): Sidebar {
        this.cancelOnClickOut = closeOnClickOut;
        return this;
    }

    setCancelOnEsc(closeOnEsc: boolean = true): Sidebar {
        this.cancelOnEsc = closeOnEsc;
        return this;
    }

    onSigOpen(callback: (modalDialog: Sidebar) => void): Sidebar {
        this.sigOpen.connect(callback);
        return this;
    }

    onSigClose(callback: (modalDialog: Sidebar) => void): Sidebar {
        this.sigClose.connect(callback);
        return this;
    }

    onSigCancel(callback: (modalDialog: Sidebar) => void): Sidebar {
        this.sigCancel.connect(callback);
        return this;
    }

    open(): void {
        if (this._element) {
            this._element.style.display = "block";
            this._element.focus();
        }
        this.sigOpen.emit(this);
    }

    close(): void {
        if (this._element) {
            this._element.style.display = "none";
        }
        this.sigClose.emit(this);
    }

    cancel(): void {
        this.close();
        this.sigCancel.emit(this);
    }

    mount(element: HTMLElement): this {
        element.appendChild(this.element());
        return this;
    }

    umount(): this {
        this._element.parentElement.removeChild(this._element);
        return this;
    }

    element(): HTMLElement {
        if (!this._element) {
            const e = html(`
                    <div class="sidebar ${this.name}" style="display: none" tabindex="0">
                        <div class="sidebar-header">
                            <h2>${this._title || ""}</h2>
                            <span class="sidebar-cancel" tabindex="1">×</span>
                        </div>
                        <div class="sidebar-content"></div>
                    </div>`);
            this._element = e;
            const b = select(".sidebar-cancel", e);
            b.addEventListener("click", () => {
                this.close();
                this.sigCancel.emit(this);
            });
            this._element.addEventListener("click", (e) => {
                if (this.cancelOnClickOut && this._element === e.target) {
                    this.close();
                    this.sigCancel.emit(this);
                }
            });
            e.addEventListener("keyup", (e: KeyboardEvent) => {
                if (this.cancelOnEsc && e.key === "Escape") {
                    this.close();
                    this.sigCancel.emit(this);
                }
            });
            this._insertContent();
        }
        return this._element;
    }

    private _insertContent() {
        if (this._element) {
            const e = select(".sidebar-content", this._element) as HTMLDivElement;
            e.innerHTML = "";
            if (this._content) {
                this._content.mount(e);
            }
        }
    }

}
