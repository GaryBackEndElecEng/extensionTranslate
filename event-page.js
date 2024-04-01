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
let addtonotes = {
  id: "addToNotes",
  title: "adds text to tasks",
  contexts: ["selection"],
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(menulangFr);
  chrome.contextMenus.create(menulangEn);
  chrome.contextMenus.create(menulangSp);
  chrome.contextMenus.create(menuitemTwo);
  chrome.contextMenus.create(addtonotes);
  //BELOW WHEN OPENING UP ANOTHER CHROME WINDOW, IT EXECUTES THE CONTEXT PAGE
  //   chrome.action.onClicked.addListener((tab) => {
  //     chrome.scripting.executeScript({
  //       target: { tabId: tab.id },
  //       files: ["context.js"],
  //     });
  //   });
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
    } else if (res.menuItemId === "addToNotes") {
      console.log("selected executing method");
      addNotes.addToNotesAction(res.selectionText);
    }
  }
});

class Translate {
  _translations = [];
  _translation = { id: 0, lang: "", translate: { from: "", to: "" } };
  selectionText = "";
  responseText = " not found";
  constructor() {
    this._translation = {
      id: 0,
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
        this._translation.id = Translate.insertID(this._translation.id);
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
  static insertID(id) {
    //_trans = {id:0, lang: "", translate: { from: "", to: "" } };
    if (!id || id === 0) {
      id = Math.round(Math.random() * 1000);
      return id;
    }
    return id;
  }
}

class Speak {
  _speaks = [];
  _speak = { speak: "", creation_date: "" };
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
        if (!res.speaks.filter((speak) => speak.creation_date)) {
          const newSpeaks = res.speaks.map((speak, index) => {
            return Speak.addDateIfNotExist(speak);
          });
          this._speaks = newSpeaks;
        } else {
          this._speaks = res.speaks;
        }
      } else {
        this._speaks = [];
        chrome.storage.sync.set({ speaks: [] });
      }
    });
  }

  speakAction(selectionText) {
    // console.log("SPEAKACTION()-THIS.SPEAKS", this.speaks);
    if (!selectionText) return;
    let today = new Date();
    chrome.tts.speak(selectionText, { rate: 0.7 });
    this._speak = {
      speak: selectionText,
      creation_date: today.toLocaleDateString("en-US"),
    };
    this.speaks = [...this._speaks, this._speak];
    chrome.storage.sync.set({ speaks: this.speaks });
  }
  static addDateIfNotExist(speak) {
    if (speak.creation_date === "") {
      let today = new Date();
      this._speak["creation_date"] = today.toLocaleDateString("en-US");
      this._speak["speak"] = speak;
    }
    return this._speak;
  }
}
const start = new Speak();
const tranStart = new Translate();

//######### getting URL ############//
class AddNotes {
  _form = {
    id: 0,
    url: "",
    name: "",
    description: "",
    task: "",
    phone: "",
    complete: false,
    creation_date: "",
    modified_date: "",
  };
  tempForm = {
    id: 0,
    url: "",
    name: "",
    description: "",
    task: "",
    phone: "",
    complete: false,
  };

  _selectionText = "";

  constructor() {}
  get form() {
    return this._form;
  }
  set form(form) {
    this._form = form;
  }
  addToNotesAction(selectionText) {
    let url = "http://something";
    if (selectionText) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0].url) {
          url = tabs[0].url;
          const id = Math.round(Math.random() * 1000);
          this.form = {
            ...this.form,
            id: id,
            url: url,
            description: selectionText,
            name: "from the web",
            task: " edit task in options",
            complete: false,
            creation_date: AddNotes.creationDate(),
            modified_date: AddNotes.creationDate(),
          };

          chrome.storage.sync.get(["forms"], (res) => {
            if (res && res.forms) {
              let forms = res.forms;
              // console.log("res.forms", res.forms);
              forms = [...forms, this.form];
              chrome.storage.sync.set({ forms: forms });
              this.form = this.tempForm; //initializing
            }
          });
        }
      });
    }
  }
  static creationDate() {
    let today = new Date();
    return today.toDateString();
  }
}

const addNotes = new AddNotes();
