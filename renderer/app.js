// dom nodes

const { ipcRenderer } = require("electron");
const items = require("./items");

let showModal = document.getElementById("show-modal"),
  closeModal = document.getElementById("close-modal"),
  modal = document.getElementById("modal");
addItem = document.getElementById("add-item");
itemUrl = document.getElementById("url");
search = document.getElementById("search");

//filter items with 'search'
search.addEventListener("keyup", (e) => {
  //load items
  Array.from(document.getElementsByClassName("read-item")).forEach((item) => {
    //hide  items that don't match search value
    let hasMatch = item.innerText.toLowerCase().includes(search.value);
    item.style.display = hasMatch ? "flex" : "none";
  });
});

//navigate item selected with up/down arrows
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    items.changeSelection(e.key);
  }
});

//disable & enable modal buttons
const toggleModalButtons = () => {
  //check button state
  if (addItem.disabled === true) {
    addItem.disabled = false;
    addItem.style.opacity = 1;
    addItem.innerText = "Add Item";
    closeModal.style.display = "inline";
  } else {
    addItem.disabled = true;
    addItem.style.opacity = 0.5;
    addItem.innerText = "Adding....";
    closeModal.style.display = "none";
  }
};

//show modal
showModal.addEventListener("click", (e) => {
  modal.style.display = "flex";
  itemUrl.focus();
});

//hide modal
closeModal.addEventListener("click", (e) => {
  modal.style.display = "none";
});

//handle new item
addItem.addEventListener("click", (e) => {
  //check a url exist
  if (itemUrl.value) {
    //send new item url to main process
    ipcRenderer.send("new-item", itemUrl.value);

    //disable buttons
    toggleModalButtons();
  }
});

//listen for new item from main process
ipcRenderer.on("new-item-sucess", (e, newItem) => {
  //add new item to items node
  items.addItem(newItem, true);

  //enable buttons
  toggleModalButtons();

  //hide Modal and clear value
  modal.style.display = "none";
  itemUrl.value = "";
});

//listen for keyboard event

itemUrl.addEventListener("keyup", (e) => {
  if (e.key === "enter") addItem.click();
});
