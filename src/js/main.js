const addBtn = document.getElementById("add");
const addModal = document.getElementById("add-item");
const closeBtn = document.getElementById("close");
const submitBtn = document.getElementById("submit-btn");
const emptyItem = document.getElementsByClassName("empty-item")[0];
const container = document.getElementById("container");
const keyBox = document.getElementById("key-box");
const label = document.getElementById("label");
const issuer = document.getElementById("issuer");
const secret = document.getElementById("secret");
const period = document.getElementById("period");
const messageBox = document.getElementById("message-box");
let keys = localStorage.getItem("keys")
  ? JSON.parse(localStorage.getItem("keys"))
  : [];
let currentId = 0;
let isPwd = localStorage.getItem("isPwd")
  ? localStorage.getItem("isPwd")
  : "false";
let password, keeper;
if(sessionStorage.isAuthenticated == undefined) sessionStorage.isAuthenticated = 'false';
main();
function main() {
  if (sessionStorage.isAuthenticated == 'false') {
    authenticator();
  } else {
    loadLocalData();
    addBtn.addEventListener("click", toggleModal);
    closeBtn.addEventListener("click", toggleModal);
    submitBtn.addEventListener("click", handleSubmit);
    setInterval(countdown, 1000);
    setInterval(removeMessage, 3000);
  }
}
function authenticator(e) {
  container.classList.toggle("blur");
  let authModal = makeAuthenticatorModal(isPwd == "false" ? "setup" : "login");
  document.body.appendChild(authModal);
}
function processAuth(e) {
  password = document.getElementById("password").value;
  keeper = new Blowfish(password);
  if (e.target.act == "setup") {
    localStorage.setItem("hello", keeper.encrypt("hello"));
    isPwd = "true";
    localStorage.setItem("isPwd", true);
    sessionStorage.isAuthenticated = 'true';
    main();
  } else if (localStorage.getItem("hello") != keeper.encrypt("hello")) {
    sendMessage("Wrong password.", "error");
    authenticator();
  } else {
    sessionStorage.isAuthenticated = 'true';
    main();
  }
  document.body.removeChild(document.getElementById("auth-modal"));
  container.classList.toggle("blur");
}
function makeAuthenticatorModal(type) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "auth-modal";
  const modalBox = document.createElement("div");
  modalBox.className = "modal-box";
  let title = document.createElement("h3");
  title.style.textAlign = "center";
  title.style.marginBottom = "10px";
  title.textContent =
    type == "setup" ? "Set up your password" : "Input your password";
  let passwordField = document.createElement("input");
  passwordField.type = "password";
  passwordField.id = "password";
  passwordField.className = "input-field";
  passwordField.placeholder = "Password";
  let submitBtn = document.createElement("button");
  submitBtn.classList.add("button", "blue-gradient-bg");
  submitBtn.textContent = "Submit";
  submitBtn.act = type == "setup" ? "setup" : "login";
  submitBtn.addEventListener("click", processAuth);
  modalBox.appendChild(title);
  modalBox.appendChild(passwordField);
  modalBox.appendChild(submitBtn);
  modal.appendChild(modalBox);
  return modal;
}
function checkBrowser() {
  if (typeof Storage == "undefined") {
    alert("Your browser is not supported");
  }
}
function loadLocalData() {
  for (let key of keys) {
    if (document.getElementsByClassName("empty-item").length)
      emptyItem.parentNode.removeChild(emptyItem);
    let keyElem = makeKeyItemElem(key.label, key.issuer, key.period);
    keyBox.appendChild(keyElem);
  }
}
function generateToken(data) {
  let totp;
  try {
    totp = new OTPAuth.TOTP({
      issuer: data.issuer,
      label: data.label,
      algorithm: "SHA1",
      digits: 6,
      period: data.period,
      secret: keeper.trimZeros(keeper.decrypt(data.secret)),
    });
  } catch (err) {
    console.error(err.message);
    console.warn("Please double check your secret.");
    return 0;
  }
  return totp.generate();
}
function handleSubmit() {
  let data = getInputData();
  data.secret = keeper.encrypt(data.secret);
  if (!generateToken(data)) {
    sendMessage(
      "Something went wrong. Please look at console to see error log",
      "error"
    );
    return;
  }
  keys.push(data);
  localStorage.setItem("keys", JSON.stringify(keys));
  let keyItem = makeKeyItemElem(data.label, data.issuer, data.period);
  keyBox.appendChild(keyItem);
  if (document.getElementsByClassName("empty-item").length)
    emptyItem.parentNode.removeChild(emptyItem);
  toggleModal();
}
function getInputData() {
  return {
    label: label.value ? label.value : "Unlabel",
    issuer: issuer.value ? issuer.value : "AuthBit",
    secret: secret.value.replace(/ +/g, ""),
    digits: 6,
    period: parseInt(period.value),
  };
}
function sendMessage(message, type) {
  let messageItem = document.createElement("div");
  messageItem.className = "message";
  messageItem.textContent = message;
  if (type == "error") messageItem.classList.add("red-bg");
  messageBox.appendChild(messageItem);
}
function removeMessage() {
  for (let elem of document.getElementsByClassName("message")) {
    elem.parentNode.removeChild(elem);
  }
}
function clearForm() {
  label.value = "";
  issuer.value = "";
  secret.value = "";
  period.value = 30;
}
function countdown() {
  let timers = document.getElementsByClassName("timer");
  let id = 0;
  for (let timer of timers) {
    if (parseInt(timer.textContent) == keys[id].period) {
      let code = document.querySelector(`[key-id="${id}"] .code`);
      code.textContent = generateToken(keys[id]);
      timer.textContent = parseInt(timer.textContent) - 1;
    } else if (parseInt(timer.textContent)) {
      timer.textContent = parseInt(timer.textContent) - 1;
    } else {
      timer.textContent = keys[id].period;
    }
    id++;
  }
}
function makeKeyItemElem(label, issuer, period) {
  let keyItem = document.createElement("div");
  keyItem.className = "key-item";
  keyItem.setAttribute("key-id", currentId);
  let time = document.createElement("div");
  time.className = "timer";
  time.textContent = period;
  let labelItem = document.createElement("h3");
  labelItem.textContent = label;
  labelItem.className = "item-label";
  let issuerItem = document.createElement("p");
  issuerItem.textContent = issuer;
  issuerItem.className = "item-issuer";
  let heading = document.createElement("div");
  heading.appendChild(time);
  heading.appendChild(labelItem);
  heading.appendChild(issuerItem);
  let clearfix = document.createElement("div");
  clearfix.className = "clearfix";
  let codeItem = document.createElement("p");
  codeItem.className = "code";
  codeItem.textContent = "000000";
  let options = document.createElement("div");
  options.className = "options";
  let editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.addEventListener("click", editItem);
  let removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.addEventListener("click", removeItem);
  options.appendChild(editBtn);
  options.appendChild(removeBtn);
  keyItem.appendChild(heading);
  keyItem.appendChild(clearfix);
  keyItem.appendChild(codeItem);
  keyItem.appendChild(options);
  currentId++;
  return keyItem;
}
function removeItem(e) {
  if (
    confirm("Are you sure? (Your browser will be refreshed after delete item)")
  ) {
    let id = get2ndParentId(e);
    keys.splice(id, 1);
    localStorage.setItem("keys", JSON.stringify(keys));
    window.location.reload();
  }
}
const get2ndParentId = (e) =>
  parseInt(e.target.parentNode.parentNode.getAttribute("key-id"));
function editItem(e) {
  toggleModal();
  let id = get2ndParentId(e);
  label.value = keys[id].label;
  issuer.value = keys[id].issuer;
  period.value = keys[id].period;
  secret.value = keeper.trimZeros(keeper.decrypt(keys[id].secret));
  submitBtn.removeEventListener("click", handleSubmit);
  submitBtn.id = id;
  submitBtn.addEventListener("click", updateData);
}
function updateData(e) {
  let id = submitBtn.id;
  let data = getInputData();
  data.secret = keeper.encrypt(data.secret);
  if (!generateToken(data)) {
    sendMessage(
      "Something went wrong. Please look at console to see error log."
    );
    return;
  }
  keys[id] = data;
  localStorage.setItem("keys", JSON.stringify(keys));
  updateElement(id, data);
  toggleModal();
  submitBtn.addEventListener('click', handleSubmit);
  submitBtn.removeEventListener('click', updateData);
}
function updateElement(id, data) {
  const label = document.querySelector(`[key-id="${id}"] .item-label`);
  const issuer = document.querySelector(`[key-id="${id}"] .item-issuer`);
  const period = document.querySelector(`[key-id="${id}"] .timer`);
  const code = document.querySelector(`[key-id="${id}"] .code`);
  label.textContent = data.label;
  issuer.textContent = data.issuer;
  period.textContent = data.period;
  code.textContent = generateToken(data);
}
function toggleModal() {
  addModal.classList.toggle("hidden");
  container.classList.toggle("blur");
  clearForm();
}
