const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scriptMatch = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
assert(scriptMatch, "inline application script not found");

class FakeElement {
  constructor() {
    this.value = "";
    this.checked = true;
    this.hidden = false;
    this.dataset = {};
    this.style = {};
    this.textContent = "";
    this.innerHTML = "";
    this.className = "";
    this.classList = {
      add() {},
      remove() {},
      toggle() {}
    };
  }

  addEventListener() {}
  appendChild() {}
  setAttribute() {}
  removeAttribute() {}
  focus() {}
  reset() {}
  scrollIntoView() {}
}

const elements = new Map();
function getElement(selector) {
  if (!elements.has(selector)) elements.set(selector, new FakeElement());
  return elements.get(selector);
}

const document = {
  body: new FakeElement(),
  querySelector: getElement,
  querySelectorAll() {
    return [];
  },
  createElement() {
    return new FakeElement();
  }
};

const sandbox = {
  console,
  Date,
  JSON,
  Math,
  Array,
  String,
  Number,
  RegExp,
  Object,
  Set,
  Promise,
  document,
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  navigator: {
    userAgent: "",
    platform: "",
    maxTouchPoints: 0
  },
  setTimeout() { return 0; },
  clearTimeout() {},
  File: class File {},
  Blob: class Blob {},
  URL: {
    createObjectURL() { return ""; },
    revokeObjectURL() {}
  }
};
sandbox.window = sandbox;
sandbox.location = { protocol: "file:", href: "file:///test" };
sandbox.innerWidth = 1280;
sandbox.addEventListener = function () {};
sandbox.scrollTo = function () {};

const exportMarker = "      renderHistory();\n    }());";
assert(scriptMatch[1].includes(exportMarker), "application export marker not found");
const runnableScript = scriptMatch[1].replace(
  exportMarker,
  "      renderHistory();\n" +
    "      globalThis.__generatorTest = { generateRednote: generateRednote, applyPolish: applyPolish, dedupeGenerated: dedupeGenerated, buildPublishable: buildPublishable };\n" +
    "    }());"
);
vm.runInNewContext(runnableScript, sandbox, { filename: "index-inline.js" });

const generator = sandbox.__generatorTest;
assert(generator, "generator functions were not exposed to the smoke test");

const goals = ["干货教程", "经验分享", "避坑提醒", "产品种草", "使用测评", "商品介绍"];
for (const goal of goals) {
  const data = {
    mode: "rednote",
    category: "AI工具",
    topic: "用AI整理小红书文案",
    audience: "刚开始做小红书的新手",
    goal,
    points: [
      "先确定目标读者",
      "让AI先生成标题和结构",
      "加入自己的真实信息",
      "删除空话和夸张承诺"
    ],
    details: "整理包包含标题、开头、正文和结尾模板，可以继续编辑",
    cautions: "模板不能保证爆款，需要替换成自己的真实细节",
    tone: "真实自然",
    length: "standard",
    cta: "查看店铺商品",
    price: "19.9",
    condition: "",
    sellPrice: "",
    city: "",
    trade: "",
    naturalMode: true,
    safeMode: true,
    tags: ["AI工具", "AI写作", "内容创作", "自媒体新手"]
  };

  const result = generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
  const selectedTitle = result.primaryTitle;
  const publishable = generator.buildPublishable(result);

  assert(result.body.startsWith(selectedTitle), goal + " should start with a selected title");
  assert(result.body.includes(data.details), goal + " should contain real details");
  assert(result.body.includes(data.cautions), goal + " should contain cautions");
  assert(result.body.includes("19.9元"), goal + " should contain the supplied price");
  assert(result.extras.includes("#AI工具"), goal + " should include publish-ready tags");
  assert(publishable.includes(result.body), goal + " publishable copy should include the full body");
  assert((publishable.match(/#AI工具/g) || []).length === 1, goal + " should include each tag once");
  assert(result.body.length > 300, goal + " should produce a complete body, not an outline");
  assert(!result.body.includes("先看重点："), goal + " should not use the old outline output");
  assert(!result.body.includes("具体怎么处理："), goal + " should not use the old outline output");
  assert(!result.hooks.includes("方案"), goal + " should not label copy as plans");
  assert(!result.titles.includes(selectedTitle), goal + " should not repeat the selected title in alternatives");

  const blocks = [result.titles, result.hooks, result.extras, result.body, result.comment]
    .flatMap((value) => value.split(/\n{2,}|\n/).map((item) => item.trim()).filter(Boolean))
    .map((item) => item.toLowerCase().replace(/[0-9\s，。！？!?；;：:、,.#“”"'「」【】()[\]（）《》]/g, ""));
  assert.equal(new Set(blocks).size, blocks.length, goal + " should not repeat generated blocks");
}

assert(
  html.indexOf('id="body"') < html.indexOf('id="titles"'),
  "publish-ready body must appear before title alternatives"
);
assert(
  (html.match(/data-copy-body/g) || []).length >= 2,
  "desktop and mobile copy-body actions must exist"
);

const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
assert(
  serviceWorker.includes("rednote-copywriter-v5-20260713-full-note"),
  "service worker cache version was not updated"
);

console.log("Generator smoke test passed for", goals.length, "rednote goals.");
