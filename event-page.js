//This is for ENVIRONMENT VARIABLES for"management" permission
// chrome.management.get(chrome.runtime.id, (extensionInfo) => {
//   if (extensionInfo.installType === "development") {
//     //perfom dev mode action here
//   }
// });

let menulangFr = {
  id: "french",
  title: "translate to french",
  contexts: ["selection"],
};
let menulangSp = {
  id: "spanish",
  title: "translate to spanish",
  contexts: ["selection"],
};
let menulangEn = {
  id: "english",
  title: "translate to english",
  contexts: ["selection"],
};
let menuitemTwo = {
  id: "speak",
  title: "speak",
  contexts: ["selection"],
};
let googleTranslate = {
  id: "googleTrans",
  title: "open Google translate",
  contexts: ["selection"],
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(menulangFr);
  chrome.contextMenus.create(menulangEn);
  chrome.contextMenus.create(menulangSp);
  chrome.contextMenus.create(menuitemTwo);
  chrome.contextMenus.create(googleTranslate);
  //BELOW WHEN OPENING UP ANOTHER CHROME WINDOW, IT EXECUTES THE CONTEXT PAGE
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["context.js"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((res) => {
  if (res && res.selectionText) {
    if (res.menuItemId === "french") {
      tranStart.translateAction(res.selectionText, "french");
    } else if (res.menuItemId === "spanish") {
      tranStart.translateAction(res.selectionText, "spanish");
    } else if (res.menuItemId === "english") {
      tranStart.translateAction(res.selectionText, "english");
    } else if (res.menuItemId === "speak") {
      start.speakAction(res.selectionText);
    } else if (res.menuItemId === "googleTrans") {
      googleStart.googleAction(res.selectionText, "engilsh");
    }
  }
});

class Translate {
  _translations = [];
  _translation = { lang: "", translate: { from: "", to: "" } };
  selectionText = "";
  responseText = " not found";
  constructor() {
    this._translation = {
      lang: "",
      translate: { from: this.selectionText, to: this.responseText },
    };
    this.initialize();
  }

  get translations() {
    // console.log(" get items", this._items); //initialized 3 X times
    return this._translations;
  }
  set translations(translation) {
    this._translations.push(translation);
    chrome.storage.sync.set({ translations: this._translations });

    // console.log(this.count++, "set items", this._items);
  }
  get translation() {
    return this._translation;
  }
  set translation(translation) {
    // console.log("set trans", trans);
    this._translation = translation;
  }

  initialize() {
    chrome.storage.sync.get(["translations"], (res) => {
      if (res && res.translations && res.translations) {
        this._translations = res.translations;
      } else {
        this._translations = [];
        chrome.storage.sync.set({ translations: [] });
      }
    });
  }

  refresh() {
    chrome.storage.onChanged.addListener((res) => {
      const newTranslations = res.translations.newValue;
      if (res.translations && newTranslations) {
        console.log("onChanged", newTranslations); //picked it up -good!!
        //2 pulling data after 1
        this._translations = newTranslations;
      }
    });
  }

  translateAction(selectionText, lang) {
    this.selectionText = selectionText;
    this._translation.translate.from = selectionText;
    this._translation.lang = lang;
    // console.log("TRANSLATEACTION()-THIS.TRANSLATIONS", this.translations);
    const url = "https://www.google.com/search";
    // let params = new URLSearchParams();
    let textSelect = selectionText.replace(" ", "+");
    // params.set("q", `convert+${textSelect}+to+${lang2}`);
    const newUrl = `${url}?q=translate+${textSelect}+to+${lang}`;
    this._translation.lang = lang;
    let popupParams = {
      url: newUrl,
      type: "popup",
      top: 5,
      left: 0,
    };

    chrome.windows.create(popupParams);
    this.getTranslation();
  }

  getTranslation() {
    let resContainer = {
      getTranslation: false,
      getElementValue: "",
    };
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      //GETTING TRANSLATION FROM CONTEXT.JS (req.getElement=translation text)
      if (req.getElement) {
        //Getting translation req.getElement
        this.responseText = req.getElement;
        resContainer.getTranslation = true;
        resContainer.getElementValue = req.getElement;
        this._translation.translate.to = this.responseText; //updates to: translate
        this._translation.translate.from = this.selectionText;
        this.translations = this.translation; // this stores the new items in storage and updates this._items
        sendResponse(resContainer);
      }
    });
  }

  // share
  static fixUrl(str) {
    let convToString = str.toString();
    let check = convToString.includes("%2B");
    if (check) {
      return encodeURI(convToString).replace(/%2B/g, "+").replace(/%2B/g, "+");
    } else {
      return convToString;
    }
  }
}

class Speak {
  _speaks = [];
  selectionText = "";
  constructor() {
    this.getSpeaks();
  }

  get speaks() {
    return this._speaks;
  }
  set speaks(speaks) {
    this._speaks = speaks;
  }
  getSpeaks() {
    chrome.storage.sync.get(["speaks"], (res) => {
      if (res && res.speaks && res.speaks.length) {
        this._speaks = res.speaks;
      } else {
        this._speaks = [];
        chrome.storage.sync.set({ speaks: [] });
      }
    });
  }

  speakAction(selectionText) {
    // console.log("SPEAKACTION()-THIS.SPEAKS", this.speaks);
    if (!selectionText) return;
    chrome.tts.speak(selectionText, { rate: 0.7 });
    this.speaks = [...this._speaks, selectionText];
    chrome.storage.sync.set({ speaks: this.speaks });
  }
}
const start = new Speak();
const tranStart = new Translate();

class GoogleTranslateApp {
  url = "https://translate.google.com";
  _responseText = "";
  _selectionText = "";

  constructor() {}
  get responseText() {
    return this._responseText;
  }
  set responseText(responseText) {
    this._responseText = responseText;
    chrome.storage.sync.set({
      googleResponse: responseText,
      selectionText: this.selectionText,
    });
  }
  get selectionText() {
    return this._selectionText;
  }
  set selectionText(selectionText) {
    this._selectionText = selectionText;
  }
  fromPopup() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.openTranslator === true) {
        // console.log("request.openTranslator", request.openTranslator);
        let popupParams = {
          url: "https://translate.google.com",
          type: "popup",
          top: 5,
          left: 0,
        };
        chrome.windows.create(popupParams);
        sendResponse({ message: "done" });
      }
    });
  }
  //Not USED
  googleAction(selectionText, from) {
    let popupParams = {
      url: this.url,
      type: "popup",
      top: 5,
      left: 0,
    };
    chrome.windows.create(popupParams);
    //ADDING INPUT TEXT INTO CONTEXT AND GETTING THE RESPONSE
    this.sendGoogleTranslate(selectionText);
  }

  sendGoogleTranslate(selectionText) {
    chrome.runtime.sendMessage({ googleTranslate: selectionText }, (res) => {
      if (res.getTranslation) {
        this.responseText = res.getTranslation;
      }
    });
  }
}

const googleStart = new GoogleTranslateApp();
googleStart.fromPopup();
