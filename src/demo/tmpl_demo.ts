import { tmpla, tmplo, tmpl } from "../main/tmpl";

const dataArray = ["A", "B"];
console.log("tmpla: ${0} ${1} ${0}", "|", tmpla("tmpla: ${0} ${1} ${0}", dataArray));

const dataObject = { a: "A", b: "B" };

console.log("tmplo: ${a} ${b} ${a}", "|", tmplo("tmplo: ${a} ${b} ${a}", dataObject));

const template = tmpl<typeof dataObject>("tmpl : ${a} ${b} ${a}");
console.log("tmpl : ${a} ${b} ${a}", "|", template(dataObject));
console.log("tmpl : ", template);
