const getElement = document.querySelector(
  "div#tw-target pre#tw-target-text > span"
);
// GETS THE TRANSLATION FROM GOOGLE
if (getElement && getElement.innerHTML) {
  chrome.runtime.sendMessage({ getElement: getElement.innerHTML }, (res) => {});
}
// });
const url = "https://translate.google.com";
