///<reference path="../prest/prest.ts" />

import Signal = prest.signal.Signal;
import Hash = prest.hash.Hash;


//-----------------------------------------------------------------------------
// test signals

var s:Signal<string> = new Signal<string>();

var id:number = s.connect((data) => {
	console.log("data: " + data);
});
// ES5
//s.slot = (data) => {
//	console.log("slot data: " + data);
//};

s.emit("emittt");

s.disconnect(id);

s.emit("emittt");

console.log("-------------------------------------");


class A {
	private a = "A.a";

	public signal_num = new Signal<number>();
	public signal_str = new Signal<string>();

	public slot(data) {
		console.log("A.slot() data: '" + this.a + "' " + " " + data);
	}
}

class B {
	private a = "B.a";

	public slot = (data) => {
		console.log("B.slot() data: '" + this.a + "' " + " " + data);
	}
}

function slot(data) {
	console.log("slot() data: '" + this.a + "' " + " " + data);
}

var a = new A();

var b = new B();

a.signal_num.connect(a.slot);
a.signal_num.connect(a.slot, a);
a.signal_num.connect(a.slot, b);
a.signal_num.connect(b.slot);
a.signal_num.connect(b.slot, b);
a.signal_num.connect(b.slot, a);
a.signal_num.connect(slot);
a.signal_num.connect(slot, a);
a.signal_num.connect(slot, b);
a.signal_num.emit(5);

console.log("");

a.signal_str.connect(a.slot, a);
//a.signal_str.slot = slot; // ES5

a.signal_str.emit("str");


//-----------------------------------------------------------------------------
// test dom

console.log("DOM");

//prest.dom.signal_window_load.connect(main);
window.onload = main;

function main() {
	console.log("main()");

	var output = document.getElementById("output");
	output.innerHTML = "test";

	var hash:Hash<any> = new Hash<any>();
	hash.signal_change.connect((data) => {
		console.log('hash: ' + JSON.stringify(data));
		output.innerHTML += '<br/>' + 'hash: ' + JSON.stringify(data);
	});
	hash.emit_changes();
	hash.put_hash({aaa: 'aaa'});

	var h = document.getElementById("hash");
	h.onclick = (e:MouseEvent) => {
		hash.put_hash({aaa: new Date().getTime()});
	};
}
