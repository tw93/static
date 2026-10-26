/**
 * FClash Override Script
 * AI Services & GitHub routing rules
 */
function main(config) {
  const aiDomains = [
    "+.openai.com",
    "+.chatgpt.com",
    "+.anthropic.com",
    "+.claude.ai",
    "+.googleapis.com",
    "+.deepmind.com",
    "+.x.ai",
    "+.grok.com",
    "+.groq.com",
    "+.cursor.sh",
    "+.cursor.com"
  ];

  const extraRules = [
    // Reddit
    "DOMAIN-SUFFIX,reddit.com,US",
    "DOMAIN-SUFFIX,redd.it,US",
    "DOMAIN-SUFFIX,redditmedia.com,US",
    "DOMAIN-SUFFIX,redditstatic.com,US",

    // === OpenAI / ChatGPT ===
    "DOMAIN-SUFFIX,openai.com,US",
    "DOMAIN,tcr9i.chat.openai.com,US",
    "DOMAIN,ios.chat.openai.com,US",
    "DOMAIN,android.chat.openai.com,US",
    "DOMAIN,desktop.chat.openai.com,US",
    "DOMAIN,api.openai.com,US",
    "DOMAIN,openai.com,US",
    "DOMAIN,platform.openai.com,US",
    "DOMAIN,labs.openai.com,US",
    "DOMAIN,help.openai.com,US",
    "DOMAIN,status.openai.com,US",
    "DOMAIN,auth0.openai.com,US",
    "DOMAIN,accounts.openai.com,US",
    "DOMAIN,auth.openai.com,US",
    "DOMAIN-SUFFIX,auth.openai.com,US",
    "DOMAIN,setup.auth.openai.com,US",
    "DOMAIN,cdn.openai.com,US",
    "DOMAIN,openai-cdn.com,US",
    "DOMAIN,openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net,US",
    "DOMAIN,production-openaicom-storage.azureedge.net,US",
    "DOMAIN,oai-shared.openai.com,US",
    "DOMAIN,enterprise.openai.com,US",
    "DOMAIN,team.openai.com,US",
    "DOMAIN,browser-intake-datadoghq.com,HK",
    "DOMAIN-SUFFIX,openai.com,US",
    "DOMAIN-SUFFIX,chatgpt.com,US",
    "DOMAIN-SUFFIX,oaistatic.com,US",
    "DOMAIN-SUFFIX,oaiusercontent.com,US",
    "DOMAIN-SUFFIX,openaiapi-site.azureedge.net,US",
    "DOMAIN-SUFFIX,openaicom.imgix.net,US",
    "DOMAIN-SUFFIX,chatgpt.livekit.cloud,US",
    "DOMAIN-SUFFIX,sentry.io,HK",
    "DOMAIN-SUFFIX,algolia.net,HK",

    // === Claude (Anthropic) ===
    "DOMAIN,claude.ai,US",
    "DOMAIN,console.anthropic.com,US",
    "DOMAIN,api.anthropic.com,US",
    "DOMAIN,support.anthropic.com,US",
    "DOMAIN,docs.anthropic.com,US",
    "DOMAIN,statsig.anthropic.com,US",
    "DOMAIN-SUFFIX,anthropic.com,US",
    "DOMAIN-SUFFIX,claude.ai,US",

    // === AI session / risk-control (must share exit with claude.ai) ===
    "DOMAIN,js.stripe.com,US",
    "DOMAIN-SUFFIX,stripe.com,US",
    "DOMAIN,challenges.cloudflare.com,US",
    "DOMAIN,setup.workos.com,US",
    "DOMAIN,forwarder.workos.com,US",
    "DOMAIN-SUFFIX,workos.com,US",
    "DOMAIN,workos.imgix.net,US",
    "DOMAIN,cdn.workos.com,US",
    "DOMAIN,images.workoscdn.com,US",

    // === Dependencies / SDK / Analytics (exit does not matter) ===
    "DOMAIN-SUFFIX,segment.io,HK",
    "DOMAIN-SUFFIX,intercom.io,HK",
    "DOMAIN-SUFFIX,statsig.com,HK",
    "DOMAIN,statsigapi.net,HK",
    "DOMAIN,events.statsigapi.net,HK",
    "DOMAIN-SUFFIX,featuregates.org,HK",
    "DOMAIN-SUFFIX,intercomcdn.com,HK",
    "DOMAIN,js.intercomcdn.com,HK",
    "DOMAIN,rum.browser-intake-datadoghq.com,HK",
    "DOMAIN,o33249.ingest.sentry.io,HK",
    "DOMAIN,o207216.ingest.sentry.io,HK",
    "DOMAIN,prodregistryv2.org,HK",
    "DOMAIN,featureassets.org,HK",
    "DOMAIN,events.launchdarkly.com,HK",
    "DOMAIN,clientstream.launchdarkly.com,HK",
    "DOMAIN,app.launchdarkly.com,HK",
    "DOMAIN-SUFFIX,launchdarkly.com,HK",
    "DOMAIN-SUFFIX,ct.sendgrid.net,HK",

    // === Google AI (region-locked, keep US; HK exits are blocked) ===
    "DOMAIN,accounts.google.com,US",
    "DOMAIN,generativeai.google,US",
    "DOMAIN,ai.google,US",
    "DOMAIN-SUFFIX,deepmind.com,US",

    // === Gemini ===
    "DOMAIN,gemini.google.com,US",
    "DOMAIN,bard.google.com,US",
    "DOMAIN,aistudio.google.com,US",
    "DOMAIN,makersuite.google.com,US",
    "DOMAIN,generativelanguage.googleapis.com,US",
    "DOMAIN-SUFFIX,gemini.google.com,US",

    // === Google APIs (non-Gemini; generativelanguage rule above must stay first) ===
    "DOMAIN-SUFFIX,googleapis.com,HK",
    "DOMAIN-SUFFIX,tensorflow.org,HK",

    // === Cursor (model traffic shares the US exit) ===
    "DOMAIN,cursor.sh,US",
    "DOMAIN,api.cursor.sh,US",
    "DOMAIN,api2.cursor.sh,US",
    "DOMAIN,api3.cursor.sh,US",
    "DOMAIN,api4.cursor.sh,US",
    "DOMAIN-SUFFIX,api5.cursor.sh,US",
    "DOMAIN,repo42.cursor.sh,US",
    "DOMAIN-SUFFIX,authentication.cursor.sh,US",
    "DOMAIN,authenticator.cursor.sh,US",
    "DOMAIN,download.cursor.sh,US",
    "DOMAIN-SUFFIX,cursor.sh,US",
    "DOMAIN-SUFFIX,cursor.com,US",
    "DOMAIN-SUFFIX,cursorapi.com,US",
    "DOMAIN-SUFFIX,cursor-cdn.com,US",

    // === Midjourney ===
    "DOMAIN,midjourney.com,HK",
    "DOMAIN,cdn.midjourney.com,HK",
    "DOMAIN-SUFFIX,midjourney.com,HK",

    // === Cloudflare AI ===
    "DOMAIN,ai.cloudflare.com,US",
    "DOMAIN-SUFFIX,workers.dev,HK",

    // === GitHub / Copilot (tooling, no US requirement) ===
    "DOMAIN-SUFFIX,github.com,HK",
    "DOMAIN-SUFFIX,githubusercontent.com,HK",
    "DOMAIN-SUFFIX,githubcopilot.com,HK",
    "DOMAIN-SUFFIX,copilot.github.com,HK",

    // === Domestic / Direct ===
    "DOMAIN-SUFFIX,taobao.com,DIRECT",
    "DOMAIN-SUFFIX,fliggy.com,DIRECT",
    "DOMAIN-SUFFIX,sspai.com,DIRECT",
    "DOMAIN-SUFFIX,aliyun.com,DIRECT",
    "DOMAIN-SUFFIX,wx.qq.com,DIRECT",
    // Frequent domestic sites and apps (browser history and the maintainer's
    // devices, 2026-10-26); tmall, meituan and iqiyi otherwise fell to MATCH.
    "DOMAIN-SUFFIX,xiaohongshu.com,DIRECT",
    "DOMAIN-SUFFIX,xhscdn.com,DIRECT",
    "DOMAIN-SUFFIX,bilibili.com,DIRECT",
    "DOMAIN-SUFFIX,hdslb.com,DIRECT",
    "DOMAIN-SUFFIX,bilivideo.com,DIRECT",
    "DOMAIN-SUFFIX,douban.com,DIRECT",
    "DOMAIN-SUFFIX,doubanio.com,DIRECT",
    "DOMAIN-SUFFIX,zhihu.com,DIRECT",
    "DOMAIN-SUFFIX,zhimg.com,DIRECT",
    "DOMAIN-SUFFIX,baidu.com,DIRECT",
    "DOMAIN-SUFFIX,bdstatic.com,DIRECT",
    "DOMAIN-SUFFIX,qq.com,DIRECT",
    "DOMAIN-SUFFIX,deepseek.com,DIRECT",
    "DOMAIN-SUFFIX,xiaoyuzhoufm.com,DIRECT",
    "DOMAIN-SUFFIX,zhongguose.com,DIRECT",
    "DOMAIN-SUFFIX,tmall.com,DIRECT",
    "DOMAIN-SUFFIX,alipayobjects.com,DIRECT",
    "DOMAIN-SUFFIX,meituan.com,DIRECT",
    "DOMAIN-SUFFIX,meituan.net,DIRECT",
    "DOMAIN-SUFFIX,dianping.com,DIRECT",
    "DOMAIN-SUFFIX,iqiyi.com,DIRECT",
    "DOMAIN-SUFFIX,iqiyipic.com,DIRECT",
    "DOMAIN-SUFFIX,qy.net,DIRECT",
    "DOMAIN-SUFFIX,jd.com,DIRECT",
    "DOMAIN-SUFFIX,360buyimg.com,DIRECT",
    "DOMAIN-SUFFIX,pinduoduo.com,DIRECT",
    "DOMAIN-SUFFIX,yangkeduo.com,DIRECT",
    "DOMAIN-SUFFIX,pddpic.com,DIRECT",
    "DOMAIN-SUFFIX,163.com,DIRECT",
    "DOMAIN-SUFFIX,126.net,DIRECT",
    "DOMAIN-SUFFIX,netease.com,DIRECT",
    "DOMAIN-SUFFIX,v2ex.com,HK",
    "DOMAIN-SUFFIX,formulae.brew.sh,US",
    "DOMAIN-SUFFIX,diabrowser.com,US",
    "DOMAIN-SUFFIX,honeycomb.io,HK",

    // === 以下与 Nexitally 基准规则集对齐 ===
    // Claude / OpenAI 补全
    "DOMAIN-SUFFIX,claude.com,US",
    "DOMAIN-SUFFIX,claudeusercontent.com,US",
    "DOMAIN-SUFFIX,ant.dev,US",
    "DOMAIN-SUFFIX,claudeaistatus.com,US",
    "DOMAIN-SUFFIX,livekit.cloud,US",

    // Gemini 补全
    "DOMAIN,ai.google.dev,US",
    "DOMAIN,notebooklm.google.com,US",
    "DOMAIN-SUFFIX,google-gemini.dev,US",

    // xAI / Groq
    "DOMAIN-SUFFIX,x.ai,US",
    "DOMAIN-SUFFIX,grok.com,US",
    "DOMAIN,api.x.ai,US",
    "DOMAIN-SUFFIX,groq.com,US",

    // 其他 AI 服务
    "DOMAIN-SUFFIX,cohere.com,HK",
    "DOMAIN-SUFFIX,mistral.ai,HK",
    "DOMAIN-SUFFIX,together.ai,HK",
    "DOMAIN-SUFFIX,replicate.com,HK",
    "DOMAIN-SUFFIX,huggingface.co,HK",
    "DOMAIN-SUFFIX,perplexity.ai,HK",
    "DOMAIN-SUFFIX,pplx.ai,HK",
    "DOMAIN-SUFFIX,openrouter.ai,HK",
    "DOMAIN-SUFFIX,windsurf.com,HK",
    "DOMAIN-SUFFIX,codeium.com,HK",
    "DOMAIN-SUFFIX,v0.dev,HK",
    "DOMAIN-SUFFIX,bolt.new,HK",
    "DOMAIN-SUFFIX,datadoghq.com,HK",

    // 直连
    "DOMAIN-SUFFIX,qoder.sh,DIRECT",
    "DOMAIN,timestamp.apple.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,aliyuncs.com,DIRECT",
    "DOMAIN-SUFFIX,alicdn.com,DIRECT",
    "DOMAIN-SUFFIX,aliimg.com,DIRECT",

    // 微信 / 腾讯直连
    "DOMAIN-SUFFIX,wechat.com,DIRECT",
    "DOMAIN-SUFFIX,wechatlegal.net,DIRECT",
    "DOMAIN-SUFFIX,wechatos.net,DIRECT",
    "DOMAIN-SUFFIX,wechatpay.com,DIRECT",
    "DOMAIN-SUFFIX,weixin.com,DIRECT",
    "DOMAIN-SUFFIX,weixinbridge.com,DIRECT",
    "DOMAIN-SUFFIX,weixinsxy.com,DIRECT",
    "DOMAIN-SUFFIX,weixin.qq.com,DIRECT",
    "DOMAIN-SUFFIX,wxs.qq.com,DIRECT",
    "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
    "DOMAIN-SUFFIX,tenpay.com,DIRECT",
    "DOMAIN-SUFFIX,qpic.cn,DIRECT",
    "DOMAIN-SUFFIX,qlogo.cn,DIRECT",
    "DOMAIN-SUFFIX,gtimg.com,DIRECT",
    "DOMAIN-SUFFIX,tc.qq.com,DIRECT",

    // Apple / iCloud 直连
    "DOMAIN-SUFFIX,apple.com,DIRECT",
    "DOMAIN-SUFFIX,apple.com.cn,DIRECT",
    "DOMAIN-SUFFIX,apple-relay.akamaized.net,DIRECT",
    "DOMAIN-SUFFIX,apple-relay.cloudflare.com,DIRECT",
    "DOMAIN-SUFFIX,apple-relay.fastly-edge.com,DIRECT",
    "DOMAIN-SUFFIX,apple-dns.net,DIRECT",
    "DOMAIN-SUFFIX,apple-cloudkit.com,DIRECT",
    "DOMAIN-SUFFIX,apple-mapkit.com,DIRECT",
    "DOMAIN-SUFFIX,apple.news,DIRECT",
    "DOMAIN-SUFFIX,cdn-apple.com,DIRECT",
    "DOMAIN-SUFFIX,icloud.com,DIRECT",
    "DOMAIN-SUFFIX,icloud.com.cn,DIRECT",
    "DOMAIN-SUFFIX,icloud-content.com,DIRECT",
    "DOMAIN-SUFFIX,itunes.com,DIRECT",
    "DOMAIN-SUFFIX,itunes.apple.com,DIRECT",
    "DOMAIN-SUFFIX,music.apple.com,DIRECT",
    "DOMAIN-SUFFIX,mzstatic.com,DIRECT",
    "DOMAIN-SUFFIX,aaplimg.com,DIRECT",
    "DOMAIN-SUFFIX,me.com,DIRECT",
    "DOMAIN-SUFFIX,appsto.re,DIRECT",

    // 国内兜底
    "DOMAIN-SUFFIX,cn,DIRECT"
  ];

  // === 注入 DNS / TUN / Sniffer 配置 ===
  
  // 1. 开启 TUN 和 进程匹配增强
  config["tun"] = {
    enable: true,
    stack: "mixed",
    "auto-route": true,
    "auto-detect-interface": true,
    mtu: 1500
  };
  config["find-process-mode"] = "always";
  config["keep-alive-idle"] = 600;
  config["keep-alive-interval"] = 10;
  config["connection-idle-timeout"] = 0;
  config["tcp-concurrent"] = true;
  config["unified-delay"] = true;

  // 2. 配置 DNS (国内域名不吃 fake-ip)
  // Rules target Flower's HK / US groups. Other providers name them differently
  // (Nexitally has Proxies / AI), and a rule pointing at a missing group makes
  // mihomo reject the whole config, so map each target to a group that exists.
  const groupNames = new Set((config["proxy-groups"] || []).map((g) => g.name));
  const fallbacks = { US: ["US", "AI", "Proxies", "Proxy"], HK: ["HK", "Proxies", "Proxy"] };
  const resolveTarget = (t) => {
    if (!fallbacks[t]) return t;
    return fallbacks[t].find((n) => groupNames.has(n)) || [...groupNames][0] || "DIRECT";
  };

  if (!config.dns) config.dns = {};
  if (!config.dns["nameserver-policy"]) config.dns["nameserver-policy"] = {};
  // Dial Reddit's resolvers through its own proxy group: a profile without
  // fake-ip resolves locally, and 1.1.1.1 / 8.8.8.8 are unreachable direct.
  const redditVia = resolveTarget("US");
  for (const d of ["reddit.com", "redd.it", "redditmedia.com", "redditstatic.com"]) {
    config.dns["nameserver-policy"][`+.${d}`] = [`https://1.1.1.1/dns-query#${redditVia}`, `https://8.8.8.8/dns-query#${redditVia}`];
  }
  // Domestic sites resolve through AliDNS / DNSPod instead of the provider's DoH,
  // which handed www.baidu.com a 78 ms node against AliDNS's 32 ms (2026-10-26).
  const cnPolicyDomains = [
    "xiaohongshu.com", "xhscdn.com", "bilibili.com", "hdslb.com", "bilivideo.com",
    "douban.com", "doubanio.com", "zhihu.com", "zhimg.com", "baidu.com", "bdstatic.com",
    "qq.com", "deepseek.com", "xiaoyuzhoufm.com", "zhongguose.com",
    "tmall.com", "alipayobjects.com", "meituan.com", "meituan.net", "dianping.com",
    "iqiyi.com", "iqiyipic.com", "qy.net", "jd.com", "360buyimg.com", "pinduoduo.com",
    "yangkeduo.com", "pddpic.com", "163.com", "126.net", "netease.com",
    "alipay.com", "taobao.com", "alicdn.com", "aliyun.com", "sspai.com", "cn"
  ];
  for (const d of cnPolicyDomains) {
    config.dns["nameserver-policy"][`+.${d}`] = ["223.5.5.5", "119.29.29.29"];
  }
  if (!config.dns["fake-ip-filter"]) config.dns["fake-ip-filter"] = [];

  // 与 Nexitally 基准一致的 fake-ip 排除表(国内域名不吃 fake-ip)
  const cnFakeIpFilter = [
    "*.lan",
    "*.local",
    "*.localdomain",
    "*.home.arpa",
    "+.cn",
    "+.baidu.com",
    "+.taobao.com",
    "+.tmall.com",
    "+.alipay.com",
    "+.aliyun.com",
    "+.alibaba.com",
    "+.qq.com",
    "+.wechat.com",
    "+.weixin.qq.com",
    "+.icloud.com",
    "+.icloud-content.com",
    "+.apple-cloudkit.com",
    "+.apple.com",
    "+.push.apple.com",
    "+.apple-dns.net",
    "+.cdn-apple.com",
    "+.mzstatic.com",
    "+.xiaomi.com",
    "+.mi.com",
    "+.bilibili.com",
    "+.163.com",
    "+.126.com",
    "+.netease.com",
    "+.jd.com",
    "+.jdcloud.com",
    "+.360buyimg.com",
    "+.weibo.com",
    "+.xiaohongshu.com",
    "+.xhscdn.com",
    "+.douyin.com",
    "+.douyinpic.com",
    "+.bytedance.com",
    "+.toutiao.com",
    "+.snssdk.com",
    "+.meituan.com",
    "+.meituan.net",
    "+.dianping.com",
    "+.kuaishou.com",
    "+.gifshow.com",
    "+.pinduoduo.com",
    "+.yangkeduo.com",
    "+.zhihu.com",
    "+.zhimg.com",
    "time.*.com",
    "ntp.*.com",
    "stun.*.*",
    "stun.*.*.*"
  ];
  config.dns["fake-ip-filter"].push(...cnFakeIpFilter);

  // 3. 配置 Sniffer (AI 优化)
  if (!config.sniffer) config.sniffer = {};
  if (!config.sniffer["skip-domain"]) config.sniffer["skip-domain"] = [];
  config.sniffer["skip-domain"].push(...aiDomains);

  for (let i = 0; i < extraRules.length; i++) {
    const parts = extraRules[i].split(",");
    const at = parts[parts.length - 1] === "no-resolve" ? parts.length - 2 : parts.length - 1;
    parts[at] = resolveTarget(parts[at]);
    extraRules[i] = parts.join(",");
  }

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(...extraRules);
  } else {
    config.rules = extraRules;
  }

  return config;
}
