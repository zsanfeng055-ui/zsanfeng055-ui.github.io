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
    this.placeholder = "";
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
    "      globalThis.__generatorTest = { generateRednote: generateRednote, applyPolish: applyPolish, dedupeGenerated: dedupeGenerated, buildPublishable: buildPublishable, validateRednoteFacts: validateRednoteFacts, generatedQualityIssues: generatedQualityIssues, categoryData: categoryData };\n" +
    "    }());"
);
vm.runInNewContext(runnableScript, sandbox, { filename: "index-inline.js" });

const generator = sandbox.__generatorTest;
assert(generator, "generator functions were not exposed to the smoke test");

const cases = {
  "AI工具": [
    "每天整理3篇口播稿，原来一篇需要40分钟",
    "导入逐字稿后先提炼观点，再人工调整标题",
    "现在一篇初稿约15分钟完成",
    "长文本偶尔漏信息，数据仍要人工核对"
  ],
  "职场": [
    "运营岗每周汇总5个项目的数据",
    "统一字段后再找负责人逐项确认",
    "整理时间从半天缩短到2小时",
    "业务口径临时变化时仍会返工"
  ],
  "学习": [
    "四级425分基础，目标两个月后过500",
    "连续6周每天背词30分钟并精听1篇",
    "第三次模考从438提高到492",
    "前两周任务太满，后来删掉两项"
  ],
  "美妆护肤": [
    "混油皮，鼻翼容易出油，脸颊偶尔泛红",
    "晚间隔天使用，连续用了3周",
    "成膜快，第2周起鼻翼出油少一些",
    "叠加防晒会搓泥，干皮可能觉得紧绷"
  ],
  "穿搭": [
    "158cm、52kg，肩宽且腰腹有肉",
    "18到24度通勤和周末逛街穿",
    "衬衫M码129元，半裙S码89元",
    "正面显腰线，但坐下时腰部略紧"
  ],
  "美食": [
    "鸡腿500g、生抽15ml、蜂蜜10g",
    "空气炸锅180度12分钟，翻面再8分钟",
    "鸡腿划两刀，腌30分钟后擦干水分",
    "外皮微脆，但蜂蜜放早了容易焦"
  ],
  "旅行": [
    "6月中旬去3天，两位成年人同行",
    "第一天古城、第二天环湖，高铁到站后租车",
    "人均1600元，热门景点排队约40分钟",
    "上午光线更好，但周末停车位很难找"
  ],
  "探店": [
    "杭州湖滨商圈，周六12点10分到店",
    "两人点3道菜，人均86元",
    "招牌鱼偏辣，出餐大约20分钟",
    "等位35分钟，附近停车12元一小时"
  ],
  "家居装修": [
    "89平两居，玄关改造预算3000元",
    "柜深35cm、宽120cm，使用多层板",
    "原来鞋子堆门口，现在能收纳约20双",
    "底部留空太低，扫地机器人进不去"
  ],
  "母婴育儿": [
    "宝宝10个月，最近吃辅食容易分心",
    "连续7天固定餐椅，每餐控制在20分钟内",
    "第4天开始能坐满15分钟，进食量略有增加",
    "这是个人观察，持续异常会咨询专业人员"
  ],
  "数码": [
    "256GB国行版本，使用当前正式版系统",
    "通勤听歌加拍照，连续使用14天",
    "亮屏6小时剩余22%，视频20分钟机身微热",
    "夜景涂抹明显，更适合在意续航的人"
  ],
  "生活经验": [
    "独居后第一次自己搬家，只有一个周末",
    "按房间装箱并给每个纸箱编号",
    "当天搬完，但找充电线花了半小时",
    "下次会把当天用品单独装，不适合物品特别多的人"
  ]
};

const goals = ["干货教程", "经验分享", "避坑提醒", "产品种草", "使用测评", "商品介绍"];
const bannedPhrases = [
  "把这一点写成",
  "先写清楚",
  "替换成自己的",
  "发布前",
  "读者才知道",
  "场景、动作、结果",
  "写作方案"
];

let caseIndex = 0;
for (const [category, facts] of Object.entries(cases)) {
  const profile = generator.categoryData[category];
  assert(profile, category + " profile should exist");
  const data = {
    mode: "rednote",
    category,
    topic: category + "真实测试",
    audience: profile.audience,
    goal: goals[caseIndex % goals.length],
    facts,
    factLabels: profile.fields.map((field) => field[0]),
    sectionLabels: profile.sections,
    points: ["第一项实际操作", "第二项实际观察"],
    details: "补充事实只在这次测试条件下成立",
    cautions: "不同条件下结果可能变化",
    tone: "真实自然",
    length: "standard",
    cta: "评论交流",
    price: "",
    naturalMode: true,
    safeMode: true,
    tags: profile.tags
  };

  assert.equal(generator.validateRednoteFacts(data).valid, true, category + " should pass fact validation");
  const result = generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
  const selectedTitle = result.primaryTitle;
  const publishable = generator.buildPublishable(result);

  assert(result.body.startsWith(selectedTitle), category + " should start with a selected title");
  facts.forEach((fact) => {
    assert(result.body.includes(fact), category + " should include every supplied fact: " + fact);
    assert.equal((result.body.match(new RegExp(fact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, category + " should use each fact once");
  });
  assert(result.body.includes(profile.sections[1]), category + " should use its category-specific section label");
  assert(result.body.includes(profile.fields[3][0]) || result.body.includes(profile.sections[3]), category + " should use its category-specific boundary label");
  assert(result.body.includes(data.details), category + " should include extra real details");
  assert(result.body.includes(data.cautions), category + " should include extra cautions");
  assert(result.extras.includes("#" + profile.tags[0]), category + " should include a category tag");
  assert(publishable.includes(result.body), category + " publishable copy should include the full body");
  assert(!result.body.includes("undefined"), category + " should never leak undefined values");
  assert.deepEqual(Array.from(generator.generatedQualityIssues(result, data)), [], category + " should pass the quality gate");
  bannedPhrases.forEach((phrase) => {
    assert(![result.body, result.titles, result.hooks, result.comment].join("\n").includes(phrase), category + " should not contain meta-writing phrase " + phrase);
  });

  const sentences = result.body.match(/[^。！？!?\n]+[。！？!?]/g) || [];
  const normalized = sentences.map((sentence) => sentence.replace(/[\s，。！？!?；;：:、,.]/g, ""));
  assert.equal(new Set(normalized).size, normalized.length, category + " should not repeat exact sentences");
  caseIndex += 1;
}

const invalidProfile = generator.categoryData["美妆护肤"];
const invalid = generator.validateRednoteFacts({
  facts: ["混合油皮", "用了3天", "", ""],
  factLabels: invalidProfile.fields.map((field) => field[0])
});
assert.equal(invalid.valid, false, "two facts should not pass validation");
assert(invalid.message.includes("还差1项真实素材"), "validation should explain exactly what is missing");

assert(html.includes("V6 分类型真实笔记"), "V6 branding should be visible");
assert((html.match(/data-category=/g) || []).length >= 13, "all major categories should be selectable");
assert(html.indexOf('id="body"') < html.indexOf('id="titles"'), "publish-ready body must appear before title alternatives");
assert((html.match(/data-copy-body/g) || []).length >= 2, "desktop and mobile copy-body actions must exist");

const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
assert(serviceWorker.includes("rednote-copywriter-v6-20260714-category-facts"), "service worker cache version was not updated");

console.log("Generator smoke test passed for", Object.keys(cases).length, "content categories.");
