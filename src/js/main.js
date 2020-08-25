const addBtn = document.getElementById("add");
const modal = document.getElementById("modal");
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
let keys = localStorage.getItem('keys') ? JSON.parse(localStorage.getItem('keys')) : [];
let currentId = 0;
loadLocalData();
addBtn.addEventListener("click", toggleModal);
closeBtn.addEventListener("click", toggleModal);
submitBtn.addEventListener("click", handleSubmit);
setInterval(countdown, 1000);
setInterval(removeMessage, 3000);

function checkBrowser() {
  if (typeof Storage == "undefined") {
    alert("Your browser is not supported");
  }
}
function loadLocalData(){
    for(let key of keys){
        if(document.getElementsByClassName('empty-item').length) emptyItem.parentNode.removeChild(emptyItem);
        let keyElem = makeKeyItemElem(key.label, key.issuer, key.period);
        keyBox.appendChild(keyElem);
        currentId++;
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
      secret: data.secret,
    });
  } catch (err) {
    console.log(err.message);
    return 0;
  }
  return totp.generate();
}
function handleSubmit() {
  let data = getInputData();
  if(!generateToken(data)){
    sendMessage("Your secret key is wrong.", "error");
    return;
  }
  keys.push(data);
  localStorage.setItem('keys', JSON.stringify(keys));
  let keyItem = makeKeyItemElem(data.label, data.issuer, data.period);
  keyBox.appendChild(keyItem);
  if(document.getElementsByClassName('empty-item').length) emptyItem.parentNode.removeChild(emptyItem);
  toggleModal();
}
function getInputData() {
  return {
    label: label.value ? label.value : "Unlabel",
    issuer: issuer.value ? issuer.value : "AuthBit",
    secret: secret.value,
    digits: 6,
    period: parseInt(period.value),
  };
}
function sendMessage(message, type){
    let messageItem = document.createElement('div');
    messageItem.className = 'message';
    messageItem.textContent = message;
    if(type == 'error') messageItem.classList.add('red-bg');
    messageBox.appendChild(messageItem);
}
function removeMessage(){
    for(let elem of document.getElementsByClassName('message')){
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
  keyItem.appendChild(heading);
  keyItem.appendChild(clearfix);
  keyItem.appendChild(codeItem);
  return keyItem;
}
function toggleModal() {
  modal.classList.toggle("hidden");
  container.classList.toggle("blur");
  clearForm();
}
