require("dotenv").config();
const fs = require("fs");
const distinctColors = require("distinct-colors").default;
const chroma = require("chroma-js");
const file = fs.readFileSync("./honeypot.log", "utf8");
const IPInfowrap = require("node-ipinfo");
const IPinfo = new IPInfowrap(process.env.TOKEN);
const each = require("p-each-series");
/**
 * @param {string} line
 */
let r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; //http://www.regular-expressions.info/examples.html
let arr = [];

file.split("\n").forEach((line) => {
  if (line.includes("ACCEPT")) {
    let t = line.match(r);
    arr.push(t[0]);
  }
});

let uniqueArray = arr.filter(function (item, pos) {
  return arr.indexOf(item) == pos;
});

console.log(uniqueArray);
fs.writeFileSync("./IPs.json", JSON.stringify(uniqueArray), "utf8");
let IPobj = {};
async function doStuff() {
  await each(uniqueArray, async (ip) => {
    let result = await IPinfo.lookupIp(ip);
    IPobj[ip] = result;
  });
  fs.writeFileSync("./IPs.json", JSON.stringify(IPobj), "utf8");
  let countries = [];

  for (const ipo of Object.keys(IPobj)) {
    if (ipo) {
      const value = IPobj[ipo];
      countries.push(value.country);
    }
  }
  const colors = distinctColors({ count: countries.length });
  colors.forEach((color, i) => {
    colors[i] = color.hex();
  });
  fs.writeFileSync(
    "./countries.json",
    JSON.stringify({
      countries,
      colors,
    }),
    "utf8"
  );
}

doStuff();
