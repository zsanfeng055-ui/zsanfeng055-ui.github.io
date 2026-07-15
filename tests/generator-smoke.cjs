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
    "      globalThis.__generatorTest = { generateRednote: generateRednote, generateXianyu: generateXianyu, applyPolish: applyPolish, dedupeGenerated: dedupeGenerated, buildAll: buildAll, buildPublishable: buildPublishable, validateRednoteFacts: validateRednoteFacts, generatedQualityIssues: generatedQualityIssues, categoryData: categoryData, collectionProfiles: collectionProfiles, state: state };\n" +
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
  "写作方案",
  "以下是",
  "先交代",
  "给大家一个身材参考"
];

function allGeneratedTitles(result) {
  return [result.primaryTitle].concat(result.titles.split("\n").map((line) => line.replace(/^\d+\.\s*/, ""))).filter(Boolean);
}

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
  const coverLines = result.cover.split("\n");
  assert.equal(coverLines.length, 2, category + " should provide a two-line cover copy");
  assert(coverLines.every((line) => line.length <= 17), category + " cover lines should stay short enough for a cover");
  assert(/[｜：，？]/.test(selectedTitle), category + " selected title should have a readable title rhythm");
  assert(allGeneratedTitles(result).every((title) => title.length <= 20), category + " titles should fit the 20-character publishing limit");
  assert(!result.body.includes("关于" + data.topic + "，结果和中间的细节都值得记一下"), category + " should not use the old report-like opening");
  assert(result.body.includes(data.details), category + " should include extra real details");
  assert(result.body.includes(data.cautions), category + " should include extra cautions");
  assert(result.extras.includes("#" + profile.tags[0]), category + " should include a category tag");
  assert(publishable.includes(result.body), category + " publishable copy should include the full body");
  assert(!result.body.includes("undefined"), category + " should never leak undefined values");
  assert(!result.body.split(/\n{2,}/)[0].includes(","), category + " should place only one title in the first paragraph");
  assert(result.body.split(/\n{2,}/).length >= 6, category + " should produce readable short paragraphs");
  assert(result.titles.split("\n").length >= 3, category + " should keep title alternatives on separate lines");
  assert.deepEqual(Array.from(generator.generatedQualityIssues(result, data)), [], category + " should pass the quality gate");
  assert(generator.buildAll(result).includes(result.cover), category + " full export should include cover copy");
  bannedPhrases.forEach((phrase) => {
    assert(![result.cover, result.body, result.titles, result.hooks, result.comment].join("\n").includes(phrase), category + " should not contain stiff or meta-writing phrase " + phrase);
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

const narrativeProfile = generator.categoryData["AI工具"];
const narrativeData = {
  mode: "rednote",
  category: "AI工具",
  topic: "用AI整理口播稿",
  audience: narrativeProfile.audience,
  goal: "经验分享",
  facts: cases["AI工具"],
  factLabels: narrativeProfile.fields.map((field) => field[0]),
  sectionLabels: narrativeProfile.sections,
  points: [],
  details: "",
  cautions: "",
  tone: "真实自然",
  cta: "评论交流",
  price: "",
  naturalMode: true,
  safeMode: true,
  tags: narrativeProfile.tags
};

function generateNarrative(length, generation = 6) {
  generator.state.generation = generation;
  const data = { ...narrativeData, length };
  return generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
}

const narrativeByLength = {
  short: generateNarrative("short"),
  standard: generateNarrative("standard"),
  detailed: generateNarrative("detailed")
};
assert(narrativeByLength.short.body.length < narrativeByLength.standard.body.length, "standard narrative should be longer than short");
assert(narrativeByLength.standard.body.length < narrativeByLength.detailed.body.length, "detailed narrative should be longer than standard");
for (const result of Object.values(narrativeByLength)) {
  narrativeData.facts.forEach((fact) => assert(result.body.includes(fact), "every narrative length should retain all supplied facts"));
  assert.equal(result.cover.split("\n").length, 2, "every narrative length should retain two cover lines");
}
assert(/AI最适合|真正省时间/.test(narrativeByLength.detailed.body), "detailed narrative should add an author-style reflection");
const narrativeVersions = [1, 2, 3, 4].map((generation) => generateNarrative("standard", generation));
assert.equal(new Set(narrativeVersions.map((result) => result.body)).size, narrativeVersions.length, "change-version should produce distinct narrative bodies");
assert.equal(new Set(narrativeVersions.map((result) => result.primaryTitle)).size, narrativeVersions.length, "change-version should rotate narrative titles");
assert(new Set(narrativeVersions.map((result) => result.cover)).size >= 3, "change-version should rotate cover copy");
assert(narrativeVersions.every((result) => allGeneratedTitles(result).every((title) => title.length <= 20)), "all narrative versions should keep titles within 20 characters");

const collectionFacts = [
  "牛乳雾面白、海盐冰蓝、桃粉微珠光、月光贝母、碎钻猫眼、莓果酒红、奶油小花、粉紫晕染、水果涂鸦、银色镜面、苔绿撞色、极细几何",
  "清透氛围感、高级气质款、甜美元素、个性酷飒风",
  "夏日通勤、约会出游、日常拍照、想显白又不张扬的时候",
  "轻盈、有画面，不要厚重堆钻和影楼感"
];
const collectionData = {
  mode: "rednote",
  category: "美妆护肤",
  topic: "夏日显白美甲灵感",
  audience: "想做通勤、约会都耐看的夏日美甲的人",
  goal: "灵感合集",
  facts: collectionFacts,
  factLabels: ["想包含的元素或选项", "想分成的风格方向", "适用场景或人群", "整体感觉或避开项"],
  sectionLabels: ["元素", "风格方向", "适用场景", "整体偏好"],
  points: [],
  details: "",
  cautions: "",
  tone: "真实自然",
  cta: "评论交流",
  price: "",
  naturalMode: true,
  safeMode: true,
  tags: generator.categoryData["美妆护肤"].tags
};

assert.equal(generator.validateRednoteFacts(collectionData).valid, true, "collection should require its first three material fields");
assert.equal(generator.validateRednoteFacts({ ...collectionData, facts: [collectionFacts[0], "", collectionFacts[2], ""] }).valid, false, "collection should reject a missing style field");

function generateCollection(length, generation) {
  generator.state.generation = generation;
  const data = { ...collectionData, length };
  return generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
}

const collectionByLength = {
  short: generateCollection("short", 1),
  standard: generateCollection("standard", 1),
  detailed: generateCollection("detailed", 1)
};
assert.equal((collectionByLength.short.body.match(/^• /gm) || []).length, 4, "short collection should contain four ideas");
assert.equal((collectionByLength.standard.body.match(/^• /gm) || []).length, 9, "standard collection should contain nine ideas");
assert.equal((collectionByLength.detailed.body.match(/^• /gm) || []).length, 12, "detailed collection should contain twelve ideas");
assert(collectionByLength.short.body.length < collectionByLength.standard.body.length, "standard collection should be longer than short");
assert(collectionByLength.standard.body.length < collectionByLength.detailed.body.length, "detailed collection should be longer than standard");
assert(collectionByLength.detailed.body.includes("• 碎钻猫眼：细碎猫眼聚光"), "beauty collection should match cat-eye copy to the cat-eye idea");
assert(collectionByLength.detailed.body.includes("• 粉紫晕染：粉和紫从边缘慢慢融在一起"), "beauty collection should match gradient copy to the gradient idea");
assert(collectionByLength.detailed.body.includes("• 银色镜面：银色镜面只占一两处视觉重点"), "beauty collection should match mirror copy to the mirror idea");

for (const result of Object.values(collectionByLength)) {
  assert(result.body.startsWith(result.primaryTitle), "collection body should start with one selected title");
  assert.equal(result.cover.split("\n").length, 2, "collection should provide two cover lines");
  assert(result.cover.split("\n").every((line) => line.length <= 17), "collection cover lines should stay concise");
  assert(allGeneratedTitles(result).every((title) => title.length <= 20), "collection titles should fit the 20-character publishing limit");
  assert(!result.body.split(/\n{2,}/)[0].includes(","), "collection title should not be joined to other titles");
  assert(result.body.includes("• "), "collection should use scannable bullet items");
  assert(!result.body.includes("以下是"), "collection should not sound like a generated report");
  assert(!result.body.includes("实际记录"), "collection should not fall back to the narrative template");
  assert.deepEqual(Array.from(generator.generatedQualityIssues(result, { ...collectionData, length: "standard" })), [], "collection should pass the quality gate");
  const descriptions = result.body.split("\n").filter((line) => line.startsWith("• ")).map((line) => line.slice(line.indexOf("：") + 1));
  assert.equal(new Set(descriptions).size, descriptions.length, "collection descriptions should not repeat within one result");
}

const versions = [1, 2, 3, 4].map((generation) => generateCollection("standard", generation));
assert.equal(new Set(versions.map((result) => result.body)).size, versions.length, "change-version should produce distinct collection bodies");
assert.equal(new Set(versions.map((result) => result.primaryTitle)).size, versions.length, "change-version should rotate the selected title");
assert(versions.some((result) => /薄雾|光泽|留白|层次/.test(result.body)), "beauty collection should use vivid category language");

let collectionCategoryIndex = 10;
for (const [category, profile] of Object.entries(generator.collectionProfiles)) {
  generator.state.generation = collectionCategoryIndex;
  const data = {
    ...collectionData,
    category,
    topic: category + "灵感",
    audience: generator.categoryData[category].audience,
    facts: [profile.items.join("、"), profile.groups.join("、"), profile.scenes.join("、"), "自然、具体，不要堆空话"],
    length: "detailed",
    tags: generator.categoryData[category].tags
  };
  const result = generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
  const descriptions = result.body.split("\n").filter((line) => line.startsWith("• ")).map((line) => line.slice(line.indexOf("：") + 1));
  assert.equal(descriptions.length, 12, category + " detailed collection should contain twelve ideas");
  assert.equal(new Set(descriptions).size, descriptions.length, category + " collection descriptions should not repeat");
  assert.equal(result.cover.split("\n").length, 2, category + " collection should provide two cover lines");
  assert(allGeneratedTitles(result).every((title) => title.length <= 20), category + " collection titles should stay within 20 characters");
  assert(!result.body.includes("undefined"), category + " collection should never leak undefined values");
  assert.deepEqual(Array.from(generator.generatedQualityIssues(result, data)), [], category + " collection should pass the quality gate");
  collectionCategoryIndex += 1;
}

generator.state.mode = "xianyu";
const xianyuData = {
  mode: "xianyu",
  topic: "Sony WH-1000XM5降噪耳机",
  condition: "95新",
  sellPrice: "1399",
  city: "上海",
  trade: "只走平台，支持邮寄",
  points: ["降噪和连接正常", "盒子和充电线都在"],
  details: "自用通勤约半年",
  cautions: "外壳有轻微使用痕迹",
  naturalMode: true,
  safeMode: true
};
const xianyuResult = generator.dedupeGenerated(generator.applyPolish(generator.generateXianyu(xianyuData), xianyuData));
assert.equal(xianyuResult.cover.split("\n").length, 2, "xianyu should provide two product-cover lines");
assert(generator.buildAll(xianyuResult).includes("【商品主图短句】"), "xianyu export should label its product-cover copy");
generator.state.mode = "rednote";

assert(html.includes("V8 首图文案与真人节奏"), "V8 branding should be visible");
assert((html.match(/data-category=/g) || []).length >= 13, "all major categories should be selectable");
assert(html.indexOf('id="body"') < html.indexOf('id="cover"'), "publish-ready body must remain the first output");
assert(html.indexOf('id="cover"') < html.indexOf('id="titles"'), "cover copy should appear before title alternatives");
assert(html.includes('data-copy-target="cover"'), "cover copy action should exist");
assert((html.match(/data-copy-body/g) || []).length >= 2, "desktop and mobile copy-body actions must exist");

const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
assert(serviceWorker.includes("rednote-copywriter-v8-20260715-cover-human-rhythm"), "service worker cache version was not updated");

console.log("Generator smoke test passed for", Object.keys(cases).length, "narrative categories and", Object.keys(generator.collectionProfiles).length, "collection profiles, including length and variation checks.");
