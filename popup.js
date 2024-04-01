//chrome.action.Position.CENTER

class TranslateWrapperMain {
  count = 0;
  explain =
    "To populate your list of translations and or voice calls, all you need to do is <span style='color:red; text-underline:underline;'>highlight</span> a text or a phrase on a web-page, right-click and select, under 'translation' the language you would like to translate the selected/highlighted text.<pre> try it out!</pre> ";
  _translations = [];
  _speaks = [];
  _speak = { speak: "", creation_date: "" };
  _trans = { id: 0, lang: "", translate: { from: "", to: "" } };
  taskForm = { id: 0, url: "", name: "", description: "", task: "", phone: "" };
  openTranslator = false;
  constructor() {
    this.translateWrapper = document.querySelector("div#translateWrapper");
    this.initialize(this.translateWrapper);

    this.translateWrapper.className =
      " col-5 d-flex flex-column justify-content-start align-items-center border border-end-1 border-end-dark";
    this.count = 0;
  }
  get translations() {
    console.log("get translations", this._translations);
    return this._translations;
  }
  set translations(translations) {
    this._translations = translations;
    console.log("set translations", translations);
  }
  get speak() {
    return this._speak;
  }
  set speak(speak) {
    this._speak = speak;
  }
  get speaks() {
    console.log("get speaks", this._speaks);
    return this._speaks;
  }
  set speaks(speaks) {
    this._speaks = speaks;
    console.log("set speaks", speaks);
  }
  get trans() {
    return this._trans;
  }
  set trans(trans) {
    this._trans = trans;
  }
  open_Translator(parent) {
    const container = document.createElement("div");
    container.className =
      "d-flex flex-column justify-content-center align-items-center gap-1 my-2";
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-success shadow m-1 text-sm mx-auto";
    button.textContent = "open translater";
    container.appendChild(button);
    parent.appendChild(container);
    button.addEventListener("click", (e) => {
      this.openTranslator = true;
      if (e) {
        chrome.runtime.sendMessage(
          { openTranslator: this.openTranslator },
          (res) => {
            if (res.message === "done") {
              // alert("done");//works
            }
          }
        );
      }
    });
  }
  //INITIALIZES DATA AND BUILDS COMPONENTS
  initialize(parent) {
    chrome.storage.sync.get(["translations", "speaks"]).then((res) => {
      // console.log("res", res);
      this._translations = [];
      this._speaks = [];
      if (res && (res.translations || res.speaks)) {
        this.cleanUp(parent);
        this._translations = res.translations ? res.translations : [];
        this._speaks = res.speaks ? res.speaks : [];

        if (res.translations && res.translations.length > 0) {
          this.showTranslations(parent, res.translations); //1.)CREATE TRANSLATIONS
        } else {
          chrome.storage.sync.set({ translations: [] });
          this._translations = [];
          this.showTranslations(parent, this._translations); //REMOVES DATA
        }
        if (res.speaks && res.speaks.length > 0) {
          this.showSpeaks(parent, res.speaks); //2.) CREATES SPEAKS
        } else {
          chrome.storage.sync.set({ speaks: [] });
          this._speaks = [];
          this.showSpeaks(parent, this._speaks); //CLEARS SPEAKS
        }

        if (
          (res.translations && res.translations.length > 0) ||
          (res.speaks && res.speaks.length > 0)
        ) {
          this.downloadButtonEvent(parent); //CREATES OPEN GOOGLE TRANSLATOR
        }
      } else {
        parent.style.cssText = "border:1px solid lightgrey;";
        parent.className =
          "d-flex flex-column align-items-center border border-end-1";
      }
    });
  }
  //NOTE!!: VERY UNSTABLE DATA WHILE POPUP IS OPEN- NOT NEEDED BECAUSE OF SETTERS/GETTERS
  translateSpeakUpdate(parent) {
    chrome.storage.onChanged.addListener((changes) => {
      //NOTE:!!=>only sends data on cahnges(sends newValue and oldValue)
      if (changes) {
        this.cleanUp(parent);
        if (changes.translations && changes.translations.newValue) {
          this.translations = changes.translations.newValue;
          this.showTranslations(parent, changes.translations.newValue); //newValue is sent only on change
          this.showSpeaks(parent, this.speaks); //not changed
        } else if (changes.speaks && changes.speaks.newValue) {
          this.speaks = changes.speaks.newValue;
          this.showTranslations(parent, this.translations); //unchanged
          this.showSpeaks(parent, changes.speaks.newValue); //newValue is sent only on change
        }
      }
    });
  }
  //BUILDS TRANSLATIONS
  showTranslations(parent, translations) {
    this.count++;
    console.log(this.count, "translations");
    parent.style.cssText = "";
    const H6 = document.createElement("h6");
    H6.className = "lean display-6";
    H6.style.cssText =
      "text-decoration:underline;text-underline-offset:0.75rem;text-align:center;margin-inline:auto;.margin-block:1.5rem;";
    H6.textContent = "Translations";
    if (translations && translations.length > 0) {
      const transLen = this.translations.length >= 3 ? "350px" : "auto";
      const overfl = this.translations.length >= 3 ? "overflow-y:scroll;" : "";
      this.translateWrapper.style.cssText =
        "margin-block:2rem;overflow-y:scroll;height:500px;";
      this.translateWrapper.className = "col";
      const ulContainer_ = document.createElement("ul");
      ulContainer_.className =
        "parentTranslation d-flex flex-column justify-content-start align-items-start gap-1 lean display-6";
      ulContainer_.style.cssText = `${overfl}height:${transLen};`;

      ulContainer_.appendChild(H6);
      translations.forEach((translation, index) => {
        const newTrans = this.insertID(translation);
        const li = document.createElement("li");
        li.className = "translation mx-auto lean";
        li.style.cssText = "font-size:18px;";
        li.innerHTML = `<span style="color:blue;text-decoration:underline">Lang: ${newTrans.lang}</span>
                                <ul class="d-flex flex-column justify-content-center align-items-start gap-1">
                                <span style="color:blue; text-decoration:underline;">below:</span>
                                <li>from:${newTrans.translate.from}</li>
                                <li>to:${newTrans.translate.to}</li>
                                </ul>
                                `;
        ulContainer_.appendChild(li);
        this.addDeleteEvent(parent, ulContainer_, index, "translation");
      });
      ulContainer_.display = "block";
      parent.appendChild(ulContainer_);
    } else {
      H6.className = "lean display-6 text-danger";
      H6.style.cssText =
        "text-align:center;margin-inline:auto;.margin-block:1.5rem;";
      H6.textContent = "no translations";
      parent.appendChild(H6);
      parent.appendChild(H6);
      const para = document.createElement("p");
      para.className = "text-primary text-wrap m-1 p-1 w-100";
      para.innerHTML = this.explain;
      parent.appendChild(para);
    }
  }
  //BUILDS SPEAKS
  showSpeaks(parent, speaks) {
    this.count++;
    console.log(this.count, "Speaks");
    parent.style.cssText = "";
    const H6 = document.createElement("h6");
    H6.className = "lean display-6";
    H6.style.cssText =
      "text-decoration:underline;text-underline-offset:0.75rem;text-align:center;margin-inline:auto;.margin-block:1.5rem;margin-bottom:2rem;";
    H6.textContent = "Voice Calls";
    if (speaks && speaks.length > 0) {
      const newSpeaks = speaks.map((speak) => this.adddateIfNotExist(speak));
      const speakLen = this.speaks.length >= 3 ? "300px" : "auto";
      const overfl = this.speaks.length >= 3 ? "overflow-y:scroll;" : "";
      this.translateWrapper.style.cssText =
        "margin-block:2rem;overflow-y:scroll;height:500px;";
      this.translateWrapper.className = "col";
      const ulContainer = document.createElement("ul");
      ulContainer.className =
        "parentSpeaks d-flex flex-column justify-content-start align-items-start gap-1";
      ulContainer.style.cssText = `${overfl}height:${speakLen};`;
      ulContainer.appendChild(H6);
      newSpeaks.forEach((speak, index) => {
        const li = document.createElement("li");
        li.className = " speak mx-auto";
        li.style.cssText = "margin-block:1rem;";
        li.innerHTML = `<span> voice:</span>
                                <li>${index + 1}.) ${speak.creation_date}</li>
                                <ul><li> ${speak.speak}</li></ul>
                                
                                `;
        ulContainer.appendChild(li);
        const delCheckContainer = document.createElement("div");
        delCheckContainer.className = "d-flex justify-content-between gap-2";
        this.speakToTaskCheckBox(parent, delCheckContainer, index);
        this.addDeleteEvent(parent, delCheckContainer, index, "speak"); //adding delete checkbox
        ulContainer.appendChild(delCheckContainer);
      });
      parent.appendChild(ulContainer);
    } else {
      H6.className = "lean display-6 text-danger";
      H6.style.cssText =
        "text-align:center;margin-inline:auto;.margin-block:1.5rem;";
      H6.textContent = "no Calls";
      parent.appendChild(H6);
      const para = document.createElement("p");
      para.className = "text-primary text-wrap m-1 p-1 w-100";
      para.innerHTML = this.explain;
      parent.appendChild(para);
    }
  }
  //REMOVES ITEM THEM REBUILDS
  addDeleteEvent(parent, ulParent, index, type) {
    //adding a delete
    //this is within a loop where ul is the parent
    const formGrp = document.createElement("div");
    formGrp.className =
      "form-group d-flex flex-column justify-content-center align-items-center gap-1";
    const label = document.createElement("label");
    label.textContent = "remove";
    label.className = "text-sm";
    label.style.cssText =
      "text-decoration:underline;color:darkred;font-weight:normal;font-size:12px;";
    label.for = `check${Math.round(Math.random() * 100)}`;
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = `check${Math.round(Math.random() * 100)}`;
    check.style.cssText =
      "width:20px;height:20px;border-radius:10px 10px 10px 10px;";
    check.className = "form-control";
    formGrp.appendChild(label);
    formGrp.appendChild(check);
    ulParent.appendChild(formGrp);
    check.addEventListener("change", (e) => {
      if (e && e.currentTarget.checked) {
        this.removeRefresh(parent, index, type);
      }
    });
  }
  //CHILD TO addDeleteEvent
  removeRefresh(parent, index, type) {
    // remove from list
    this.cleanUp(parent);
    if (type === "translation") {
      const remaining = this.translations.filter((ele, indx) => indx !== index);
      this.translations = remaining;
      // alert(`${this.translations.length}-${remaining.length}`);
      chrome.storage.sync.set({ translations: remaining });
    } else if (type === "speak") {
      const remaining = this.speaks.filter((ele, indx) => indx !== index);
      this.speaks = remaining;
      chrome.storage.sync.set({ speaks: remaining });
    }

    // this.translateSpeakUpdate(parent); //cleansUp and rebuilds
    this.showTranslations(parent, this.translations);
    this.showSpeaks(parent, this.speaks);
    if (
      (this.translations && this.translations.length > 0) ||
      (this.speaks && this.speaks.lenght > 0)
    ) {
      this.downloadButtonEvent(parent);
    }
  }
  //CHILD TO removeRefresh()
  downloadButtonEvent(parent) {
    const div = document.createElement("div");
    const hr = document.createElement("hr");
    hr.style.cssText =
      "width:75%;text-align:center;margin-inline:auto;height:5px;background:lightgrey; box-shadow:1px 1px 6px 1px black;";
    div.className =
      "d-flex flex-column justify-content-center align-items-center gap-1";
    div.style.csstext = "width:100%;padding-block:1.25rem;";
    const button = document.createElement("button");
    button.id = "download";
    button.type = "button";
    button.className = "btn btn-primary btn-sm mx-auto rounded";
    button.style.cssText =
      "color:white; box-shadow:1px 1px 12px 2px black;color '&hover':blue;";
    button.textContent = "download";
    const grpForm = document.createElement("div");
    grpForm.className =
      "mx-auto mx-1 d-flex flex-column align-items-center group-control";
    grpForm.style.cssText = "padding-block:1rem;margin-inline:auto;";
    const label = document.createElement("label");
    label.textContent = "file name";
    label.style.cssText =
      "font-weight:bold; color:blue; margin-block:1rem; margin-inline:auto;";
    const input = document.createElement("input");
    input.type = "text";
    input.name = "filename";
    input.placeholder = "file name";
    input.className = "form-control";
    grpForm.appendChild(label);
    grpForm.appendChild(input);
    div.appendChild(hr);
    div.appendChild(grpForm);
    input.style.cssText =
      "margin-inline:auto;border-radius:10px 10px 10px 10px;";
    div.appendChild(button);
    parent.appendChild(div);
    parent.style.cssText = "padding-block:2rem;";
    input.addEventListener("change", (e) => {
      if (e) {
        input.value = e.currentTarget.value;
      }
    });
    button.addEventListener("click", (e) => {
      if (e && input.value) {
        this.downloadFile(parent, input.value);
        this.cleanUp(parent);
      } else {
        const para = document.createElement("p");
        para.className = "text-primary text-wrap text-center my-2";
        para.textContent = "Please enter a file name";
        div.appendChild(para);
      }
    });
  }
  //CHILD TO downloadButtonEvent
  downloadFile(parent, filename) {
    if (filename) {
      let csvText = "VOICE CALLS:\n ";
      this.speaks.map((speak, index) => {
        if (index !== this.speaks.length - 1) {
          csvText += speak + "\n";
        } else {
          csvText += "\n";
        }
      });
      csvText += "TRANSLATIONS: \n";
      this.translations.map((trans, index) => {
        csvText +=
          "lang:" +
          trans.lang +
          "," +
          "\n" +
          " from: " +
          trans.translate.from +
          "\n" +
          "to: " +
          trans.translate.to +
          "\n";
      });
      const file = `data:text/txt;filename=${filename}.txt;charset=utf-8,${csvText}\n`;
      const a = document.createElement("a");
      const encodeUri = encodeURI(file);
      a.href = encodeUri;
      a.download = `${filename}.txt`;
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      document.body.remove(a);
      this.translations = [];
      this.speaks = [];
      chrome.storage.sync.set({
        translations: this.translations,
        speaks: this.speaks,
      });
      this.cleanUp(parent);
      this.showTranslations(parent, this.translations); //unchanged
      this.showSpeaks(parent, this.speaks);
    }
  }
  //CHILD TO showSpeaks (Main Speak to Task entry)
  speakToTaskCheckBox(parent, child, index) {
    const formGrp = document.createElement("div");
    formGrp.className = "form-group d-flex flex-column align-items-center";
    const label = document.createElement("label");
    label.className = "text-sm-center text-primary";
    label.textContent = "send to task";
    formGrp.appendChild(label);
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.style.cssText = "width:20px;height:20px;";
    formGrp.appendChild(checkBox);
    child.appendChild(formGrp);
    checkBox.addEventListener("change", (e) => {
      if (e && e.currentTarget.checked) {
        const speakSelText = this.speaks[index];
        this.createTaskFormSend(parent, speakSelText, index);
      }
    });
  }
  //CHILD OF speakToTaskCheckBox()
  createTaskFormSend(parent, speakSelText, index) {
    const id = Math.round(Math.random() * 500);
    this.taskForm = {
      ...this.taskForm,
      id: id,
      description: speakSelText,
    };
    const form_ = document.createElement("form");
    form_.style.cssText = "";
    form_.className =
      "d-flex flex-column gap-1 justify-content-start align-items-center shadow mx-auto position-relative";
    form_.style.cssText = "top:0%;background:white; z-index:1;";
    this.createGroupForm(form_, "input", "url");
    this.createGroupForm(form_, "input", "name");
    this.createGroupForm(form_, "input", "task");
    this.createGroupForm(form_, "input", "phone");
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "submit";
    submit.className = "btn btn-primary btn-sm text-center shadow my-2";
    form_.appendChild(submit);
    parent.appendChild(form_);
    submit.addEventListener("click", (e) => {
      if (e) {
        e.preventDefault();
        //send to Task
        chrome.storage.sync.get(["forms"], (res) => {
          if (res && res.forms) {
            const taskForms = [...res.forms, this.taskForm];
            this._speaks = this.speaks.filter((speak, indx) => {
              indx !== index;
            });

            chrome.storage.sync.set({ speaks: this._speaks, forms: taskForms });
            parent.removeChild(form_);

            this.cleanUp(parent);
            this.showTranslations(parent, this.translations); //unchanged
            this.showSpeaks(parent, this.speaks);
          }
        });
      }
    });
  }
  createGroupForm(parent, type, labelName) {
    const grpForm = document.createElement("div");
    grpForm.style.cssText = "margin-inline:auto;width:100%;";
    grpForm.className =
      "form-group form-check d-flex flex-column gap-1 justify-content-center align-items-center";
    const label = document.createElement("label");
    label.style.cssText =
      "color:aquablue;font-weight:bold;text-decoration:underline; text-underline-offset:0.75rem;";
    label.for = labelName;
    label.className = "form-check-label";
    let input;
    if (type === "input") {
      label.textContent = labelName;
      input = document.createElement("input");
      input.ariaDescribedby = `Task ${labelName}`;
      input.placeholder = `task ${labelName}`;
      input.type = "text";
      input.required = this.checkRequired(labelName);
      input.minlength = "6";
      input.style.cssText = "width:inherit;margin-inline:auto;";
    } else if (type === "textarea") {
      label.textContent = labelName;
      input = document.createElement("textarea");
      input.ariaDescribedby = `Task ${labelName}`;
      input.placeholder = "task description";
      input.style.cssText = "min-width:100%;margin-inline:auto;";
      input.rows = 4;
      input.required = this.checkRequired(labelName);
      input.minlength = "6";
    } else if (type === "checkbox") {
      label.textContent = labelName;
      input = document.createElement("checkbox");
      input.style.cssText =
        "width:20px;height:20px;position:absolute;top:0;right:0;";
      input.type = "checkbox";
      input.required = this.checkRequired(labelName);
    } else if (type === "id") {
      label.textContent = "";
      input = document.createElement("input");
      input.style.cssText = "width:25px;height:25px;";
      input.type = "number";
      input.value = Math.round(Math.random() * 100);
      input.required = false;
      input.hidden = true;
    }
    input.name = labelName;
    input.id = labelName;
    input.className = "form-control form-check";
    grpForm.appendChild(label);
    grpForm.appendChild(input);
    parent.appendChild(grpForm);
    parent.style.cssText = "position:relative;";
    input.addEventListener("change", (e) => {
      if (e) {
        this.taskForm = {
          ...this.taskForm,
          [e.currentTarget.name]: e.currentTarget.value,
        };
      }
    });
  }
  //SHARE/STATIC

  //CLEANS PARENT
  cleanUp(parent) {
    if (parent.childNodes) {
      while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
      }
      this.open_Translator(parent);
    }
  }
  checkRequired(name) {
    let form = {
      id: false,
      url: false,
      name: true,
      description: true,
      task: true,
      phone: false,
    };
    for (const [key, value] of Object.entries(form)) {
      if (name && key.startsWith(name)) {
        return value;
      }
    }
    return false;
  }
  insertID(trans) {
    //_trans = {id:0, lang: "", translate: { from: "", to: "" } };
    if (!trans.id || !isNaN(trans.id)) {
      trans.id = Math.round(Math.random() * 1000);
      return trans;
    }
    return trans;
  }
  adddateIfNotExist(speak) {
    if (!speak.creation_date) {
      this._speak["creation_date"] = new Date().toLocaleDateString("en-US");
      this._speak["speak"] = speak;
      return this._speak;
    } else {
      return speak;
    }
  }
}
const start1 = new TranslateWrapperMain();

//-----------ADD NOTES(RIGHTSIDE OF POPUP)---------//

class AddNotesMain {
  count = 0;
  tempForm = { id: 0, url: "", name: "", description: "", task: "", phone: "" };
  _form = {
    id: 0,
    url: "",
    name: "",
    description: "",
    task: "",
    phone: "",
    complete: false,
  };
  _forms = [];
  para =
    "These keep track of your tasks. It helps you organize your tasks. 'add task' opens up a task form.'download' downloads your file to downloads and clears your list.<pre> Try it!</pre>";
  constructor() {
    this.addToNotes = document.querySelector("div#addToNotes");
    this._form = {
      id: 0,
      url: "",
      name: "",
      description: "",
      task: "",
      phone: "",
      creation_date: "",
      modified_date: "",
    };
    this.count = 0;
    this.addToNotes.className =
      " col-7 d-flex flex-column justify-content-start align-items-center gap-1.5 w-100";
    this.addToNotes.style.cssText = "max-width:450px;";
    this.initialize(this.addToNotes);
  }
  get forms() {
    return this._forms;
  }
  get form() {
    return this._form;
  }
  set forms(forms) {
    this._forms = forms;
    // console.log("@set forms", this._forms);
  }
  set form(form) {
    this._form = form;
  }
  initialize(parent) {
    // console.log("initialized outside", this.forms);//empty set!!
    chrome.storage.sync.get(["forms"], (res) => {
      if (res && res.forms) {
        console.log("567: initialize", res.forms);

        this.forms = res.forms;
        this.mainBtn(parent, res.forms); // initializing data
      } else {
        this.forms = [];
        chrome.storage.sync.set({ forms: [] });
        this.mainBtn(parent, this.forms);
        this.count++;
      }
    });
  }

  //INITIATES mainBtn=> refreshes page
  updateList(parent) {
    this.count++;
    if (this.forms.length > 0) {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes && changes.forms && changes.forms.newValue) {
          this.cleanUp(parent);
          this.forms = changes.forms.newValue;
          this.mainBtn(parent, changes.forms.newValue);
        }
      });
    } else {
      this.initialize(parent);
    }
  }

  //MAIN ENTRY POINT
  mainBtn(parent, forms) {
    this.createList(parent, forms); //CREATES LIST OF STORED
    const container = document.createElement("div");
    container.className =
      "d-flex flex-wrap justify-content-center align-items-center gap-1";
    const download = document.createElement("button");
    const button = document.createElement("button");
    button.hidden = false;
    download.className = "shadow btn btn-sm btn-primary ";
    button.className = "shadow btn btn-sm btn-success ";
    download.textContent = "download";
    button.textContent = "add task";
    const buttonClear = document.createElement("button");
    buttonClear.hidden = false;
    buttonClear.textContent = "clear memory";
    buttonClear.className = "shadow btn btn-sm btn-danger ";
    buttonClear.textContent = "clear memory";
    parent.className = "col d-flex flex-column align-items-center gap-1";
    container.appendChild(button);
    if (forms && forms.length > 0) {
      container.appendChild(buttonClear);
    }
    parent.appendChild(container);
    if (forms && forms.length > 0) {
      parent.appendChild(download);
    }
    button.addEventListener("click", (e) => {
      if (e) {
        this.cleanUp(parent);
        this.createForm(parent); //BUILDS FORM
        button.hidden = true;
      }
    });
    buttonClear.addEventListener("click", (e) => {
      if (e) {
        this.cleanUp(parent);
        chrome.storage.sync.set({ forms: [] });
        this._forms = [];
        button.hidden = false;
        buttonClear.hidden = false;
        this.cleanUp(parent);
        this.mainBtn(parent, this.forms);
      }
    });
    download.addEventListener("click", (e) => {
      if (e) {
        this.actionDownload(this.addToNotes, forms);
        buttonClear.hidden = false;
      }
    });
  }
  //THIS CREATES GROUP-FORM COMPONENTS,CHILD TO createForm()
  createGroupForm(parent, type, labelName) {
    const grpForm = document.createElement("div");
    grpForm.style.cssText = "margin-inline:auto;width:100%;";
    grpForm.className =
      "form-group form-check d-flex flex-column gap-1 justify-content-center align-items-center";
    const label = document.createElement("label");
    label.style.cssText =
      "color:aquablue;font-weight:bold;text-decoration:underline; text-underline-offset:0.75rem;";
    label.for = labelName;
    label.className = "form-check-label";
    let input;
    if (type === "input") {
      label.textContent = labelName;
      input = document.createElement("input");
      input.ariaDescribedby = `Task ${labelName}`;
      input.placeholder = `task ${labelName}`;
      input.type = "text";
      input.required = this.checkRequired(labelName);
      input.minlength = "6";
      input.style.cssText = "width:inherit;margin-inline:auto;";
    } else if (type === "textarea") {
      label.textContent = labelName;
      input = document.createElement("textarea");
      input.ariaDescribedby = `Task ${labelName}`;
      input.placeholder = "task description";
      input.style.cssText = "min-width:100%;margin-inline:auto;";
      input.rows = 4;
      input.required = this.checkRequired(labelName);
      input.minlength = "6";
    } else if (type === "checkbox") {
      label.textContent = labelName;
      input = document.createElement("checkbox");
      input.style.cssText =
        "width:20px;height:20px;position:absolute;top:0;right:0;";
      input.type = "checkbox";
      input.required = this.checkRequired(labelName);
    } else if (type === "id") {
      label.textContent = "";
      input = document.createElement("input");
      input.style.cssText = "width:25px;height:25px;";
      input.type = "number";
      input.value = Math.round(Math.random() * 100);
      input.required = false;
      input.hidden = true;
    }
    input.name = labelName;
    input.id = labelName;
    input.className = "form-control form-check";
    grpForm.appendChild(label);
    grpForm.appendChild(input);
    parent.appendChild(grpForm);
    parent.style.cssText = "position:relative;";
    input.addEventListener("change", (e) => {
      if (e) {
        input.value = e.currentTarget.value;
        this.form = {
          ...this.form,
          [e.currentTarget.name]: e.currentTarget.value,
        };
      }
    });
  }
  //CREATES SUBMIT BUTTON: CHILD TO createForm()=ACTION:saves form to forms
  createSubmitButton(parent, labelName) {
    const form = document.getElementById("formId");
    const button = document.createElement("button");
    button.className = "shadow btn btn-sm btn-primary";
    button.type = "submit";
    button.style.cssText = "text-align:center;margin-inline:auto;";
    button.textContent = labelName;
    parent.appendChild(button);
    button.addEventListener("click", (e) => {
      if (e) {
        //submit

        if (this.checkMinLength(this.form)) {
          e.preventDefault();
          const id = Math.round(Math.random() * 1000);
          this.form = { ...this.form, id: id };
          let tempForms = this.forms;
          tempForms.push(this.form);
          this.forms = tempForms;
          chrome.storage.sync.set({ forms: tempForms });
          this.form = this.tempForm; //INITIALIZES FORM
          this.cleanUp(parent);
          this.mainBtn(parent, this.forms);
        }
      } else {
        const message = document.createElement("div");
        message.className =
          "mx-auto;d-flex flex-column gap my-2 mx-auto p-8 text-wrap text-primary";
        message.style.cssText =
          "position:absolute;width:70%;height:25%;background:white;z-index:1;";
        message.textContent =
          "'name','task' and 'description' should be filled";
        form.style.cssText = "position:relative;";
        form.appendChild(message);
        setTimeout(() => {
          form.removeChild(message);
        }, 2000);
      }
    });
  }
  //MAIN FORM CREATION: CHILD TO mainBtn()
  createForm(parent) {
    //{"id":0,url:"",name:"",description:"",task:"",phone:""}
    const H6 = document.createElement("h6");
    H6.className = "lean display-6 text-center text-primary";
    H6.textContent = " add task";
    H6.style.cssText = "margin-block:1rem margin-inline:auto;";
    const form = document.createElement("form");
    form.setAttribute("form", "form");
    form.id = "formId";
    form.style.cssText = "width:100%;margin-inline:5px;padding-inline:5px;";
    parent.appendChild(H6);
    this.createGroupForm(form, "id", "id");
    this.createGroupForm(form, "input", "url");
    this.createGroupForm(form, "input", "name");
    this.createGroupForm(form, "textarea", "description");
    this.createGroupForm(form, "input", "task");
    this.createGroupForm(form, "input", "phone");
    this.createSubmitButton(form, "submit task");
    parent.appendChild(form);
    //formdata DOES NOT WORK
    // console.log("in CreateForm formdata.values()", formdata.values());
    form.className =
      " mx-auto d-flex flex-column gap-1 align-items-center justify-content-start shadow w-100";
  }
  //THIS CREATES LIST: CHILD TO mainBtn()
  createList(parent, forms) {
    this.count++;
    //{"id":0,url:"",name:"",description:"",task:"",phone:""}
    // console.log("createList!: this.forms", forms);
    if (forms && forms.length > 0) {
      const H6 = document.createElement("h6");
      H6.className = "lean display-6 text-center";
      H6.textContent = "notes list";
      H6.style.cssText =
        "margin-inline:auto;margin-block;1.5rem;text-decoration:underline; text-underline-offset:0.65rem;";

      const container = document.createElement("div");
      container.className = "d-flex flex-column align-items-start gap-1";
      container.style.cssText =
        "width:100%; margin-inline:0; padding-inline:5px; margin-block:1rem; min-height:80px;";

      forms.forEach((form_, index) => {
        const grpForm = document.createElement("div");
        grpForm.className = "group-form d-flex flex-column align-items-center";
        grpForm.style.cssText = "width:25px;height:25px;margin:0px;";
        const label = document.createElement("label");
        label.className = "text-danger text-sm";
        label.for = "del";
        label.textContent = "del";
        const del = document.createElement("input");
        del.type = "checkbox";
        del.id = "del";
        del.checked = false;
        del.name = "delete";
        del.className = "form-control";
        del.style.cssText = "width:20px;height:20px;";
        grpForm.appendChild(label);
        grpForm.appendChild(del);
        const innerContainer = document.createElement("div");
        innerContainer.className =
          "mx-auto d-flex flex-wrap justify-content-start my-1 text-info gap-1";
        innerContainer.style.cssText =
          "position:relative;width:100%;min-height:60px";
        const name = document.createElement("span");
        name.innerHTML = `<span style="color:darkred;">${index + 1}.)</span> ${
          form_.name
        }`;
        const task = document.createElement("span");
        task.className = "hoverThis";
        task.setAttribute("hoverItem", "details");
        task.textContent = `${form_.task}`;
        task.style.cssText =
          "text-decoration:underline;color:darkred;cursor:pointer;";
        name.style.cssText = "font-size:90%;";

        innerContainer.appendChild(grpForm);
        innerContainer.appendChild(name);
        innerContainer.appendChild(task);
        container.appendChild(innerContainer);
        task.addEventListener("click", (e) => {
          if (e) {
            this.formItemPopup(parent, form_.id);
          }
        });
        del.addEventListener("click", (e) => {
          if (e) {
            if (e.currentTarget.checked) {
              this.deleteItem(parent, form_, e);
            }
          }
        });
      });

      parent.appendChild(H6);
      parent.appendChild(container);
    } else {
      const H6 = document.createElement("h6");
      H6.className = "lean display-6 text-center";
      H6.textContent = "empty list";
      H6.style.cssText =
        "margin-inline:auto;margin-block;1.5rem;text-decoration:underline; text-underline-offset:0.65rem;";
      parent.appendChild(H6);
      const para = document.createElement("p");
      para.className = "text-primary text-wrap my-2 mx-auto";
      para.innerHTML = `${this.para} <img src="./images/smiley.svg" alt="www.masterconnect.ca" style="color:yellow;background-color:yellow; border-radius:50%;filter:drop-shadow(0 0 0.5rem darkgrey)" />`;
      parent.appendChild(para);
    }
  }
  //THIS DISPLAYS DETAIL-popup
  formItemPopup(parent, id) {
    const css =
      "margin-inline:0px;margin-block:0;display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;max-width:400px;text-wrap:wrap;";
    const form = this.forms.find((item) => item.id === id);
    const itemArr = this.sortConvertEntries(form);
    this.addToNotes.style.cssText =
      "position:relative;z-index:0;align-items-start;";
    // {"id":0,url:"",name:"",description:"",task:"",phone:""}
    const H6 = document.createElement("h6");
    H6.className = "lean display-6 text-primary";
    H6.style.cssText =
      "margin-block:1rem;margin-inline:auto;text-align:center;";
    H6.textContent = "detail";
    const container = document.createElement("div");
    container.className = "d-flex flex-column flex-wrap align-items-stretch";
    container.style.cssText =
      "position:absolute;inset:0px; max-width:450px;background:white;z-index:1;padding-inline:0.75rem;padding-inline:5x;margin-inline:0px;overflow-x:hidden;";
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-info shadow";
    button.style.cssText = "margin-block:1rem;margin-inline:auto;";
    button.textContent = "close";
    if (itemArr) {
      container.appendChild(H6);
      itemArr.forEach((item, index) => {
        let key_ = item.key;
        key_ = document.createElement("div");
        key_.className = "text-danger";
        if (key_ === "url") {
          key_.innerHTML = `${item.key}<li class="text-primary"><a href="${
            item.value
          }"> ${this.splitNextLine(item.value)}</a></li>`;
        } else {
          key_.innerHTML = `${item.key}:<li class="text-primary"> ${item.value}</li>`;
        }
        key_.style.cssText = css;
        if (item.value) {
          container.appendChild(key_);
        }
      });
      container.appendChild(button);
      parent.appendChild(container);
      button.addEventListener("click", (e) => {
        if (e) {
          e.preventDefault();
          parent.removeChild(container);
        }
      });
    }
  }
  deleteItem(parent, form, target) {
    const parentTarget = target.parentElement;
    const delForm = this._forms.find((item) => item.id === form.id);
    const remainder = this._forms.filter((item) => item.id !== form.id);
    this._forms = remainder;
    chrome.storage.sync.set({ forms: remainder });
    this.cleanUp(parent);
    this.form = this.tempForm; //INITIALIZES FORM
    this.cleanUp(parent);
    this.mainBtn(parent, this.forms);
  }
  actionDownload(parent, forms) {
    const container = document.createElement("div");
    container.className = "d-flex flex-column align-items-center p-10 shadow";
    container.style.cssText =
      "position:absolute;top:30%;left:0;width:100%;background:white;z-index:1;min-height:125px;";
    const formGrp = document.createElement("div");
    formGrp.className =
      "form-group form-check mx-auto d-flex flex-column align-items-center gap-1";
    const label = document.createElement("label");
    label.textContent = "file name";
    label.for = "filename";
    label.className = "text-primary lean display-6 text-center";
    const input = document.createElement("input");
    input.placeholder = "enter file name";
    input.id = "filename";
    input.name = "filename";
    input.className = "form-control form-check";
    input.required = true;
    input.minlength = "5";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "submit";
    submit.className = "btn btn-sm btn-primary shadow";
    formGrp.appendChild(label);
    formGrp.appendChild(input);
    formGrp.appendChild(submit);
    container.appendChild(formGrp);
    parent.appendChild(container);
    input.addEventListener("change", (e) => {
      if (e) {
        input.value = e.currentTarget.value;
      }
    });
    submit.addEventListener("click", (e) => {
      const len = input.value.split("").length;

      if (e && len > 5) {
        e.preventDefault();
        this.downloadList(forms, input.value);
      }
    });
  }
  downloadList(forms, fileName) {
    if (forms && forms.length > 0) {
      const stringItems = forms.map((form, index) => {
        let strForm = "";
        for (const [key, value] of Object.entries(form)) {
          if (key === "description") {
            strForm += this.reduceDesclength(value, 128);
          } else {
            strForm += `${key} : ${value}\n`;
          }
        }
        return `${strForm}`;
      });
      const file = `data:text;filename=${fileName}.txt;charset=utf-8,${stringItems.join(
        "\n"
      )}`;
      // console.log(file);
      const a = document.createElement("a");
      const encodeUri = encodeURI(file);
      a.hidden = true;
      a.download = `${fileName}.txt`;
      a.href = encodeUri;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      chrome.storage.sync.remove("forms");
      this.forms = [];
      this.cleanUp(this.addToNotes);
      this.mainBtn(this.addToNotes, this.forms);
    }
  }

  //SHARED RESOURCES SHOULD BE STATIC BUT TOO LAZY

  cleanUp(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.lastChild);
    }
  }

  checkRequired(name) {
    let form = {
      id: false,
      url: false,
      name: true,
      description: true,
      task: true,
      phone: false,
    };
    for (const [key, value] of Object.entries(form)) {
      if (name && key.startsWith(name)) {
        return value;
      }
    }
    return false;
  }
  checkMinLength(form) {
    for (const [key, value] of Object.entries(form)) {
      if (this.checkRequired(key)) {
        let len = value.split("").length;
        if (len < 6) {
          return false;
        }
      }
    }
    return true;
  }
  insertForm(key, value) {
    Object.keys(this.form).forEach((key_) => {
      if (key_ === key) {
        this.form[key_] = value;
      } else if (key_ === "id") {
        this.form[key_] = Math.round(Math.random() * 1000);
      }
    });
  }
  splitNextLine(str_) {
    let arr = str_.split("");
    let newStr = "";
    arr.map((let_, index) => {
      if (index > 30) {
        newStr = `${arr.slice(0, 30).join("")}\n${arr
          .slice(30, arr.length - 1)
          .join("")}\n`;
      } else {
        newStr = str_;
      }
    });
    return newStr;
  }
  sortConvertEntries(form) {
    // {"id":0,url:"",name:"",description:"",task:"",phone:"","creation_date","modified_date"}
    const sortArr = [
      "name",
      "task",
      "description",
      "url",
      "phone",
      "complete",
      "creation_date",
      "modified_date",
    ];
    let arr = [];
    sortArr.forEach((key_, index) => {
      for (const [key, value] of Object.entries(form)) {
        if (key === key_ && key !== "id") {
          arr.push({ key: key, value: value });
        }
      }
    });
    return arr;
  }
  reduceDesclength(desc, len) {
    let arr = desc.split("");
    let len_ = arr.length;
    let str = "";
    arr.forEach((lt, index) => {
      if (len_ > len && index === len) {
        str += `${arr.slice(0, len).join("")} \n`;
        str += `${arr.slice(len, len_ - 1).join("")}\n`;
      } else {
        str = desc;
      }
    });
    return str;
  }
  checkEmptySets(forms) {
    let arr = [];
    forms.forEach((form, index) => {
      const check = form && form.id ? true : false;
      console.log("checkEmptySets:1087", forms, "id", form.id);
      if (check) {
        arr.push(form);
      }
    });
    return arr;
  }
}
const addText = new AddNotesMain();

//---------------HEADER EFFECT------------------------//////////////

function style_Effect() {
  const styleEffect = document.getElementById("styleEffect");
  const heading = document.createElement("h3");
  heading.className = "text-center lean display-6 text-primary mt-1";
  const para = document.createElement("p");
  const paraTwo = document.createElement("p");
  para.className = "my-0 py-0";
  paraTwo.className = "my-0 py-0";

  paraTwo.style.opacity = "0";
  paraTwo.textContent = "www.masterconnect.ca";
  paraTwo.className = "text-primary";
  heading.textContent = "Master Connect";
  para.innerHTML = "Helping you Connect";
  styleEffect.className =
    "d-flex flex-column justify-content-center align-items-center mx-auto py-2 ";
  styleEffect.style.cssText = "padding-inline:2rem;";
  styleEffect.appendChild(heading);
  styleEffect.appendChild(para);
  styleEffect.appendChild(paraTwo);
  para.style.fontSize = "large";
  para.animate(
    [
      { transform: "rotateX(0deg)", color: "black" },
      { transform: "rotateX(180deg)", color: "red" },
      { transform: "rotateX(360deg)", color: "black" },
    ],
    {
      duration: 6000,
      iteration: 2,
    }
  );
  setTimeout(() => {
    paraTwo.style.opacity = "1";
    paraTwo.animate(
      [
        { transform: "translateX(110%)", opacity: "0" },
        { transform: "translateX(0%)", opacity: "1" },
      ],
      {
        duration: 3000,
        iteration: 1,
      }
    );
  }, 6000);
}
style_Effect();

/////--------------------OPEN OPTION PAGE-------/////////////
function openOption() {
  const openOption = document.getElementById("openOption");
  const button = document.createElement("button");
  button.className = "btn btn-sm btn-info shadow";
  button.textContent = "open options";
  openOption.appendChild(button);
  button.addEventListener("click", (e) => {
    if (e) {
      if (chrome.runtime.openOptionPage) {
        chrome.runtime.openOptionPage();
      } else {
        const url = chrome.runtime.getURL("options.html");
        window.open(url);
      }
      close();
    }
  });
}
openOption();
