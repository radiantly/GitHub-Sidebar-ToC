// ==UserScript==
// @name        GitHub Sidebar ToC
// @namespace   LB.GSTC
// @match       https://github.com/*/*
// @match       https://github.com/*/*/tree/*
// @grant       GM_addStyle
// @version     1.3
// @author      radiantly
// @description Puts an interactive Table of Contents on the side of a GitHub Readme!
// ==/UserScript==

GM_addStyle(`
.lb-toc-bgrow {
  height: 100%;
}
.lb-toc-wrap {  
  position: sticky;
  top: 0;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}
.lb-toc-items {
  overflow-y: auto;
}
.lb-toc-items a {
  display: block;
  text-decoration: none;
  color: var(--color-fg-muted);
  padding: 4px;
  border-radius: 6px;
/*   font-weight: 600; */
}
.lb-toc-items a.active {
  color: var(--color-fg-on-emphasis);
}
.lb-toc-items a.active ~ a {
  color: var(--color-fg-default);
}
.lb-toc-items a:hover {
  background-color: var(--color-neutral-subtle);
}
.lb-toc-items a.active {
  background-color: var(--color-accent-emphasis);
}
`);

// Add the ToC section to the sidebar!
const addToCSection = () => {
  const sidebarGrid = document.querySelector(".Layout-sidebar .BorderGrid");
  sidebarGrid.style.height = "100%";
  sidebarGrid.insertAdjacentHTML(
    "beforeend",
    `
  <div class="lb-toc-bgrow BorderGrid-row js-position-sticky">
    <div class="BorderGrid-cell">
      <h2 class="h4">Table of Contents</h2>
      <div class="lb-toc-wrap pt-3 pb-3">
        <div class="lb-toc-items"></div>
      </div>
    </div>
  </div>
  `
  );
};

const anchorElems = [];

let currentActive = null;
let justClicked = false;

const setActive = (idx) => {
  if (currentActive === idx) return;
  if (currentActive !== null)
    anchorElems[currentActive].listElem.classList.remove("active");
  anchorElems[idx].listElem.classList.add("active");
  currentActive = idx;
};

const tocItems = document.querySelectorAll(
  ".SelectMenu-list > a.SelectMenu-item"
);

const populateToC = () => {
  const tocWrap = document.querySelector(".lb-toc-items");
  tocItems.forEach((elem, index) => {
    tocWrap.insertAdjacentHTML(
      "beforeend",
      `<a href="${elem.href}" style="padding-left: ${elem.style.paddingLeft}">${elem.textContent}</a>`
    );
    const tocItem = document.querySelector(
      `.lb-toc-items a[href="${elem.href}"]`
    );
    const headingElem = document.querySelector(
      `.anchor[href="${elem.href.replace(/^[^#]*/, "")}"]`
    );
    tocItem.addEventListener("click", (e) => {
      setActive(index);
      justClicked = true;
    });
    anchorElems.push({
      headingElem,
      listElem: tocItem,
    });
  });
};

const handleScroll = () => {
  // Don't change the active toc item if the user just clicked it
  if (justClicked) return (justClicked = false);

  const offsetTop = 55; // offset top due to sticky header

  // Highlight the correct active toc item on scroll
  // Binary Search FTW!
  let low = 0;
  let high = anchorElems.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const curTop = anchorElems[mid].headingElem.getBoundingClientRect().top;
    if (curTop > offsetTop) high = mid - 1;
    else low = mid + 1;
  }

  return setActive(Math.max(0, high));
};

(() => {
  if (tocItems.length === 0) return;
  addToCSection();
  populateToC();
  setActive(0);
  document.addEventListener("scroll", handleScroll, {
    passive: true,
  });
})();
