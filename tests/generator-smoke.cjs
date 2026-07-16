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

const storage = new Map();
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
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
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
    "      globalThis.__generatorTest = { generateRednote: generateRednote, generateXianyu: generateXianyu, applyPolish: applyPolish, dedupeGenerated: dedupeGenerated, buildAll: buildAll, buildPublishable: buildPublishable, validateRednoteFacts: validateRednoteFacts, generatedQualityIssues: generatedQualityIssues, qualityReport: qualityReport, contentSimilarity: contentSimilarity, hookStyleOpening: hookStyleOpening, categoryData: categoryData, collectionProfiles: collectionProfiles, getCollectionProfile: getCollectionProfile, state: state };\n" +
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
  ],
  "好物测评": [
    "为了通勤补妆入手，活动价129元",
    "连续使用20天，工作日早上和出差时使用",
    "上脸轻薄，下午鼻翼略出油但没有明显斑驳",
    "色号偏少，更适合追求自然妆效的人"
  ],
  "情感成长": [
    "异地半年，最近因为回复消息频率反复争执",
    "一次临时取消见面后，我们第一次把期待说开",
    "从反复猜测变成直接确认，情绪消耗少了一些",
    "不再用冷处理试探，同样方法不一定适合每段关系"
  ],
  "宠物": [
    "2岁短毛猫，换季掉毛明显且肠胃偶尔敏感",
    "每周梳毛4次，连续观察3周",
    "浮毛少了一些，也能配合梳毛约5分钟",
    "梳齿偏硬要控制力度，持续异常会咨询兽医"
  ],
  "健身运动": [
    "久坐上班族肩背容易紧，目标是每周运动3次",
    "连续6周，每次40分钟，两次力量加一次快走",
    "深蹲从徒手做到20kg，爬楼后的喘感减轻",
    "膝盖不适后降低强度并请教教练调整动作"
  ],
  "影视": [
    "看完12集正片和番外，尽量不涉及关键结局",
    "第6集沉默吃饭的段落最能说明关系变化",
    "前半段觉得慢，后面才看懂留白的作用",
    "节奏偏慢，更适合喜欢人物成长的人"
  ],
  "教育": [
    "小学三年级，写作业容易漏题且抗拒检查",
    "连续3周只检查题号和单位，每晚不超过10分钟",
    "漏题从一周4次降到1次，也愿意说出检查顺序",
    "这是家庭观察，持续困难需要寻求专业评估"
  ],
  "婚礼": [
    "杭州10月午宴，18桌约180人",
    "总预算12万元，更多预算留给摄影和灯光",
    "阴天柔光适合拍照，但迎宾区高峰时略拥挤",
    "没有预留换装后的单独合影时间"
  ],
  "摄影": [
    "35mm镜头F2.0，傍晚5点侧逆光",
    "人物离窗约1米，背景留出三分之一空白",
    "先压高光再提阴影，少量调整橙色明度",
    "肤色通透，但太阳落下后噪点明显"
  ],
  "汽车": [
    "2025款标准版，落地约18万元",
    "行驶6500公里，七成城市通勤三成高速",
    "综合电耗14.8kWh，后排坐两人空间充足",
    "低速刹车脚感要适应，更适合有固定充电条件的人"
  ],
  "房产": [
    "上海外环附近，两人自住且优先考虑通勤采光",
    "总价预算350万元，主要看70到85平两居",
    "步行到地铁约12分钟，晚高峰单程55分钟",
    "临街卧室有车声，税费信息要按最新政策核对"
  ],
  "兴趣手作": [
    "第一次做滴胶，材料和模具共花86元",
    "分两层灌注，每层静置12小时",
    "颜色比预期通透，但成品边缘有轻微溢胶",
    "亮片放太多会下沉，下次会减少用量"
  ],
  "游戏": [
    "当前2.3版本，零氪玩到第35天",
    "主C搭配双辅助，资源优先升级关键技能",
    "副本时间从3分钟降到1分40秒",
    "前期资源紧张，更适合愿意慢养成的人"
  ],
  "娱乐追星": [
    "7月12日公开舞台，信息来自官方直播和现场记录",
    "第二首歌换成现场乐队后情绪更完整",
    "收尾时的停顿让我反复回看",
    "只讨论公开舞台，不猜测私人行程"
  ],
  "资讯解读": [
    "7月15日发布的官方公告涉及平台规则调整",
    "公告明确列出3项变化，8月1日起分阶段执行",
    "频繁发布商品内容的创作者需要检查授权材料",
    "细则尚未全部公布，以官方更新为准"
  ],
  "健康养生": [
    "久坐后肩颈紧，最近想稳定睡眠和活动量",
    "连续4周饭后走20分钟，晚上11点前放下手机",
    "入睡时间从约40分钟缩短到20分钟",
    "这只是个人记录，持续异常应及时就医"
  ],
  "音乐": [
    "录音室版和巡演现场版都听过，更偏爱现场编曲",
    "晚上戴耳机完整听了三遍",
    "副歌人声后撤后反而把情绪拉得更长",
    "更适合独处或通勤结束时听"
  ],
  "萌娃": [
    "宝宝1岁8个月，第一次参加亲子运动会",
    "起跑前抓着我的手，看到彩球后才慢慢走过去",
    "没有完成比赛，但愿意把球递给旁边的小朋友",
    "不展示学校位置，更在意他愿意尝试"
  ],
  "知识科普": [
    "解释为什么充电宝实际可用电量低于标称容量",
    "参考产品说明和能量转换公式",
    "电芯升压和线路转换都会产生损耗",
    "电压温度和设备效率不同会改变结果"
  ],
  "闲置": [
    "去年双11购买，通勤使用约半年",
    "盒子充电线都在，连接和降噪正常",
    "95新，换了新设备所以出售",
    "外壳有细小划痕，只走平台"
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
  "给大家一个身材参考",
  "我当时的情况是：",
  "真正做的是：",
  "最后的结果是：",
  "还有一个限制："
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
    tone: "真人碎碎念",
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
const narrativeVersions = [1, 2, 3, 4, 5, 6, 7, 8].map((generation) => generateNarrative("standard", generation));
assert.equal(new Set(narrativeVersions.map((result) => result.body)).size, narrativeVersions.length, "change-version should produce distinct narrative bodies");
assert.equal(new Set(narrativeVersions.map((result) => result.primaryTitle)).size, narrativeVersions.length, "change-version should rotate narrative titles");
assert(new Set(narrativeVersions.map((result) => result.cover)).size >= 6, "change-version should rotate cover copy broadly");
const narrativeOpenings = narrativeVersions.map((result) => result.body.split(/\n{2,}/)[1].split("\n")[0]);
assert(new Set(narrativeOpenings).size >= 7, "eight versions should not keep recycling the same few openings");
assert(narrativeVersions.every((result) => !result.body.includes("还有一个细节：") && !result.body.includes("另外要说的是：")), "old fixed supplement phrases should be removed");
assert(narrativeVersions.every((result) => allGeneratedTitles(result).every((title) => title.length <= 20)), "all narrative versions should keep titles within 20 characters");

const voiceResults = ["真人碎碎念", "克制种草", "情绪共鸣"].map((tone, index) => {
  generator.state.generation = 20 + index;
  const data = { ...narrativeData, tone, length: "standard", hookStyle: "自动匹配" };
  return generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
});
assert.equal(new Set(voiceResults.map((result) => result.body)).size, 3, "new writing voices should produce distinct bodies");
assert(/说实话|先说下|没白试|不端着|前后看|标准答案|只想记|只说一句|怕大家/.test(voiceResults[0].body), "human voice should read conversationally");
assert(/不把|劝退|使用前提|不先说清|连续使用|喜欢归喜欢|短板/.test(voiceResults[1].body), "restrained recommendation voice should keep pros and limits together");
assert(/回头看|真正让我|松一口气|悄悄|标准答案|想明白|没有突然|真正被我记住|那段时间/.test(voiceResults[2].body), "emotional voice should carry a personal reflection");

const hookBodies = ["先给结果", "痛点代入", "反差转折", "故事开场", "数字证据"].map((hookStyle, index) => {
  generator.state.generation = 30 + index;
  const data = { ...narrativeData, tone: "真实自然", hookStyle };
  return generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(data), data));
});
assert.equal(new Set(hookBodies.map((result) => result.body.split(/\n{2,}/)[1])).size, 5, "each opening strategy should create a different opening");
assert(hookBodies[4].body.split(/\n{2,}/)[1].match(/\d/), "numeric-evidence opening should use supplied numeric facts");

const qualityData = { ...narrativeData, hookStyle: "自动匹配", searchWord: "AI写作" };
generator.state.generation = 40;
const qualityResult = generator.dedupeGenerated(generator.applyPolish(generator.generateRednote(qualityData), qualityData));
const quality = generator.qualityReport(qualityResult, qualityData);
assert(quality.score >= 85 && quality.score <= 98, "quality self-check should return a useful bounded score");
assert.equal(quality.facts, "4/4 已写入", "quality self-check should report used facts");
assert(qualityResult.extras.includes("#AI写作"), "custom search word should lead the generated tags");
assert(generator.contentSimilarity("这是一段完全相同的测试文案", "这是一段完全相同的测试文案") > 0.95, "similarity should recognize identical text");
assert(generator.contentSimilarity("夏日通勤穿搭", "宠物日常喂养") < 0.35, "similarity should separate unrelated text");
sandbox.localStorage.setItem("rednoteCopywriterV2History", JSON.stringify([{
  id: 9001,
  mode: "rednote",
  data: qualityData,
  generated: qualityResult,
  createdAt: new Date().toISOString()
}]));
assert.equal(generator.qualityReport(qualityResult, qualityData).freshness, "0%", "freshness check should flag a repeated body");
sandbox.localStorage.removeItem("rednoteCopywriterV2History");

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
for (const category of Object.keys(generator.categoryData)) {
  const profile = generator.getCollectionProfile({ category });
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

assert(html.includes("V10 真人口吻与发布自检"), "V10 branding should be visible");
assert.equal(Object.keys(generator.categoryData).length, 31, "all 31 Xiaohongshu content categories should have data profiles");
assert((html.match(/data-category=/g) || []).length >= 31, "all 31 content categories should be selectable");
assert((html.match(/data-demo=/g) || []).length >= 5, "five cross-category instant demos should be available");
assert((html.match(/data-rewrite=/g) || []).length >= 3, "title, opening, and ending should support focused rewrites");
assert(html.includes('id="qualityPanel"'), "publish quality self-check should be visible");
assert(html.includes('id="hookStyle"'), "opening strategy selector should exist");
assert(html.indexOf('id="body"') < html.indexOf('id="cover"'), "publish-ready body must remain the first output");
assert(html.indexOf('id="cover"') < html.indexOf('id="titles"'), "cover copy should appear before title alternatives");
assert(html.includes('data-copy-target="cover"'), "cover copy action should exist");
assert((html.match(/data-copy-body/g) || []).length >= 2, "desktop and mobile copy-body actions must exist");

const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
assert(serviceWorker.includes("rednote-copywriter-v10-20260716-human-voice-quality"), "service worker cache version was not updated");

console.log("Generator smoke test passed for", Object.keys(cases).length, "narrative categories and", Object.keys(generator.categoryData).length, "collection profiles, including eight-version variation checks.");
