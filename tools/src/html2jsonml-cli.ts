#!/usr/bin/env node

import * as fs from "fs";
import { html2jsonml, jsonml2string } from "./html2jsonml";

const args = process.argv.slice(2);

switch (args.length) {
    case 1: {
        const html = fs.readFileSync(args[0], "utf8");
        const jsonml = html2jsonml(html);
        console.log(jsonml2string(jsonml));
        break;
    }
    case 2: {
        const html = fs.readFileSync(args[0], "utf8");
        const jsonml = html2jsonml(html);
        fs.writeFileSync(args[1], jsonml2string(jsonml));
        break;
    }
    default:
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const data = [] as any;
        process.stdin.on("data", chunk => {
            data.push(chunk);
        });
        process.stdin.on("end", () => {
            const html = data.join("");
            const jsonml = html2jsonml(html);
            console.log(jsonml2string(jsonml));
        });
}
