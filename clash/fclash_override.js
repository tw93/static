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
    // === 国内软件进程白名单（完全不走代理）===
    "PROCESS-NAME,DingTalk,DIRECT",

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

    // === Cursor (tooling, no US requirement) ===
    "DOMAIN,cursor.sh,HK",
    "DOMAIN,api.cursor.sh,HK",
    "DOMAIN,api2.cursor.sh,HK",
    "DOMAIN,api3.cursor.sh,HK",
    "DOMAIN,api4.cursor.sh,HK",
    "DOMAIN-SUFFIX,api5.cursor.sh,HK",
    "DOMAIN,repo42.cursor.sh,HK",
    "DOMAIN-SUFFIX,authentication.cursor.sh,HK",
    "DOMAIN,authenticator.cursor.sh,HK",
    "DOMAIN,download.cursor.sh,HK",
    "DOMAIN-SUFFIX,cursor.sh,HK",
    "DOMAIN-SUFFIX,cursor.com,HK",
    "DOMAIN-SUFFIX,cursorapi.com,HK",
    "DOMAIN-SUFFIX,cursor-cdn.com,HK",

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
    "DOMAIN-SUFFIX,wx.qq.com,HK",
    "DOMAIN-SUFFIX,v2ex.com,HK",
    "DOMAIN-SUFFIX,formulae.brew.sh,US",
    "DOMAIN-SUFFIX,diabrowser.com,US",
    "DOMAIN-SUFFIX,honeycomb.io,HK"
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
  if (!config.dns) config.dns = {};
  if (!config.dns["fake-ip-filter"]) config.dns["fake-ip-filter"] = [];

  const cnConsumer = [
    "+.aliyun.com", "+.taobao.com",
    "+.alipay.com", "+.alibaba.com"
  ];
  config.dns["fake-ip-filter"].push(...cnConsumer);

  // 3. 配置 Sniffer (AI 优化)
  if (!config.sniffer) config.sniffer = {};
  if (!config.sniffer["skip-domain"]) config.sniffer["skip-domain"] = [];
  config.sniffer["skip-domain"].push(...aiDomains);

  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(...extraRules);
  } else {
    config.rules = extraRules;
  }

  return config;
}
