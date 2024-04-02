//This is for ENVIRONMENT VARIABLES for"management" permission
// chrome.management.get(chrome.runtime.id, (extensionInfo) => {
//   if (extensionInfo.installType === "development") {
//     //perfom dev mode action here
//   }
// });

let menulangFr = {
  id: "french",
  title: "word translate to french",
  contexts: ["selection"],
};
let menulangSp = {
  id: "spanish",
  title: "word translate to spanish",
  contexts: ["selection"],
};
let menulangEn = {
  id: "english",
  title: "word translate to english",
  contexts: ["selection"],
};
let menuitemTwo = {
  id: "speak",
  title: "speak a phrase and Add to notes",
  contexts: ["selection"],
};
let addtoTasks = {
  id: "addToTasks",
  title: "add a slective text to tasks",
  contexts: ["selection"],
};
let addtoNotes = {
  id: "addToNotes",
  title: "adds a selective text to notes",
  contexts: ["selection"],
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(menulangFr);
  chrome.contextMenus.create(menulangEn);
  chrome.contextMenus.create(menulangSp);
  chrome.contextMenus.create(menuitemTwo);
  chrome.contextMenus.create(addtoTasks);
  chrome.contextMenus.create(addtoNotes);
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
      startSpeak.speakAction(res.selectionText);
    } else if (res.menuItemId === "addToTasks") {
      addNotes.addToTasksAction(res.selectionText);
    } else if (res.menuItemId === "addToNotes") {
      startSpeak.addToNotesAction(res.selectionText);
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
  openTranlator() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const url = "https://translate.google.com/";
      let response = { message: "done", id: 0 };

      if (request.openTranslator) {
        let popupParams = {
          url: url,
          type: "popup",
          top: 5,
          left: 0,
        };

        chrome.windows.create(popupParams);
        chrome.windows.getCurrent((res) => {
          response["id"] = res.id;
          response["message"] = "done"; //have to stor value in storage or runtime.sendMessage().
        });
        sendResponse(response);
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
const tranStart = new Translate();
tranStart.openTranlator();

class Speak {
  _speakNotes = [];
  _speakNote = { id: 0, url: "", speak: "", creation_date: "" };
  selectionText = "";
  constructor() {
    this.getSpeakNotes();
  }

  get speakNotes() {
    return this._speakNotes;
  }
  set speakNotes(speakNotes) {
    this._speakNotes = speakNotes;
  }
  getSpeakNotes() {
    chrome.storage.sync.get(["speakNotes"], (res) => {
      if (res && res.speakNotes && res.speakNotes.length) {
        this._speakNotes = res.speakNotes;
      } else {
        this._speakNotes = [];
        chrome.storage.sync.set({ speakNotes: [] });
        chrome.storage.sync.remove("speaks");
      }
    });
  }

  speakAction(selectionText) {
    // console.log("SPEAKACTION()-THIS.SPEAKS", this.speaks);
    if (!selectionText) return;
    let today = new Date();
    chrome.tts.speak(selectionText, { rate: 0.7 });
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0].url) {
        let newID = Math.round(Math.random() * 1000);
        this._speakNote = {
          id: newID,
          url: tabs[0].url,
          speak: selectionText,
          creation_date: today.toLocaleDateString("en-US"),
        };
        chrome.storage.sync.get(["speakNotes"], (res) => {
          if (res && res.speakNotes) {
            this.speakNotes = [...res.speakNotes, this._speakNote];
            chrome.storage.sync.set({ speakNotes: this.speakNotes });
          } else {
            this._speakNotes = [];
            chrome.storage.remove("speak");
            chrome.storage.sync.set({ speakNotes: [] });
          }
        });
      }
    });
  }
  addToNotesAction(selectionText) {
    if (selectionText) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0].url) {
          const url = tabs[0].url;
          const id = Math.round(Math.random() * 1000);
          this._speakNote = {
            id: id,
            url: url,
            speak: selectionText,
            creation_date: AddNotes.creationDate(),
          };

          chrome.storage.sync.get(["speakNotes"], (res) => {
            if (res && res.speakNotes) {
              this.speakNotes = res.speakNotes;
              // console.log("res.forms", res.forms);
              this.speakNotes = [...res.speakNotes, this._speakNote];
              chrome.storage.sync.set({ speakNotes: this._speakNotes });
            } else {
              chrome.storage.remove("speak");
              chrome.storage.sync.set({ speakNotes: [] });
            }
          });
        }
      });
    }
  }
  static addDateIfNotExist(speak) {
    if (speak.creation_date === "") {
      let today = new Date();
      this._speak["creation_date"] = today.toLocaleDateString("en-US");
      this._speakNote["speak"] = speak;
    }
    return this._speak;
  }
}
const startSpeak = new Speak();

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
  addToTasksAction(selectionText) {
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
