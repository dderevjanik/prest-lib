import { Events } from "../main/events";

const e = new Events<string>("ctx");

e.any((data, ctx, e) => console.log("any:", data, ctx, e));

e.emit("e", "eee1");
e.on("e", (data, ctx, e) => console.log(data, ctx, e));
e.emit("e", "eee2");
e.off("e");
e.emit("e", "eee3");

e.off();

e.emit("o", "ooo1");
e.once("o", (data, ctx, e) => console.log(data, ctx, e));
e.emit("o", "ooo2");
e.emit("o", "ooo3");

e.on(["e1", "e3"], (data, ctx, e) => console.log(data, ctx, e));
e.emit("e1", "all e1");
e.emit("e2", "all e2");
e.emit("e3", "all e3");

e.many(
    {
        ex1 : (data, ctx, e) => console.log("ex1-1:", data, ctx, e),
        ex2 : (data, ctx, e) => console.log("ex2-1:", data, ctx, e)
    },
    {
        ex1 : (data, ctx, e) => console.log("ex1-1:", data, ctx, e),
        ex2 : (data, ctx, e) => console.log("ex2-2:", data, ctx, e)
    }
);
e.emit("ex1", "ex1-data");
e.emit("ex2", "ex2-data");
