(() => {
  // Extract all <h1> texts
  const h1Elements = Array.from(document.querySelectorAll('h1')).map(el => el.innerText.trim());
  
  // Extract all <p> texts and filter out empty strings
  const pElements = Array.from(document.querySelectorAll('p'))
    .map(el => el.innerText.trim())
    .filter(text => text.length > 0);
  
  // Return the data directly. chrome.scripting.executeScript captures the last evaluated statement.
  return {
    title: h1Elements.length > 0 ? h1Elements[0] : document.title,
    paragraphs: pElements
  };
})();
