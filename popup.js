document.addEventListener('DOMContentLoaded', async () => {
  const tabsList = document.getElementById('tabs-list');
  const tabCount = document.getElementById('tab-count');
  
  // Buttons
  const copyTabsBtn = document.getElementById('copy-tabs-btn');
  const scrapeBtn = document.getElementById('scrape-btn');
  const aiOrganizeBtn = document.getElementById('ai-organize-btn');
  const copyScrapeBtn = document.getElementById('copy-scrape-btn');
  
  // Containers & Inputs
  const scrapeResult = document.getElementById('scrape-result');
  const scrapeContent = document.getElementById('scrape-content');
  const langSelect = document.getElementById('lang-select');
  const customPromptInput = document.getElementById('custom-prompt');

  // Initialize UI language
  chrome.storage.local.get(['preferredLanguage'], (result) => {
    if (result.preferredLanguage) {
      langSelect.value = result.preferredLanguage;
    } else {
      langSelect.value = '日本語'; 
    }
    if (window.updateUI) {
      window.updateUI(langSelect.value);
    }
  });

  // Save language on change
  langSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({ preferredLanguage: e.target.value });
    if (window.updateUI) {
      window.updateUI(e.target.value);
    }
  });

  // 您部署的 Cloudflare Worker 網址
  const BACKEND_URL = "https://tabsync-backend.eric-intime5298.workers.dev";

  // Load tabs automatically
  let currentTabs = [];
  try {
    currentTabs = await chrome.tabs.query({ currentWindow: true });
    tabCount.textContent = currentTabs.length;

    currentTabs.forEach(tab => {
      const li = document.createElement('li');
      const title = document.createElement('div');
      title.className = 'tab-title';
      title.textContent = tab.title;
      title.title = tab.title;
      const url = document.createElement('div');
      url.className = 'tab-url';
      url.textContent = tab.url;
      url.title = tab.url;

      li.appendChild(title);
      li.appendChild(url);
      tabsList.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to query tabs:", error);
  }

  // Copy all tabs functionality
  copyTabsBtn.addEventListener('click', () => {
    if (currentTabs.length === 0) return;
    const textToCopy = currentTabs.map(t => `${t.title}\n${t.url}`).join('\n\n');
    copyToClipboard(textToCopy, copyTabsBtn, window.i18nDict[window.currentLang].copied);
  });

  // Scrape single tab
  scrapeBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!isScrapable(tab.url)) return;

      setLoadingState(scrapeBtn, window.i18nDict[window.currentLang].loadingScrape);
      
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      restoreButtonState(scrapeBtn, `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span data-i18n="scrapeBtn">${window.i18nDict[window.currentLang].scrapeBtn}</span>`);

      if (result) {
        showResult(`[標題]\n${result.title}\n\n[內文]\n${result.paragraphs.join('\n\n')}`, false);
      } else {
        alert(window.i18nDict[window.currentLang].errorNoContent);
      }
    } catch (error) {
      handleError(error, scrapeBtn, `<span data-i18n="scrapeBtn">${window.i18nDict[window.currentLang].scrapeBtn}</span>`);
    }
  });

  // AI Organize all tabs via Cloudflare Worker
  aiOrganizeBtn.addEventListener('click', async () => {
    setLoadingState(aiOrganizeBtn, window.i18nDict[window.currentLang].loadingAi);
    
    try {
      // 1. Scrape all valid tabs
      const tabsData = [];
      const validTabs = currentTabs.filter(t => isScrapable(t.url, false));
      
      for (const tab of validTabs) {
        try {
          const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          if (result && (result.title || result.paragraphs.length > 0)) {
            tabsData.push(`[網頁標題: ${result.title}]\nURL: ${tab.url}\n內文:\n${result.paragraphs.join('\n')}\n`);
          }
        } catch (e) {
          console.warn(`Failed to scrape tab ${tab.id}:`, e);
        }
      }

      if (tabsData.length === 0) {
        throw new Error(window.i18nDict[window.currentLang].errorNoContent);
      }

      const combinedText = tabsData.join('\n---\n');

      // 2. Call Cloudflare Backend
      const language = langSelect.value;
      const customPrompt = customPromptInput.value.trim();
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: combinedText,
          url: "multiple-tabs",
          language: language,
          customPrompt: customPrompt
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      
      // 3. Show Result
      showResult(data.result || "No Content", true);

    } catch (error) {
      console.error('AI Organize error:', error);
      alert(`${window.i18nDict[window.currentLang].errorPrefix}${error.message}`);
    } finally {
      restoreButtonState(aiOrganizeBtn, `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg> <span data-i18n="aiBtn">${window.i18nDict[window.currentLang].aiBtn}</span>`);
    }
  });

  // Copy scrape result functionality
  copyScrapeBtn.addEventListener('click', () => {
    scrapeContent.select();
    copyToClipboard(scrapeContent.value, copyScrapeBtn, window.i18nDict[window.currentLang].copied);
  });

  // --- Helper Functions ---
  function isScrapable(url, showAlert = true) {
    if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
      if (showAlert) alert(window.i18nDict[window.currentLang].errorInternal);
      return false;
    }
    return true;
  }

  function showResult(text, isAiMode) {
    scrapeResult.classList.remove('hidden');
    const resultTitle = document.getElementById('result-title');
    if (isAiMode) {
      scrapeResult.classList.add('ai-mode');
      resultTitle.textContent = window.i18nDict[window.currentLang].resultTitleAi;
    } else {
      scrapeResult.classList.remove('ai-mode');
      resultTitle.textContent = window.i18nDict[window.currentLang].resultTitleNormal;
    }
    scrapeContent.value = text;
  }

  function setLoadingState(btn, text) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `
      <svg class="spinner" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      <span>${text}</span>
    `;
    btn.disabled = true;
  }

  function restoreButtonState(btn, originalHtml) {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }

  function handleError(error, btn, btnInnerHtml) {
    console.error('Error:', error);
    btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${window.i18nDict[window.currentLang].errorTitle}</span>`;
    setTimeout(() => {
      restoreButtonState(btn, btn.dataset.originalHtml || `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${btnInnerHtml}`);
    }, 2000);
  }

  function copyToClipboard(text, btn, successText) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.innerHTML;
      btn.textContent = successText;
      if (btn.classList.contains('small-btn')) {
        btn.style.backgroundColor = '#16a34a';
      }
      setTimeout(() => {
        btn.innerHTML = originalText;
        if (window.updateUI) window.updateUI(window.currentLang); // Ensure data-i18n applies properly to restored text
        if (btn.classList.contains('small-btn')) {
          btn.style.backgroundColor = '';
        }
      }, 2000);
    });
  }
});

// Helper animation for loading spinner
if (!document.getElementById('spinner-style')) {
  const style = document.createElement('style');
  style.id = 'spinner-style';
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
