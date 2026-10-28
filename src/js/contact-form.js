import gsap from "gsap";

// Contact form states (Figma 1611:1042 – 1611:7579, docs/implementation/17-contact.md).
// Nothing is sent yet (user decision): the upload progress and the sending
// are played here, so every state of the design can be seen and checked.
const TURNAROUND = {
  Inquiries: ["1 Week", "2-4 weeks", ">4 weeks", "Others"],
  Partnership: ["1-3 requests / week", "5-10 requests / week", "> 10 requests / week", "I would like an estimate"],
};
const OTHERS = "Others"; // opens the deadline field
const MAX_BYTES = 100 * 1024 * 1024;
const ACCEPTED = /\.(pdf|docx?|pptx?)$/i;
const UPLOAD_SECONDS = 1.6;

// Required fields in form order, with the names used in the error message.
const REQUIRED = [
  ["company", "Company Name"],
  ["name", "Your Name"],
  ["email", "Email"],
  ["scope", "Project Scope"],
  ["type", "Project Type"],
  ["turnaround", "Turnaround"],
];

// "A", "A and B", "A, B, and C" (as in Figma 1611:5344).
const listNames = (names) =>
  names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))}kb` : `${Math.round(bytes / (1024 * 1024))}mb`;

export function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return () => {};

  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: events.signal });
  const field = (name) => form.querySelector(`[data-field="${name}"]`);

  // Turnaround dropdown
  const turnaround = field("turnaround");
  const select = turnaround.querySelector(".contact-form__select");
  const selectButton = select.querySelector(".contact-form__select-button");
  const selectValue = select.querySelector(".contact-form__select-value");
  const panel = select.querySelector(".contact-form__options");
  const list = select.querySelector('[role="listbox"]');
  const deadline = select.querySelector(".contact-form__deadline");
  let active = -1;

  const options = () => [...list.children];

  const setValue = (value) => {
    form.elements.turnaround.value = value;
    selectValue.textContent = value || selectValue.dataset.placeholder;
    selectValue.classList.toggle("is-placeholder", !value);
    options().forEach((option) => option.setAttribute("aria-selected", String(option.textContent === value)));
    deadline.hidden = value !== OTHERS;
    if (value !== OTHERS) form.elements.deadline.value = "";
    changed();
  };

  const setActive = (index) => {
    const items = options();
    active = (index + items.length) % items.length;
    items.forEach((option, i) => option.classList.toggle("is-active", i === active));
    list.setAttribute("aria-activedescendant", items[active].id);
  };

  const openPanel = () => {
    panel.hidden = false;
    selectButton.setAttribute("aria-expanded", "true");
    const current = options().findIndex((option) => option.textContent === form.elements.turnaround.value);
    setActive(Math.max(current, 0));
    list.focus();
  };

  const closePanel = (focusButton) => {
    if (panel.hidden) return;
    panel.hidden = true;
    selectButton.setAttribute("aria-expanded", "false");
    if (focusButton) selectButton.focus();
  };

  // "Others" keeps the list open so the deadline can be written below it.
  const choose = (index) => {
    const value = options()[index].textContent;
    setActive(index);
    setValue(value);
    if (value === OTHERS) form.elements.deadline.focus();
    else closePanel(true);
  };

  const fillOptions = (type) => {
    list.replaceChildren(
      ...TURNAROUND[type].map((label, i) => {
        const option = document.createElement("li");
        option.className = "contact-form__option";
        option.id = `contact-turnaround-${i}`;
        option.setAttribute("role", "option");
        option.textContent = label;
        return option;
      }),
    );
    setValue("");
  };

  on(selectButton, "click", () => (panel.hidden ? openPanel() : closePanel(false)));
  on(selectButton, "keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openPanel();
    }
  });
  on(list, "click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) choose(options().indexOf(option));
  });
  on(list, "keydown", (event) => {
    if (event.key === "ArrowDown") setActive(active + 1);
    else if (event.key === "ArrowUp") setActive(active - 1);
    else if (event.key === "Enter" || event.key === " ") choose(active);
    else if (event.key === "Escape") closePanel(true);
    else if (event.key === "Tab") closePanel(false);
    else return;
    event.preventDefault();
  });
  on(form.elements.deadline, "keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter") {
      event.preventDefault();
      closePanel(true);
    }
  });
  on(document, "pointerdown", (event) => {
    if (!select.contains(event.target)) closePanel(false);
  });
  on(select, "focusout", (event) => {
    if (event.relatedTarget && !select.contains(event.relatedTarget)) closePanel(false);
  });

  // Project Type shows Turnaround with its own options.
  on(form, "change", (event) => {
    if (event.target.name !== "type") return;
    turnaround.hidden = false;
    fillOptions(event.target.value);
  });

  // Message counter
  const message = form.elements.message;
  const count = form.querySelector("[data-count]");
  const updateCount = () => (count.textContent = message.value.length);
  on(message, "input", updateCount);

  // Attachment: one file, progress played from 0 to 100%.
  const dropzone = form.querySelector("[data-dropzone]");
  const fileInput = form.elements.attachment;
  const upload = form.querySelector("[data-upload]");
  const progress = upload.querySelector("[data-progress]");
  const progressFill = upload.querySelector("[data-progress-fill]");
  const progressValue = upload.querySelector("[data-progress-value]");
  const fileSize = upload.querySelector("[data-file-size]");
  const removeButton = upload.querySelector("[data-file-remove]");
  let uploading = null;

  const showProgress = (value) => {
    progressFill.style.setProperty("--progress", value / 100);
    progressValue.textContent = `${Math.round(value)}%`;
  };

  const clearFile = () => {
    uploading?.kill();
    uploading = null;
    fileInput.value = "";
    upload.hidden = true;
    dropzone.hidden = false;
  };

  const takeFile = (file) => {
    if (!file) return;
    const accepted = ACCEPTED.test(file.name) || /^(image|video|audio)\//.test(file.type);
    if (!accepted || file.size > MAX_BYTES) {
      clearFile();
      showError("Please upload a PDF, DOC, PPTX or media file of up to 100mb.");
      return;
    }
    const size = formatSize(file.size);
    upload.querySelector("[data-file-type]").textContent = (file.name.split(".").pop() || "").slice(0, 4).toUpperCase();
    upload.querySelector("[data-file-name]").textContent = file.name;
    fileSize.textContent = size;
    progress.hidden = false;
    removeButton.hidden = true;
    dropzone.hidden = true;
    upload.hidden = false;

    const state = { value: 0 };
    showProgress(0);
    uploading?.kill();
    uploading = gsap.to(state, {
      value: 100,
      duration: UPLOAD_SECONDS,
      ease: "power1.inOut",
      onUpdate: () => showProgress(state.value),
      onComplete: () => {
        progress.hidden = true;
        fileSize.textContent = `${size} - 100% uploaded`;
        removeButton.hidden = false;
        uploading = null;
      },
    });
  };

  on(fileInput, "change", () => takeFile(fileInput.files[0]));
  on(removeButton, "click", () => {
    clearFile();
    fileInput.focus();
  });
  on(dropzone, "dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  });
  on(dropzone, "dragleave", () => dropzone.classList.remove("is-dragover"));
  on(dropzone, "drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    takeFile(file);
  });

  // Checking and sending
  const error = form.querySelector(".contact-form__error");
  const submit = form.querySelector(".contact-form__submit");
  const submitLabel = submit.querySelector("[data-submit-label]");
  const submitCheck = submit.querySelector(".contact-form__submit-check");
  const again = form.querySelector("[data-again]");
  let tried = false;

  function showError(text) {
    error.textContent = text;
    error.hidden = !text;
  }

  const isEmpty = (name) => {
    if (name === "turnaround" && turnaround.hidden) return false;
    const control = form.elements[name];
    if (control instanceof RadioNodeList) return ![...control].some((input) => input.checked);
    if (control.type === "checkbox") return !control.checked;
    return !control.value.trim() || (control.type === "email" && control.validity.typeMismatch);
  };

  // Marks the empty required fields; returns their names.
  const check = () => {
    const missing = REQUIRED.filter(([name]) => {
      const empty = isEmpty(name);
      field(name).classList.toggle("is-invalid", empty);
      return empty;
    }).map(([, label]) => label);
    showError(missing.length ? `Please fill out the required form (${listNames(missing)})` : "");
    return missing.length === 0;
  };

  // After a first attempt, the marks follow the visitor's input.
  function changed() {
    if (tried) check();
  }
  on(form, "input", changed);
  on(form, "change", changed);

  const setSent = (sent) => {
    [...form.elements].forEach((control) => {
      if (control !== again) control.disabled = sent;
    });
    submitLabel.textContent = sent ? "Submitted" : "Submit";
    submitCheck.hidden = !sent;
    again.hidden = !sent;
  };

  on(form, "submit", (event) => {
    event.preventDefault();
    tried = true;
    closePanel(false);
    if (!check()) return;
    setSent(true);
    again.focus();
  });

  on(again, "click", () => {
    setSent(false);
    form.reset();
    tried = false;
    REQUIRED.forEach(([name]) => field(name).classList.remove("is-invalid"));
    showError("");
    turnaround.hidden = true;
    list.replaceChildren();
    setValue("");
    clearFile();
    updateCount();
    form.elements.company.focus();
  });

  setValue("");

  return () => {
    events.abort();
    uploading?.kill();
  };
}
