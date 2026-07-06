// --- i18n Dictionary (構造文) ---
window.i18nDict = {
  "繁體中文": {
    subtitle: "您的生產力工具 (Cloudflare AI 版)",
    langLabel: "輸出語言：",
    aiBtn: "AI 雲端整理所有分頁",
    copyTabsBtn: "複製分頁連結",
    scrapeBtn: "爬取當前網頁",
    resultTitleNormal: "爬取結果",
    resultTitleAi: "✨ 雲端摘要報告",
    copyContentBtn: "複製內容",
    tabsListTitle: "目前開啟的分頁",
    placeholderResult: "準備載入內容...",
    customPromptPlaceholder: "自訂 AI 指令 (選填)，例如：請幫我整理成表格...",
    loadingAi: "雲端運算中...",
    loadingScrape: "爬取中...",
    copied: "✅ 已複製",
    errorInternal: "無法在瀏覽器內部頁面執行爬蟲！",
    errorNoContent: "未能獲取網頁內容。",
    errorTitle: "執行失敗",
    errorPrefix: "發生錯誤："
  },
  "簡體中文": {
    subtitle: "您的生产力工具 (Cloudflare AI 版)",
    langLabel: "输出语言：",
    aiBtn: "AI 云端整理所有标签页",
    copyTabsBtn: "复制标签页链接",
    scrapeBtn: "抓取当前网页",
    resultTitleNormal: "抓取结果",
    resultTitleAi: "✨ 云端摘要报告",
    copyContentBtn: "复制内容",
    tabsListTitle: "当前打开的标签页",
    placeholderResult: "准备加载内容...",
    customPromptPlaceholder: "自定义 AI 指令 (选填)，例如：请帮我整理成表格...",
    loadingAi: "云端运算中...",
    loadingScrape: "抓取中...",
    copied: "✅ 已复制",
    errorInternal: "无法在浏览器内部页面执行抓取！",
    errorNoContent: "未能获取网页内容。",
    errorTitle: "执行失败",
    errorPrefix: "发生错误："
  },
  "日本語": {
    subtitle: "あなたの生産性ツール (Cloudflare AI版)",
    langLabel: "出力言語：",
    aiBtn: "AI クラウド全タブ整理",
    copyTabsBtn: "タブリンクをコピー",
    scrapeBtn: "現在のページを取得",
    resultTitleNormal: "取得結果",
    resultTitleAi: "✨ クラウド要約レポート",
    copyContentBtn: "内容をコピー",
    tabsListTitle: "現在開いているタブ",
    placeholderResult: "内容を読み込み中...",
    customPromptPlaceholder: "カスタムAI指示（任意）、例：表にまとめて...",
    loadingAi: "クラウド処理中...",
    loadingScrape: "取得中...",
    copied: "✅ コピーしました",
    errorInternal: "ブラウザの内部ページでは取得を実行できません！",
    errorNoContent: "ウェブページの内容を取得できませんでした。",
    errorTitle: "実行失敗",
    errorPrefix: "エラーが発生しました："
  },
  "English": {
    subtitle: "Your Productivity Tool (Cloudflare AI)",
    langLabel: "Output Lang:",
    aiBtn: "AI Organize All Tabs",
    copyTabsBtn: "Copy Tab Links",
    scrapeBtn: "Scrape Current Page",
    resultTitleNormal: "Scrape Result",
    resultTitleAi: "✨ Cloud Summary Report",
    copyContentBtn: "Copy Content",
    tabsListTitle: "Currently Open Tabs",
    placeholderResult: "Ready to load content...",
    customPromptPlaceholder: "Custom AI Instruction (Optional), e.g. summarize into a table...",
    loadingAi: "Processing...",
    loadingScrape: "Scraping...",
    copied: "✅ Copied",
    errorInternal: "Cannot scrape internal browser pages!",
    errorNoContent: "Failed to fetch page content.",
    errorTitle: "Execution Failed",
    errorPrefix: "Error occurred: "
  },
  "한국어": {
    subtitle: "생산성 도구 (Cloudflare AI)",
    langLabel: "출력 언어:",
    aiBtn: "AI 클라우드 모든 탭 정리",
    copyTabsBtn: "탭 링크 복사",
    scrapeBtn: "현재 페이지 스크랩",
    resultTitleNormal: "스크랩 결과",
    resultTitleAi: "✨ 클라우드 요약 보고서",
    copyContentBtn: "내용 복사",
    tabsListTitle: "현재 열려 있는 탭",
    placeholderResult: "내용 불러오는 중...",
    customPromptPlaceholder: "사용자 지정 AI 명령 (선택), 예: 표로 정리해 줘...",
    loadingAi: "클라우드 처리 중...",
    loadingScrape: "스크랩 중...",
    copied: "✅ 복사됨",
    errorInternal: "브라우저 내부 페이지에서는 스크랩할 수 없습니다!",
    errorNoContent: "웹페이지 내용을 가져오지 못했습니다.",
    errorTitle: "실행 실패",
    errorPrefix: "오류 발생: "
  }
};

window.currentLang = '日本語'; // Default language

window.updateUI = function(lang) {
  window.currentLang = lang;
  const dict = window.i18nDict[lang];
  if (!dict) return;

  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      // Special case for tabsListTitle to preserve the span child
      if (key === 'tabsListTitle') {
        el.childNodes[0].nodeValue = dict[key] + ' (';
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });
  
  // Update dynamic result title if visible
  const scrapeResult = document.getElementById('scrape-result');
  const resultTitle = document.getElementById('result-title');
  if (scrapeResult && !scrapeResult.classList.contains('hidden')) {
    if (scrapeResult.classList.contains('ai-mode')) {
      resultTitle.textContent = dict.resultTitleAi;
    } else {
      resultTitle.textContent = dict.resultTitleNormal;
    }
  }
};
