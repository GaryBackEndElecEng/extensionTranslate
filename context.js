const getElement = document.querySelector(
  "div#tw-target pre#tw-target-text > span"
);
// console.log("getElement", getElement && getElement.innerHTML);
// chrome.runtime.onInstalled.addListener(() => {
if (getElement && getElement.innerHTML) {
  chrome.runtime.sendMessage({ getElement: getElement.innerHTML }, (res) => {});
}
// });
const url = "https://translate.google.com";
