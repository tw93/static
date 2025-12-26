/**
 * FClash Override Script
 * Converted from stash_override.yaml
 */
function main(config) {
  // Define all rules to be inserted
  // logic: typically prepended to ensure priority
  const extraRules = [
    // === OpenAI / ChatGPT Main Domains ===
    "DOMAIN,chat.openai.com,US",
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
    "DOMAIN,browser-intake-datadoghq.com,US",

    "DOMAIN-SUFFIX,openai.com,US",
    "DOMAIN-SUFFIX,chatgpt.com,US",
    "DOMAIN-SUFFIX,oaistatic.com,US",
    "DOMAIN-SUFFIX,oaiusercontent.com,US",
    "DOMAIN-SUFFIX,openaiapi-site.azureedge.net,US",
    "DOMAIN-SUFFIX,openaicom.imgix.net,US",
    "DOMAIN-SUFFIX,chatgpt.livekit.cloud,US",
    "DOMAIN-SUFFIX,sentry.io,US",
    "DOMAIN-SUFFIX,algolia.net,US",

    // === Claude (Anthropic) ===
    "DOMAIN,claude.ai,US",
    "DOMAIN,console.anthropic.com,US",
    "DOMAIN,api.anthropic.com,US",
    "DOMAIN,support.anthropic.com,US",
    "DOMAIN,docs.anthropic.com,US",
    "DOMAIN,statsig.anthropic.com,US",
    "DOMAIN,sentry.io,US",

    "DOMAIN-SUFFIX,anthropic.com,US",
    "DOMAIN-SUFFIX,claude.ai,US",
    "DOMAIN-SUFFIX,stripe.com,US",
    "DOMAIN-SUFFIX,segment.io,US",
    "DOMAIN-SUFFIX,intercom.io,US",

    // === Dependencies / SDK / Analytics ===
    "DOMAIN-SUFFIX,statsig.com,US",
    "DOMAIN,statsigapi.net,US",
    "DOMAIN,events.statsigapi.net,US",
    "DOMAIN-SUFFIX,featuregates.org,US",
    "DOMAIN-SUFFIX,intercomcdn.com,US",
    "DOMAIN,js.intercomcdn.com,US",
    "DOMAIN,js.stripe.com,US",
    "DOMAIN,challenges.cloudflare.com,US",
    "DOMAIN,rum.browser-intake-datadoghq.com,US",
    "DOMAIN,o33249.ingest.sentry.io,US",
    "DOMAIN,o207216.ingest.sentry.io,US",
    "DOMAIN,prodregistryv2.org,US",
    "DOMAIN,featureassets.org,US",
    "DOMAIN,setup.workos.com,US",
    "DOMAIN,forwarder.workos.com,US",
    "DOMAIN-SUFFIX,workos.com,US",
    "DOMAIN,events.launchdarkly.com,US",
    "DOMAIN,clientstream.launchdarkly.com,US",
    "DOMAIN,app.launchdarkly.com,US",
    "DOMAIN-SUFFIX,launchdarkly.com,US",
    "DOMAIN,workos.imgix.net,US",
    "DOMAIN,cdn.workos.com,US",
    "DOMAIN,images.workoscdn.com,US",
    "DOMAIN-SUFFIX,ct.sendgrid.net,US",


    // === GitHub ===
    "DOMAIN,github.com,US",
    "DOMAIN,api.github.com,US",
    "DOMAIN,raw.githubusercontent.com,US",
    "DOMAIN,user-images.githubusercontent.com,US",
    "DOMAIN,camo.githubusercontent.com,US",
    "DOMAIN,avatars.githubusercontent.com,US",
    "DOMAIN,objects.githubusercontent.com,US",
    "DOMAIN,pages.github.com,US",
    "DOMAIN,ghcr.io,US",
    "DOMAIN,github.githubassets.com,US",
    "DOMAIN,collector.github.com,US",
    "DOMAIN,collector-cdn.github.com,US",
    "DOMAIN,github.io,US",
    "DOMAIN-SUFFIX,github.com,US",
    "DOMAIN-SUFFIX,githubusercontent.com,US",
    "DOMAIN-SUFFIX,githubassets.com,US",
    "DOMAIN-SUFFIX,github.io,US",

    // === Common AI Services ===
    // Google AI
    "DOMAIN,generativeai.google,US",
    "DOMAIN,ai.google,US",
    "DOMAIN-SUFFIX,googleapis.com,US",
    "DOMAIN-SUFFIX,deepmind.com,US",
    "DOMAIN-SUFFIX,tensorflow.org,US",

    // Meta / LLaMA
    "DOMAIN-SUFFIX,meta.ai,US",
    "DOMAIN-SUFFIX,facebook.ai,US",
    "DOMAIN-SUFFIX,llama.meta.com,US",

    // Hugging Face
    "DOMAIN,huggingface.co,US",
    "DOMAIN,cdn-lfs.huggingface.co,US",
    "DOMAIN-SUFFIX,huggingface.co,US",

    // Stability AI
    "DOMAIN,stability.ai,US",
    "DOMAIN-SUFFIX,stability.ai,US",
    "DOMAIN-SUFFIX,stablediffusionapi.com,US",

    // Perplexity
    "DOMAIN,perplexity.ai,US",
    "DOMAIN-SUFFIX,perplexity.ai,US",

    // Mistral
    "DOMAIN,mistral.ai,US",
    "DOMAIN-SUFFIX,mistral.ai,US",

    // xAI (Elon Musk)
    "DOMAIN,x.ai,US",
    "DOMAIN-SUFFIX,x.ai,US",

    // Other AI Communities
    "DOMAIN-SUFFIX,arxiv.org,US",
    "DOMAIN-SUFFIX,paperswithcode.com,US",
    "DOMAIN-SUFFIX,weightsandbiases.com,US",

    // === AI Coding Tools ===
    // GitHub Copilot
    "DOMAIN,copilot.github.com,US",
    "DOMAIN,api.githubcopilot.com,US",
    "DOMAIN,copilot-proxy.githubusercontent.com,US",
    "DOMAIN,default.exp-tas.com,US",
    "DOMAIN-SUFFIX,githubcopilot.com,US",

    // Cursor
    "DOMAIN,cursor.sh,US",
    "DOMAIN,api.cursor.sh,US",
    "DOMAIN,download.cursor.sh,US",
    "DOMAIN-SUFFIX,cursor.sh,US",
    "DOMAIN-SUFFIX,cursor.com,US",

    // Codeium
    "DOMAIN,codeium.com,US",
    "DOMAIN,api.codeium.com,US",
    "DOMAIN,server.codeium.com,US",
    "DOMAIN-SUFFIX,codeium.com,US",

    // Tabnine
    "DOMAIN,tabnine.com,US",
    "DOMAIN,api.tabnine.com,US",
    "DOMAIN-SUFFIX,tabnine.com,US",

    // AWS CodeWhisperer
    "DOMAIN,codewhisperer.us-east-1.amazonaws.com,US",
    "DOMAIN-SUFFIX,codewhisperer.amazonaws.com,US",

    // Replit
    "DOMAIN,replit.com,US",
    "DOMAIN,repl.it,US",
    "DOMAIN-SUFFIX,replit.com,US",
    "DOMAIN-SUFFIX,repl.it,US",
    "DOMAIN-SUFFIX,replit.dev,US",

    // JetBrains AI
    "DOMAIN,ai.grazie.aws.intellij.net,US",
    "DOMAIN-SUFFIX,grazie.ai,US",

    // Continue.dev
    "DOMAIN,continue.dev,US",
    "DOMAIN-SUFFIX,continue.dev,US",

    // === Google AI Suite ===
    "DOMAIN,gemini.google.com,US",
    "DOMAIN,bard.google.com,US",
    "DOMAIN,aistudio.google.com,US",
    "DOMAIN,makersuite.google.com,US",
    "DOMAIN,generativelanguage.googleapis.com,US",
    "DOMAIN-SUFFIX,gemini.google.com,US",

    // === More AI Platforms ===
    // Cohere
    "DOMAIN,cohere.com,US",
    "DOMAIN,cohere.ai,US",
    "DOMAIN,api.cohere.ai,US",
    "DOMAIN,dashboard.cohere.com,US",
    "DOMAIN-SUFFIX,cohere.com,US",
    "DOMAIN-SUFFIX,cohere.ai,US",

    // Together.ai
    "DOMAIN,together.ai,US",
    "DOMAIN,api.together.xyz,US",
    "DOMAIN-SUFFIX,together.ai,US",
    "DOMAIN-SUFFIX,together.xyz,US",

    // Replicate
    "DOMAIN,replicate.com,US",
    "DOMAIN,replicate.delivery,US",
    "DOMAIN-SUFFIX,replicate.com,US",
    "DOMAIN-SUFFIX,replicate.delivery,US",

    // OpenRouter
    "DOMAIN,openrouter.ai,US",
    "DOMAIN-SUFFIX,openrouter.ai,US",

    // Poe
    "DOMAIN,poe.com,US",
    "DOMAIN-SUFFIX,poe.com,US",

    // Character.AI
    "DOMAIN,character.ai,US",
    "DOMAIN,beta.character.ai,US",
    "DOMAIN-SUFFIX,character.ai,US",

    // You.com
    "DOMAIN,you.com,US",
    "DOMAIN-SUFFIX,you.com,US",

    // === AI Image Generation ===
    // Midjourney
    "DOMAIN,midjourney.com,US",
    "DOMAIN,cdn.midjourney.com,US",
    "DOMAIN-SUFFIX,midjourney.com,US",

    // Runway ML
    "DOMAIN,runwayml.com,US",
    "DOMAIN,app.runwayml.com,US",
    "DOMAIN-SUFFIX,runwayml.com,US",

    // Leonardo.ai
    "DOMAIN,leonardo.ai,US",
    "DOMAIN,app.leonardo.ai,US",
    "DOMAIN-SUFFIX,leonardo.ai,US",

    // Civitai
    "DOMAIN,civitai.com,US",
    "DOMAIN-SUFFIX,civitai.com,US",

    // Playground AI
    "DOMAIN,playgroundai.com,US",
    "DOMAIN-SUFFIX,playgroundai.com,US",

    // === AI Dev Platforms ===
    // Vercel
    "DOMAIN,vercel.com,US",
    "DOMAIN,vercel.app,US",
    "DOMAIN-SUFFIX,vercel.com,US",
    "DOMAIN-SUFFIX,vercel.app,US",

    // Supabase
    "DOMAIN,supabase.com,US",
    "DOMAIN,supabase.co,US",
    "DOMAIN-SUFFIX,supabase.com,US",
    "DOMAIN-SUFFIX,supabase.co,US",
    "DOMAIN-SUFFIX,supabase.io,US",

    // Cloudflare AI
    "DOMAIN,ai.cloudflare.com,US",
    "DOMAIN-SUFFIX,workers.dev,US",

    // LangChain
    "DOMAIN,langchain.com,US",
    "DOMAIN,smith.langchain.com,US",
    "DOMAIN-SUFFIX,langchain.com,US",

    // LlamaIndex
    "DOMAIN,llamaindex.ai,US",
    "DOMAIN-SUFFIX,llamaindex.ai,US",

    // === Datasets & Research ===
    // Kaggle
    "DOMAIN,kaggle.com,US",
    "DOMAIN,www.kaggle.com,US",
    "DOMAIN-SUFFIX,kaggle.com,US",

    // Scale AI
    "DOMAIN,scale.com,US",
    "DOMAIN,dashboard.scale.com,US",
    "DOMAIN-SUFFIX,scale.com,US",

    // === Audio / Video ===
    // ElevenLabs
    "DOMAIN,elevenlabs.io,US",
    "DOMAIN,api.elevenlabs.io,US",
    "DOMAIN-SUFFIX,elevenlabs.io,US",

    // Synthesia
    "DOMAIN,synthesia.io,US",
    "DOMAIN,app.synthesia.io,US",
    "DOMAIN-SUFFIX,synthesia.io,US",

    // D-ID
    "DOMAIN,d-id.com,US",
    "DOMAIN,studio.d-id.com,US",
    "DOMAIN-SUFFIX,d-id.com,US",

    // Descript
    "DOMAIN,descript.com,US",
    "DOMAIN-SUFFIX,descript.com,US",

    // === Writing / Productivity ===
    // Notion AI
    "DOMAIN,notion.so,US",
    "DOMAIN,notion.site,US",
    "DOMAIN-SUFFIX,notion.so,US",
    "DOMAIN-SUFFIX,notion.site,US",

    // Grammarly
    "DOMAIN,grammarly.com,US",
    "DOMAIN,app.grammarly.com,US",
    "DOMAIN-SUFFIX,grammarly.com,US",
    "DOMAIN-SUFFIX,grammarly.io,US",

    // Jasper AI
    "DOMAIN,jasper.ai,US",
    "DOMAIN-SUFFIX,jasper.ai,US",

    // Copy.ai
    "DOMAIN,copy.ai,US",
    "DOMAIN-SUFFIX,copy.ai,US",

    // Writesonic
    "DOMAIN,writesonic.com,US",
    "DOMAIN-SUFFIX,writesonic.com,US",

    // === Developer Services ===
    // Railway
    "DOMAIN,railway.app,US",
    "DOMAIN-SUFFIX,railway.app,US",
    "DOMAIN-SUFFIX,up.railway.app,US",

    // Render
    "DOMAIN,render.com,US",
    "DOMAIN,dashboard.render.com,US",
    "DOMAIN-SUFFIX,render.com,US",
    "DOMAIN-SUFFIX,onrender.com,US",

    // Fly.io
    "DOMAIN,fly.io,US",
    "DOMAIN-SUFFIX,fly.io,US",
    "DOMAIN-SUFFIX,fly.dev,US",

    // Netlify
    "DOMAIN,netlify.com,US",
    "DOMAIN,app.netlify.com,US",
    "DOMAIN-SUFFIX,netlify.com,US",
    "DOMAIN-SUFFIX,netlify.app,US",

    // PlanetScale
    "DOMAIN,planetscale.com,US",
    "DOMAIN,app.planetscale.com,US",
    "DOMAIN-SUFFIX,planetscale.com,US",

    // Neon
    "DOMAIN,neon.tech,US",
    "DOMAIN,console.neon.tech,US",
    "DOMAIN-SUFFIX,neon.tech,US",

    // === Payment ===
    // Paddle
    "DOMAIN,paddle.com,US",
    "DOMAIN,vendors.paddle.com,US",
    "DOMAIN-SUFFIX,paddle.com,US",

    // Lemon Squeezy
    "DOMAIN,lemonsqueezy.com,US",
    "DOMAIN-SUFFIX,lemonsqueezy.com,US",

    // === Extensions ===
    // VS Code Marketplace
    "DOMAIN,marketplace.visualstudio.com,US",
    "DOMAIN-SUFFIX,vscode-cdn.net,US",
    "DOMAIN-SUFFIX,vsassets.io,US",

    // JetBrains Marketplace
    "DOMAIN,plugins.jetbrains.com,US",
    "DOMAIN-SUFFIX,jetbrains.com,US",

    // === Docker ===
    "DOMAIN,hub.docker.com,US",
    "DOMAIN,registry.hub.docker.com,US",
    "DOMAIN-SUFFIX,docker.com,US",
    "DOMAIN-SUFFIX,docker.io,US",

    // === NPM / CDN ===
    "DOMAIN,unpkg.com,US",
    "DOMAIN-SUFFIX,unpkg.com,US",
    "DOMAIN,cdn.jsdelivr.net,US",
    "DOMAIN-SUFFIX,jsdelivr.net,US",

    // === Search Tools ===
    "DOMAIN,phind.com,US",
    "DOMAIN-SUFFIX,phind.com,US",
    "DOMAIN,kagi.com,US",
    "DOMAIN-SUFFIX,kagi.com,US",

    // === Other AI Config ===
    "DOMAIN,chatpdf.com,US",
    "DOMAIN-SUFFIX,chatpdf.com,US",
    "DOMAIN,otter.ai,US",
    "DOMAIN-SUFFIX,otter.ai,US",
    "DOMAIN,fireflies.ai,US",
    "DOMAIN-SUFFIX,fireflies.ai,US",

    // === Discord ===
    "DOMAIN,discord.com,US",
    "DOMAIN,discord.gg,US",
    "DOMAIN-SUFFIX,discord.com,US",
    "DOMAIN-SUFFIX,discord.gg,US",
    "DOMAIN-SUFFIX,discordapp.com,US",

    // === Newer AI Services (2024-2025) ===
    // Groq
    "DOMAIN,groq.com,US",
    "DOMAIN,console.groq.com,US",
    "DOMAIN,api.groq.com,US",
    "DOMAIN-SUFFIX,groq.com,US",

    // Suno / Udio
    "DOMAIN,suno.com,US",
    "DOMAIN,suno.ai,US",
    "DOMAIN,studio.suno.ai,US",
    "DOMAIN,cdn.suno.com,US",
    "DOMAIN-SUFFIX,suno.com,US",
    "DOMAIN-SUFFIX,suno.ai,US",
    "DOMAIN,udio.com,US",
    "DOMAIN,www.udio.com,US",
    "DOMAIN,cdn.udio.com,US
    "DOMAIN-SUFFIX,udio.com,US",

    // v0 / Bolt
    "DOMAIN,v0.dev,US",
    "DOMAIN-SUFFIX,v0.dev,US",
    "DOMAIN,bolt.new,US",
    "DOMAIN-SUFFIX,bolt.new,US",
    "DOMAIN-SUFFIX,stackblitz.com,US",

    // Ollama
    "DOMAIN,ollama.com,US",
    "DOMAIN,ollama.ai,US",
    "DOMAIN-SUFFIX,ollama.com,US",

    // === Internal / Direct ===
    "DOMAIN-SUFFIX,antfin.com,DIRECT",
    "DOMAIN-SUFFIX,taobao.com,DIRECT",
    "DOMAIN-SUFFIX,alibaba-inc.com,DIRECT",
    "DOMAIN-SUFFIX,antfin-inc.com,DIRECT",
    "DOMAIN-SUFFIX,atatech.org,DIRECT",
    "DOMAIN-SUFFIX,fliggy.com,DIRECT",
    "DOMAIN-SUFFIX,sspai.com,DIRECT",
    "DOMAIN-SUFFIX,aliyun.com,DIRECT",
    "DOMAIN-SUFFIX,wx.qq.com,HK",
    "DOMAIN-SUFFIX,v2ex.com,HK",
    "DOMAIN-SUFFIX,formulae.brew.sh,US",
    "DOMAIN-SUFFIX,diabrowser.com,US",
    "DOMAIN-SUFFIX,honeycomb.io,US",
    "DOMAIN-SUFFIX,intercom.io,US"
  ];

  // Insert rules at the beginning of the list
  if (config.rules && Array.isArray(config.rules)) {
    config.rules.unshift(...extraRules);
  } else {
    config.rules = extraRules;
  }

  return config;
}
