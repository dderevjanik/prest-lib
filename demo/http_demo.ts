import { get } from "../src/http";

get("http_demo.json")
    .onProgress(progress => {
        console.log("progress: ", progress);
    })
    .onResponse(response => {
        console.log("response: " + response.getContentType(), response.getBody());
    })
    .onError(error => {
        console.log("response error: ", error);
    })
    .noCache()
    .send();

get("https://maps.googleapis.com/maps/api/geocode/json", {
        sensor: false,
        address: "Bratislava I",
        xxx: ["yyy", "zzz"]
    })
    // .timeout(10)
    .onProgress(progress => {
        console.log("response progress: ", progress);
    })
    .onResponse(response => {
        console.log("response: " + response.getContentType(), response.getJson());
    })
    .onError(error => {
        console.log("response error: ", error);
    })
    .noCache()
    // .headers({"Content-Type": "application/json"})
    // .send(data, "application/json");
    .send();

// dd if=/dev/urandom of=http_demp.bigfile bs=1M count=100
get("http_demp.bigfile")
    .onProgress(progress => {
        console.log("progress: ", progress);
    })
    .onResponse(response => {
        console.log("response: " + response.getContentType(), response);
    })
    .onError(error => {
        console.log("response error: ", error);
    })
    .noCache()
    .send();
