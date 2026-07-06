// 處理 CORS 問題的輔助函數
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { text, url, language, customPrompt } = await request.json();
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text content" }), { 
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const targetLang = language || "繁體中文";
      const customInstruction = customPrompt ? `\n⚠️ 用戶特別指示：${customPrompt}` : "";
      
      const aiPrompt = `您是一個專業的資訊整理助手。請閱讀以下網頁內容，提取核心主題並結構化整理。
⚠️ 重要指示：無論網頁原文是什麼語言，請務必、強制使用「${targetLang}」進行回答與摘要。${customInstruction}
輸出格式請使用 Markdown。

網頁內容：
${text.substring(0, 15000)}`;
      
      let aiResponse = "";
      try {
        const aiResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
          messages: [{ role: "user", content: aiPrompt }]
        });
        aiResponse = aiResult.response;
      } catch (e) {
        console.error("AI Error:", e);
        aiResponse = `AI 摘要生成失敗，錯誤訊息：${e.message || e.toString()}`;
      }

      try {
        await env.DB.prepare(
          "INSERT INTO logs (source_url, scraped_content, ai_summary) VALUES (?, ?, ?)"
        ).bind(url || "unknown", text.substring(0, 20000), aiResponse).run();
      } catch (dbError) {
        console.error("Database Error:", dbError);
      }

      return new Response(JSON.stringify({ result: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
