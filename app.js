//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create a new database inside MongoDB
mongoose.connect("mongodb+srv://admin-aanya:Test123@cluster0.edca7yw.mongodb.net/todolistDB");

//create a new schema
const itemsSchema = {
  name: String
};

//new mongoose model based on this Schema

const Item = mongoose.model("Item", itemsSchema);

//new document using mongoose
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add an item"
});
const item3 = new Item({
  name: "<-- Hit this to delete."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async function(req, res) {

  const foundItems = await Item.find();
  if(foundItems.length === 0){
    // insert the array of dafaultItems 
    Item.insertMany(defaultItems);
    res.redirect("/");
  }else{
    //passing  to list.ejs
    res.render("list", {listTitle : "Today", newListItems: foundItems});
  }

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
    item.save();
    res.redirect("/");
  }else{
    const foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    await foundList.save();
    res.redirect("/" + listName);
  }
});

app.get("/:customListName", async function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  const foundList = await List.findOne({name: customListName});
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
   
  
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
      
  } else {
      const foundList = await  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
  }

});




// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
