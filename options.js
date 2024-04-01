class HeaderStyling {
  constructor() {
    this.missionContainer = document.querySelector("div.missionContainer");
    this.logo = document.querySelector("div.missionContainer > h6");
    this.statement = document.querySelector("div.missionContainer > p");
    this.webUrl = document.querySelector("div.missionContainer > p.web.lean");
    this.missionContainer.computedStyleMap.cssText =
      "padding-block:1.5rem;height:100%;";
    this.statement.style.opacity = "0";
    this.webUrl.style.opacity = "0";
  }

  runEffect() {
    setTimeout(() => {
      this.webUrl.style.opacity = "1";
      this.webUrl.animate(
        [
          { transform: "translateY(-150%)", opacity: "0" },
          { transform: "translateY(0%)", opacity: "1" },
        ],
        { duration: 2500, iteration: 1 }
      );
    }, 3000);

    setTimeout(() => {
      this.statement.style.opacity = "1";
      this.statement.animate(
        [
          { transform: "rotateY(-90deg) translateY(-60%)", opacity: "0" },
          { transform: "rotateY(0deg) translateY(0%)", opacity: "1" },
        ],
        { duration: 2500, iteration: 1 }
      );
    }, 50);
  }
}
const headerstyling = new HeaderStyling();
headerstyling.runEffect();

//////-------------DISPLAYING FORM---------//////////////
class FormControl {
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
    creation_date: "",
    modified_date: "",
  };
  _forms = [];
  constructor() {
    this.formcontrol = document.getElementById("formcontrol");
    this.formcontrol.className = " col-6 shadow-md position-relative ";
    // this.formcontrol.style.cssText =
    //   "background:linear-gradient(to bottom,darkgrey,whitesmoke);";
    this.initialize(this.formcontrol);
  }
  get form() {
    return this._form;
  }
  set form(form) {
    this._form = form;
  }
  get forms() {
    return this._forms;
  }
  set forms(forms) {
    this._forms = forms;
  }

  initialize(parent) {
    chrome.storage.sync.get(["forms"], (res) => {
      if (res && res.forms) {
        const newForms = FormControl.addCheckToForms(res.forms); //adds {complete:false}/creation_date/modified_date if !exist
        this.forms = newForms;
        this.displayForms(parent, newForms);
      }
    });
  }
  //MAIN FORMS START POINT
  displayForms(parent, forms) {
    forms.forEach((form, index) => {
      this.displayComponent(parent, form);
    });
    this.openNewFormBtn(parent);
    TransControl.setOverflowHeight(parent, 700);
    this.downloadNotes(parent, forms);
  }
  // Without getting initilizing
  reDisplayForms(parent, forms) {
    FormControl.cleanUp(parent);
    forms.forEach((form, index) => {
      this.displayComponent(parent, form);
    });
    this.openNewFormBtn(parent);
    TransControl.setOverflowHeight(parent, 700);
    this.downloadNotes(parent, forms);
  }
  //CHILD TO displayForms:displays component(LOOPING)
  displayComponent(parent, form) {
    const container = document.createElement("section");
    container.className =
      " d-flex flex-column gap-0 px-1 position-relative shadow-md py-2";
    container.id = "masterContainer";
    container.style.cssText = "background:white;border-radius:10px;";
    //DELETE BUTTON
    this.createDeleteBtn(parent, container, form);
    //MAIN FORM EDIT BUTTON BTN
    this.createEditEvent(container, form, "edit");
    //EACH FORM FORMAT(LOOPING)
    this.form = form;
    const containerDates = document.createElement("div");
    containerDates.className =
      "d-flex justify-content-center align-content-center gap-1";
    for (let item of FormControl.sortForm(form)) {
      // console.log("form", form);
      if (item.key === "id") {
        const id = document.createElement("p");
        id.textContent = `${item.value}`;
        id.className = "fs-6 text-primary";
        container.appendChild(id);
      } else if (item.key === "name") {
        const name = document.createElement("p");
        name.className = "text-dark fs-4 lean mb-1 d-flex flex-wrap ";
        name.innerHTML = `<span class="text-primary px-1">Name;</span><span>${item.value}</span>`;
        container.appendChild(name);
      } else if (item.key === "task") {
        const task = document.createElement("p");
        task.innerHTML = `<span class="text-primary px-1">${item.key}:</span><span class="text-dark">${item.value}</span>`;
        task.className = "text-primary fs-5 lean mb-1 d-flex flex-wrap ";
        container.appendChild(task);
      } else if (item.key === "description") {
        const desc = document.createElement("div");
        desc.innerHTML = `<p class="text-primary px-1">${item.key};</p><p class="text-dark">${item.value}</p>`;
        desc.className = "text-primary fs-6 lean mb-1";
        container.appendChild(desc);
      } else if (item.key === "creation_date") {
        const creation_date = document.createElement("p");
        creation_date.innerHTML = `<span class="text-primary px-1 fs-4">${item.key};</span><span>${item.value}</span>`;
        creation_date.className =
          "text-primary fs-6 lean mb-1 d-flex flex-wrap ";
        containerDates.appendChild(creation_date);
      } else if (item.key === "modified_date") {
        const modified_date = document.createElement("p");
        modified_date.innerHTML = `<span class="text-primary px-1 fs-4">${item.key};</span><span>${item.value}</span>`;
        modified_date.className =
          "text-primary fs-6 lean mb-1 d-flex flex-wrap ";
        containerDates.appendChild(modified_date);
        container.appendChild(containerDates);
      } else if (item.key === "phone" && item.value !== "") {
        const phone = document.createElement("p");
        phone.innerHTML = `<span class="text-primary px-1">${item.key};</span><span>${item.value}</span>`;
        phone.className = "text-primary fs-6 lean mb-1 d-flex flex-wrap ";
        container.appendChild(phone);
      } else if (item.value !== "" && item.key === "url") {
        const url = document.createElement("a");
        url.href = item.value;
        url.innerHTML = `<span class="text-primary font-bold">url:</span> ${FormControl.shortenStr(
          item.value,
          20
        )}`;
        url.style.cssText = "text-decoration:underline; padding-inline:1rem";
        url.className = "text-warning";
        container.appendChild(url);
      } else if (item.key === "complete") {
        // console.log("form", form, "complete", item.key, "checked", item.value);

        const formGrp = document.createElement("div");
        const label = document.createElement("label");
        formGrp.className =
          "form-group d-flex flex-column align-content-center";

        label.for = `idID${form.id}`;
        label.textContent = "complete";
        const complete = document.createElement("input");
        complete.type = "checkbox";
        complete.checked = item.value;
        complete.name = "complete";
        complete.id = `idID${form.id}`;
        complete.style.cssText =
          "border:1px solid blue;width:25px;height:25px;";
        complete.className = "text-danger complete ";
        formGrp.appendChild(label);
        formGrp.appendChild(complete);
        container.appendChild(formGrp);
        complete.addEventListener("change", (e) => {
          if (e && e.currentTarget) {
            this.form = { ...form, complete: e.currentTarget.checked };

            chrome.storage.sync.get(["forms"], (res) => {
              if (res && res.forms) {
                const remainder = res.forms
                  .filter((fm) => fm.id !== this.form.id)
                  .filter((fm) => fm.id !== 0);

                this.forms = [...remainder, this.form];
                // console.log(this.forms, "remainder", remainder);
                chrome.storage.sync.set({ forms: this.forms });
                // this.form = this.tempForm; //INITIALIZE

                this.reDisplayForms(parent, this.forms);
              }
            });
          }
        });
      }

      parent.appendChild(container);
    }
  }
  //THIS CREATES A NEW FORM ENTRY CHILD TO ROOT
  openNewFormBtn(parent) {
    this.form = this.tempForm; // initialize object
    const container = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "display-5 lean my-1 text-center mx-auto";
    title.textContent = " new task entry";
    container.className =
      "d-flex flex-column justify-content-center align-content-center my-1 py-2";
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-success shadow-md my-2";
    button.style.opacity = "1";
    button.innerHTML = `add a new task`;
    container.appendChild(button);
    parent.appendChild(container);
    button.addEventListener("click", (e) => {
      if (e) {
        e.preventDefault();
        this.openForm(parent, this.tempForm, "new");
        button.style.opacity = "0";
      }
    });
  }
  //CHILD TO displayComponnt() && openNewFormBtn()
  createEditEvent(parent, form, type) {
    const edit = document.createElement("button");
    edit.className = "btn btn-sm shadow btn-info d-inline px-1 shadow-sm";
    edit.innerHTML = `<span><img src="./images/checklist.svg" alt="www.masterconnect.ca" style="width:40px;height:30px;background:lightyellow;"/></span><span class="text-success">edit</span>`;
    edit.style.cssText =
      "position:absolute;width:30px;height:30px;top:2.5rem;right:1.25rem;";
    parent.appendChild(edit);
    edit.addEventListener("click", (e) => {
      if (e) {
        this.openForm(parent, form, type);
      }
    });
  }
  //CHILD OF openForm()-EDIT
  createSubmitBtn(parent) {
    const formContainer = document.querySelector("div#formContainer");
    const masterContainer = document.querySelector("div#masterContainer");
    const submit = document.createElement("button");
    submit.className = "btn btn-sm shadow btn-success shadow-sm";
    submit.textContent = `submit`;
    submit.style.cssText = "";
    parent.appendChild(submit);
    submit.addEventListener("click", (e) => {
      if (e) {
        e.preventDefault();
        chrome.storage.sync.get(["forms"], (res) => {
          if (res && res.forms) {
            const ID = FormControl.genID(this._form.id);
            this._form.id = ID; //adding id if not exist
            //below add creation date if not exist
            this._form.creation_date = this._form.creation_date
              ? this._form.creation_date
              : FormControl.creationDate();
            this._form.modified_date = FormControl.modifiedDate();
            let forms = res.forms.filter((form) => form.id !== this.form.id);
            forms.push(this._form);
            if (
              FormControl.checkFormPopup(this.formcontrol, this._form).passed
            ) {
              this.forms = forms;
              chrome.storage.sync.set({ forms: this.forms });
              this.reDisplayForms(this.formcontrol, this.forms);
              this.form = this.tempForm; //initializing;
              parent.style.cssText = "background:white;"; //changing back the background to parent
            } else {
              FormControl.checkFormPopup(this.formcontrol, this.form).message;
            }
          }
        });
      }
    });
  }
  // NEW SUBMIT BTN CHILD TO openForm
  createNewSubmitBtn(parent) {
    const submit = document.createElement("button");
    submit.className = "btn btn-sm shadow btn-success shadow-sm";
    submit.textContent = `submit`;
    submit.style.cssText = "";
    parent.appendChild(submit);
    submit.addEventListener("click", (e) => {
      if (e) {
        e.preventDefault();
        chrome.storage.sync.get(["forms"], (res) => {
          if (res && res.forms) {
            const ID = FormControl.genID(this._form.id);
            this._form.id = ID;
            this._form.creation_date = FormControl.creationDate();
            this._form.modified_date = FormControl.modifiedDate();
            this._form.complete = false;
            this.forms = [...res.forms, this._form];
            if (
              FormControl.checkFormPopup(this.formcontrol, this.form).passed
            ) {
              chrome.storage.sync.set({ forms: this.forms });
              FormControl.cleanUp(this.formcontrol); //cleaning up
              this.initialize(this.formcontrol);
              this.form = this.tempForm; //initializing;
            } else {
              FormControl.checkFormPopup(this.formcontrol, this.form).message;
            }
          }
        });
      }
    });
  }
  //CHILD OF createEditEvent()-EDIT && createNewSubmitBtn() parent-this.formcontrol (root entry)
  openForm(parent, form, type) {
    // create form;
    const title = document.createElement("h3");
    title.className = "display-5 lean my-1 text-center mx-auto";
    this.form = form;
    const formContainer = document.createElement("div");
    if (type === "edit") {
      title.textContent = " edit form entry";
      formContainer.className =
        " w-100 position-absolute top-50 start-50 translate-middle shadow-md";
      formContainer.id = "formContainer";
      formContainer.style.cssText =
        "width:100%;height:500px;border-radius:inherit;p-1;overflow-y:scroll;background:darkgrey !important;z-index:200;top:10%";
    } else {
      title.textContent = " new task entry";
      formContainer.className =
        " w-100 position-absolute top-50 start-50 translate-middle shadow-md px-1";
      formContainer.id = "formContainer";
      formContainer.style.cssText =
        "width:100%;border-radius:inherit;p-1;background:darkgrey !important;z-index:200;top:10%";
    }
    const form_ = document.createElement("form");
    form_.className = "d-flex flex-column gap-1 w-100 px-1 ";
    form_.style.cssText = "background:whitesmoke !important;";
    for (const [key, value] of Object.entries(form)) {
      this.formGrp(form_, key, value);
    }
    if (type === "edit") {
      this.createSubmitBtn(form_, form);
    } else {
      {
        this.createNewSubmitBtn(form_, form);
      }
    }
    formContainer.appendChild(title);
    formContainer.appendChild(form_);
    this.formcontrol.appendChild(formContainer);
  }
  //CHILD OF openForm()-GENERIC
  formGrp(parent, key, value) {
    const formGrp_ = document.createElement("div");
    formGrp_.className = "form-group d-flex flex-column ";
    const label = document.createElement("label");
    label.className = "lean fs-6 text-primary";
    let input = document.createElement("input");
    input.style.cssText = "background:white;";
    let textarea = document.createElement("textarea");
    textarea.style.cssText = "background:white;";
    if (key === "id") {
      const newValue = FormControl.genID(0);
      label.textContent = `${key}`;
      input.setAttribute("name", "id");
      input.setAttribute("value", newValue);
      input.type = "number";
      input.hidden = true;
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    } else if (key === "name") {
      label.textContent = `${key}`;
      input.setAttribute("name", "name");
      input.setAttribute("value", value);
      input.type = "text";
      input.autocomplete = "task's name";
      input.placeholder = `${key}`;
      input.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    } else if (key === "task") {
      label.textContent = `${key}`;
      input.setAttribute("name", "task");
      input.setAttribute("value", value);
      input.type = "text";
      input.autocomplete = "task";
      input.placeholder = `${key}`;
      input.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    } else if (key === "description") {
      label.textContent = `${key}`;
      textarea.name = key;
      textarea.value = value;
      textarea.autocomplete = "description";
      textarea.rows = "4";
      textarea.placeholder = `${key}`;
      textarea.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(textarea);
      parent.appendChild(formGrp_);
    } else if (key === "url") {
      label.textContent = `${key}`;
      input.setAttribute("name", "url");
      input.setAttribute("value", value);
      input.type = "text";
      input.autocomplete = "url";
      input.placeholder = `${key}`;
      input.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    } else if (key === "phone") {
      label.textContent = `${key}`;
      input.setAttribute("name", "phone");
      input.setAttribute("value", value);
      input.autocomplete = "phone number";
      input.type = "text";
      input.placeholder = `${key}`;
      input.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    } else if (key === "complete") {
      label.textContent = `${key}`;
      label.for = `${key}4`;
      input.id = `${key}4`;
      input.type = "checkbox";
      input.name = "complete";
      input.checked = value;
      input.value = value;
      input.style.cssText = "width:20px;height:20px;";
      // input.className = "form-control";
      formGrp_.appendChild(label);
      formGrp_.appendChild(input);
      parent.appendChild(formGrp_);
    }

    input.addEventListener("change", (e) => {
      if (e && e.currentTarget.value) {
        this.form = {
          ...this.form,
          [e.currentTarget.name]: e.currentTarget.value,
        };
      } else if (e && e.currentTarget.checked) {
        this._form = { ...this.form, complete: e.currentTarget.checked };
      }
    });
    textarea.addEventListener("change", (e) => {
      if (e && e.currentTarget) {
        this.form = {
          ...this.form,
          [e.currentTarget.name]: e.currentTarget.value,
        };
      }
    });
  }
  //MAIN ENTRY DELETE
  createDeleteBtn(parent, container, form) {
    const img = document.createElement("img");
    img.className =
      "btn btn-sm shadow-md d-inline align-items-center position-absolute top-0 start-100  ";
    img.style.cssText =
      "transform:translate(-55px,-25px);border-radius:50%;background:lightpink;";
    img.src = "./images/trash.svg";
    img.alt = "www.masterconnect.ca";
    img.type = "button";
    container.appendChild(img);
    img.addEventListener("click", (e) => {
      if (e) {
        this.form = form;
        chrome.storage.sync.get(["forms"], (res) => {
          if (res && res.forms) {
            const remainder = res.forms.filter((fm) => fm.id !== form.id);
            this.forms = remainder;
            chrome.storage.sync.set({ forms: remainder });
            FormControl.cleanUp(parent); //wipe slate!!
            this.initialize(parent); //redo list
          }
        });
      }
    });
  }
  //DOWNLOAD NOTES
  downloadNotes(parent, forms) {
    this.forms = forms;
    const button = document.createElement("button");
    button.className = "btn btn-success btn-sm text-light text-center";
    button.textContent = "downloadNotes";
    const div = document.createElement("div");
    const formGrp = document.createElement("div");
    formGrp.className =
      "form-group mx-auto d-flex flex-column justify-content-center align-content-center";
    const label = document.createElement("label");
    label.textContent = "enter file name";
    label.className = "text-primary lean fs-5 text-center";
    const input = document.createElement("input");
    input.id = "filename";
    input.placeholder = "file name";
    input.name = "filename";
    input.required = true;
    input.minlength = "5";
    label.for = "filename";
    formGrp.appendChild(label);
    formGrp.appendChild(input);
    formGrp.appendChild(button);
    div.className =
      "d-flex flex-column gap-1 justify-content-center align-content-center my-2";
    div.appendChild(formGrp);
    parent.appendChild(div);
    input.addEventListener("change", (e) => {
      if (e) {
        input.value = e.currentTarget.value;
        if (!input.value.split("") > 5) {
          button.disabled = true;
        } else {
          button.disabled = false;
        }
      }
    });
    button.addEventListener("click", (e) => {
      if (e && forms.length > 0) {
        const a = document.createElement("a");
        a.href = this.encodeUri(forms, input.value);
        a.download = `${input.value}.csv`;
        a.hidden = true;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // clearing out the tasks
        this.form = this.tempForm;
        this.forms = [];
        chrome.storage.sync.set({ forms: [] });
        FormControl.cleanUp(parent);
        this.displayForms(parent, this.forms);
      } else {
        console.log("clicked");
        FormControl.checkDownload(parent, forms);
      }
    });
  }
  encodeUri(forms, filename) {
    let csvStr = "";
    forms.map((form, index) => {
      if (index === 0) {
        csvStr += `creations_date,url,name,description,task,phone,complete,modified_date\n`;
        csvStr += `${form.creation_date},${
          form.url !== "" ? form.url : "none"
        },${form.description},${form.task},${
          form.phone !== "" ? form.phone : "none"
        },${form.complete},${form.modified_date}\n`;
      } else {
        csvStr += `${form.creation_date},${
          form.url !== "" ? form.url : "none"
        },${form.description},${form.task},${
          form.phone !== "" ? form.phone : "none"
        },${form.complete},${form.modified_date}\n`;
      }
    });
    const file = `data:text/csv;filename=${filename}.csv;charset=utf-8,${csvStr}`;
    return encodeURI(file);
  }

  // STATIC METHODS

  static shortenStr(str, n) {
    let arr = str.split("");
    if (arr.length > n) {
      let strng = "";
      arr.map((lt, index) => {
        if (index < n) {
          strng += lt;
        } else if (index === n) {
          strng += lt + "\n";
        } else if (index > n && index > 2 * n) {
          strng += lt;
        } else if (index === 2 * n) {
          strng += lt + "\n";
        } else if (index > 2 * n) {
          strng += lt;
        } else {
          strng += lt;
        }
      });
      return strng;
    } else {
      return str;
    }
  }
  static sortForm(form) {
    let arr = [
      "name",
      "task",
      "description",
      "phone",
      "url",
      "complete",
      "creation_date",
      "modified_date",
    ];
    let convert = [];
    arr.forEach((key_, index) => {
      for (const [key, value] of Object.entries(form)) {
        if (key === key_) {
          convert.push({ key: key_, value: value });
        }
      }
    });
    return convert;
  }
  static cleanUp(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.lastChild);
    }
  }
  static genID(id) {
    if (!id || id === 0) {
      return Math.round(Math.random() * 1000);
    } else {
      return id;
    }
  }
  static checkFormPopup(parent, form) {
    const para = document.createElement("p");
    para.className =
      "text-primary lean fs-6 mx-auto position-absolute top-25 start-50 translate-middle shadow-md text-center p-1";
    para.style.cssText =
      "width:70%;height:50px;border-radius:20px 20px 20px 20px;background:white;z-index:200;";
    for (const [key, value] of Object.entries(form)) {
      if (key === "name" && !value) {
        return {
          message: () => {
            para.innerHTML =
              "<span class='text-danger'>Name</span> needs to be added.<pre class='fs-4 text-danger lean'> did not save!</pre>";
            return parent.appendChild(para);
          },
          passed: false,
        };
      } else if (key === "task" && !value) {
        return {
          message: () => {
            para.innerHTML =
              "<span class='text-danger'>Task</span> needs to be added.<pre class='fs-4 text-danger lean'> did not save!</pre>";
            parent.appendChild(para);
            setTimeout(() => {
              parent.removeChild(para);
            }, 4000);
          },
          passed: false,
        };
      } else if (key === "description" && !value) {
        return {
          message: () => {
            para.innerHTML =
              "<span class='text-danger'>Description</span> needs to be added.<pre class='fs-4 text-danger lean'> did not save!</pre>";
            parent.appendChild(para);
            setTimeout(() => {
              parent.removeChild(para);
            }, 4000);
          },
          passed: false,
        };
      } else {
        return { passed: true };
      }
    }
  }
  static addCheckToForms(forms) {
    const newForms = forms.map((form) => {
      if (form.control === undefined) {
        form["complete"] = false;
      }
      if (!form.creation_date && form.creation_date === "") {
        form["creation_date"] = FormControl.creationDate();
        form["modified_date"] = FormControl.modifiedDate();
      }
      return form;
    });
    return newForms;
  }
  static creationDate() {
    let today = new Date();
    return today.toDateString();
  }
  static modifiedDate() {
    let today = new Date();
    return `${today.toDateString()}-${today.toLocaleTimeString("en-US")}`;
  }
  static checkDownload(parent, forms) {
    if (forms && forms.length === 0) {
      const div = document.createElement("div");
      div.className =
        "d-flex flex-column justify-content-center align-items-center mx-auto";
      const para = document.createElement("p");
      para.textContent = "no notes, please create a note to download";
      para.animate(
        [
          { transform: "translateY(-100%)", opacity: "0" },
          { transform: "translateY(0%)", opacity: "1" },
        ],
        { duration: 2000, iteration: 1 }
      );
      div.appendChild(para);
      parent.appendChild(div);
      setTimeout(() => {
        if (div) {
          parent.removeChild(div);
        }
      }, 3000);
    }
  }
}

const formcontrol = new FormControl();

class TransControl {
  limit = 700;
  _trans = { id: 0, lang: "", translate: { from: "", to: "" } };
  count1 = 0;
  count = 0;
  _translations = [];
  _speaks = [];
  _speak = { creation_dat: "", speak: "" };

  constructor() {
    this.translation = document.getElementById("translation");
    this.translation.className = "col-6 shadow-md";

    this.mainTranslations(this.translation);
  }
  get translations() {
    return this._translations;
  }
  set translations(trans) {
    this._translations = trans;
  }
  get translation() {
    return this._trans;
  }
  set translation(trans) {
    this._trans = trans;
  }
  get speak() {
    return this._speak;
  }
  set speak(speak) {
    this._speak = speak;
  }
  get speaks() {
    return this._speaks;
  }
  set speaks(speaks) {
    this._speaks = speaks;
  }
  //ROOT ENTRY
  mainTranslations(parent) {
    this.count1 = 0;
    this.count = 0; //reset
    const transTitle = document.createElement("h3");
    transTitle.textContent = "Translations";
    const speakTitle = document.createElement("h3");
    const hr = document.createElement("hr");
    const hr1 = document.createElement("hr");
    hr1.className = "w-75 mx-auto h-2 my-1 bg-primary";
    hr.className = "w-75 mx-auto h-2 my-1 bg-primary";
    speakTitle.textContent = "Voice / Notes";
    speakTitle.className = "lean display-6 text-center my-1 text-primary";
    transTitle.className = "lean display-6 text-center my-1 text-primary";
    chrome.storage.sync.get(["translations", "speaks"], (res) => {
      if (res && (res.translations || res.speaks)) {
        this.translations = res.translations ? res.translations : [];
        this.speaks = res.speaks ? res.speaks : [];
        parent.appendChild(transTitle);
        parent.appendChild(hr);
        if (this.translations.length > 0) {
          this.translations.forEach((trans, index) => {
            if (trans) {
              this.count++;
              let newTrans = TransControl.insertID(trans);
              this.createTrans(parent, newTrans);
            }
          });
        } else {
          this.inforClientWhenEmpty(parent);
        }
        parent.appendChild(speakTitle);
        parent.appendChild(hr1);
        if (this.speaks.length > 0) {
          this.speaks.forEach((speak, index) => {
            if (speak) {
              this.count1++;
              this.createSpeak(parent, speak);
            }
          });
        } else {
          this.inforClientWhenEmpty(parent);
        }
        this.openNoteFormBtn(parent);
        TransControl.setOverflowHeight(parent, this.limit);
      }
    });
  }
  //LOOPS-COMPONENT CHILD OF ROOT ENTRY- mainTransactions()
  createTrans(parent, trans) {
    //_trans = { lang: "", translate: { from: "", to: "" } };
    if (trans) {
      const section = document.createElement("section");
      section.id = "trans";
      section.className =
        "d-flex flex-column align-items-stretch gap-0 fs-5 position-relative shadow-md";
      section.style.cssText = "border-radius:10px;background:white;";
      const ul = document.createElement("ul");
      ul.className = "my-auto py-1 row mx-2";
      const lifrom = document.createElement("li");
      lifrom.className = "col-6 px-auto mx-auto;";
      const lito = document.createElement("li");
      lito.className = "col-6 px-auto mx-auto;";
      lito.style.cssText = "padding-block:0;margin-block:0;";
      lifrom.style.cssText = "padding-block:0;margin-block:0;";
      const para = document.createElement("p");
      const para2 = document.createElement("p");
      const para3 = document.createElement("p");
      para.className = " lean mx-auto my-0 py-0";
      para.innerHTML = `${this.count}.) <span class="text-primary lean ">language type: </span><span class="text-danger">${trans.lang}</span>`;
      para2.innerHTML = `<p class="text-danger my-0 py-0  lean">from: </p><p class="text-dark lean fs-6  my-0 py-0">${trans.translate.from}<p>`;
      lifrom.appendChild(para2); //para changed
      para3.innerHTML = `<p class="text-danger my-0 py-0  lean">to: </p><p class="text-dark  lean my-0 fs-6 py-0">${trans.translate.to}<p>`;
      lito.appendChild(para3); //para: li:to
      ul.appendChild(lifrom);
      ul.appendChild(lito);
      section.appendChild(para);
      section.appendChild(ul);
      this.deleteTrans(parent, section, trans, this.count); //DELETES
      parent.appendChild(section);
    }
  }
  //LOOPS-COMPONENT CHILD OF ROOT ENTRY- mainTransactions()
  createSpeak(parent, speak) {
    const newSpeak = this.addCreationDateIfNotExist(speak);
    const section = document.createElement("section");
    section.id = "speak";
    section.className =
      "d-flex flex-column align-items-stretch gap-1 fs-5 text-dark position-relation shadow-md";
    section.style.cssText =
      "border-radius:10px;background:white;position:relative;";
    const para = document.createElement("p");
    para.className = "px-3 fs-6 lean";
    para.innerHTML = `<span class="text-danger">Vc/Nt: ${this.count1}.) </span>
    <ul>${newSpeak.creation_date}
    <li>${newSpeak.speak}</li>
    </ul>`;
    this.deleteSpeak(parent, section, speak, this.count1); //DELETES
    section.appendChild(para);

    parent.appendChild(section);
  }
  deleteTrans(parent, section, trans, count) {
    const img = document.createElement("img");
    img.type = "button";
    img.className = "btn  btn-sm position-absolute thisHover";
    img.style.cssText =
      "box-shadow:1px 1px 7px 1px black;border-radius:10px 10px 10px 10px;transform:translate(0px,0px);right:0px;top:0px;display:grid;place-items:center;color:white;background:lightpink;border-radius:50%;";
    img.src = "./images/trash.svg";
    img.alt = "www.masterconnect.ca";
    img.setAttribute("data-hover", `del:${count}.)`);
    section.appendChild(img);
    img.addEventListener("click", (e) => {
      if (e) {
        chrome.storage.sync.get(["translations"], (res) => {
          if (res && res.translations) {
            console.log("Trans.id", trans.id, trans);
            console.log(res.translations);
            this.translations = res.translations.filter(
              (trans_) => trans_.id !== trans.id
            );
            chrome.storage.sync.set({ translations: this.translations });
            TransControl.cleanUp(parent);
            this.mainTranslations(parent);
          }
        });
      }
    });
  }
  deleteSpeak(parent, section, speak, count) {
    const img = document.createElement("img");
    img.type = "button";
    img.className = "btn btn-sm position-absolute thisHover";
    img.style.cssText =
      "box-shadow:1px 1px 7px 1px black;border-radius:10px 10px 10px 10px;transform:translate(0px,0px);right:0px;top:0px;display:grid;place-items:center;color:white;background:lightpink;border-radius:50%;";
    img.src = "./images/trash.svg";
    img.alt = "www.masterconnect.ca";
    img.setAttribute("data-hover", `del:${count}.)`);
    section.appendChild(img);
    img.addEventListener("click", (e) => {
      if (e) {
        chrome.storage.sync.get(["speaks"], (res) => {
          if (res && res.speaks) {
            this.speaks = res.speaks.filter(
              (speak_, index) => index !== count - 1
            );
            chrome.storage.sync.set({ speaks: this.speaks });
            TransControl.cleanUp(parent);
            this.mainTranslations(parent);
          }
        });
      }
    });
  }
  openNoteFormBtn(parent) {
    const container = document.createElement("div");
    container.className =
      "d-flex flex-column align-items-center justify-content-center";
    const button = document.createElement("button");
    button.className = "btn btn-primary btn-sm shadow-md m-2 text-center";
    button.textContent = "add a note";
    container.appendChild(button);
    parent.appendChild(container);
    button.style.display = "block";
    button.type = "button";
    button.style.opacity = "1";
    button.addEventListener("click", (e) => {
      if (e) {
        this.createNoteForm(parent);
        button.style.opacity = "0";
      }
    });
  }
  createNoteForm(parent) {
    //require a btn to open
    const section = document.createElement("section");
    section.style.cssText =
      "width:600px;margin-inline:auto;background:whitesmoke;";
    section.className =
      "d-grid place-items-center shadow-blue position-absolute top-50 start-50 translate-middle ";
    const form = document.createElement("form");
    form.className =
      "d-flex flex-column align-items-stretch justify-content-center  position-relative";
    const formGrp = document.createElement("div");
    const label = document.createElement("label");
    const textarea = document.createElement("textarea");
    formGrp.className =
      "form-group d-flex flex-column align-items-center justify-content-start";
    label.for = "textarea";
    label.textContent = "append a note";
    label.className = "lean fs-5";
    label.style.cssText =
      "text-decoration:underline; text-underline-offset:0.7rem;margin-bottom:1.25rem;";
    textarea.id = "textarea";
    textarea.name = "textarea";
    textarea.rows = "6";
    const button = document.createElement("button");
    button.className = "btn btn-primary btn-sm shadow-sm";
    button.textContent = "save and close";
    button.type = "submit";
    textarea.className = "w-100";
    formGrp.appendChild(label);
    formGrp.appendChild(textarea);
    form.appendChild(formGrp);
    form.appendChild(button);
    section.appendChild(form);
    parent.appendChild(section);
    textarea.addEventListener("change", (e) => {
      if (e) {
        textarea.value = e.currentTarget.value;
      }
    });
    button.addEventListener("click", (e) => {
      if (e && textarea.value) {
        e.preventDefault();
        textarea.value =
          `<p class="text-success fs-5 pb-0">NOTE:</p> ` + textarea.value;
        chrome.storage.sync.get(["speaks"], (res) => {
          if (res && res.speaks) {
            this.speaks = [...res.speaks, textarea.value];
            chrome.storage.sync.set({ speaks: this.speaks });
            TransControl.cleanUp(parent);
            this.mainTranslations(parent);
          }
        });
      }
    });
  }
  //FILL FOR EMPTY LIST
  inforClientWhenEmpty(parent) {
    const section = document.createElement("section");
    section.className =
      "d-flex flex-column justify-content-center align-content-center px-1 mx-auto";
    const img = document.createElement("img");
    img.src = "./images/fill.png";
    img.alt = "www.masterconnect.ca";
    img.style.cssText =
      "max-width:600px;aspect-ratial:auto;filter:drop-shadow(0 0 0.5rem darkgrey);border-radius:10px;";
    img.fetchPriority = "high";
    const para = document.createElement("p");
    para.className = "text-wrap text-center mx-auto my-2";
    const smile =
      "<span><img src='./images/icon16.png' alt='www.masterconnect.ca' style='border-radius:50%;background:white;box-shadow:1px 1px 6px 1px black;'/></span>";
    para.innerHTML = `Thank-you for downloading the application to help you <code>organize</code> your affairs and learn <code>languages</code>.To begin, just <code>click</code> on the below button to add a thought, to get you started.<pre> again, we thank you for connecting with us!</pre>,<span class="d-inline"> <blockquote>Gary Wallace   ${smile}</blockquote></span><blockquote>www.masterconnect.ca</blockquote>`;
    section.appendChild(para);
    section.appendChild(img);
    parent.appendChild(section);
  }

  //STATIC
  static insertID(trans) {
    //_trans = {id:0, lang: "", translate: { from: "", to: "" } };
    if (!trans.id || !isNaN(trans.id)) {
      trans.id = Math.round(Math.random() * 1000);
      return trans;
    }
    return trans;
  }
  static cleanUp(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.lastChild);
    }
  }
  static setOverflowHeight(parent, limit) {
    let clientheight = window.innerHeight;

    if (clientheight > limit) {
      parent.style.cssText = `overflow-y:scroll;height:${limit}px;`;
    } else {
      parent.style.cssText = "height:auto";
    }
  }
  addCreationDateIfNotExist(speak) {
    if (!speak.creation_date) {
      let today = new Date().toLocaleTimeString("en-US");
      this._speak = { creation_date: today, speak: speak };
      return this._speak;
    } else {
      return speak;
    }
  }
}
const transSpeak = new TransControl();
