//modules
const { shell } = require("electron");
const fs = require("fs");

//dom node
let items = document.getElementById("items");

//get readerJS content
let readerJS;
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString();
});

//track items in storage

exports.storage = JSON.parse(localStorage.getItem("readit-items")) || [];

//Listen for 'done' message from reader window
window.addEventListener("message", (e) => {
  //check for correct message
  if (e.data.action === "delete-reader-item") {
    //delete item at given index
    this.delete(e.data.itemIndex);

    //close the reader window

    e.source.close();
  }
});

//delete item
exports.delete = (itemIndex) => {
  //remove item from dom

  items.removeChild(items.childNodes[itemIndex]);

  //remove item from storage
  this.storage.splice(itemIndex, 1);

  //persist storage
  this.save();

  //select previous item or new top item
  if (this.storage.length) {
    //get new selected item index
    let newSelectedItemIndex = itemIndex === 0 ? 0 : itemIndex - 1;

    //select item at new index
    document
      .getElementsByClassName("read-item")
      [newSelectedItemIndex].classList.add("selected");
  }
};
//get selected item index
exports.getSelectedItem = () => {
  //get selected node
  let currentItem = document.getElementsByClassName("read-item selected")[0];

  //Get item index
  let itemIndex = 0;
  let child = currentItem;

  while ((child = child.previousElementSibling) != null) itemIndex++;

  //return selected item and index
  return { node: currentItem, index: itemIndex };
};
//persist storage
exports.save = () => {
  localStorage.setItem("readit-items", JSON.stringify(this.storage));
};

//set item as selected
exports.select = (e) => {
  //remove currently selected item class
  this.getSelectedItem().node.classList.remove("selected");

  //add to clicked item
  e.currentTarget.classList.add("selected");
};

//move to newly selected item
exports.changeSelection = (direction) => {
  //get selected item
  let currentItem = this.getSelectedItem();

  //handle up/down
  if (direction === "ArrowUp" && currentItem.node.previousElementSibling) {
    currentItem.node.classList.remove("selected");
    currentItem.node.previousElementSibling.classList.add("selected");
  } else if (direction === "ArrowDown" && currentItem.node.nextElementSibling) {
    currentItem.node.classList.remove("selected");
    currentItem.node.nextElementSibling.classList.add("selected");
  }
};

//open selected item in native broswer
exports.openNative = () => {
  //only if we have items (in case of menu open)
  if (!this.storage.length) return;

  //get selected item
  let selectedItem = this.getSelectedItem();

  //get item's url
  let contentUrl = selectedItem.node.dataset.url;

  //open in user's default browser
  shell.openExternal(contentUrl);
};

// open selected item
exports.open = () => {
  //only if we have items (in case of menu open)
  if (!this.storage.length) return;

  //get selected item
  let selectedItem = this.getSelectedItem();

  //get item's url
  let contentUrl = selectedItem.node.dataset.url;

  //open item in proxy browserwindow
  let readerWin = window.open(
    contentUrl,
    "",
    `
  maxWidth=800,
  maxHeight=500,
  width=500,
  height=400,
  backgroundColor=#DEDEDE,
  nodeIntegration=0,
  contextIsolation=1
  `
  );
  //inject javascript with specific item index (selectedItem.index)
  readerWin.eval(readerJS.replace("%index%", selectedItem.index));
};
//add new item

exports.addItem = (item, isNew = false) => {
  //create a new dom node
  let itemNode = document.createElement("div");

  //assign 'read-item' class
  itemNode.setAttribute("class", "read-item");

  //set item url as data attribute
  itemNode.setAttribute("data-url", item.url);

  //add inner html
  itemNode.innerHTML = `<img src="${item.screenshot}"><h2>${item.title}</h2>`;

  //append new node to "items"
  items.appendChild(itemNode);

  //attach click  handler to 'select'
  itemNode.addEventListener("click", this.select);

  //Attach doubleclick handler to open
  itemNode.addEventListener("dblclick", this.open);

  //if this the first time, select it
  if (document.getElementsByClassName("read-item").length === 1) {
    itemNode.classList.add("selected");
  }

  //add item to storage and persist
  if (isNew) {
    this.storage.push(item);
    this.save();
  }
};

//add items from storage when app loads
// console.log(this.storage);
this.storage.forEach((item) => {
  //   console.log(item);
  return this.addItem(item);
});
