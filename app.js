//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
  
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb+srv://admin-Harsh:test123@cluster0.vmu4a57.mongodb.net/todoListDB');
}
 
const itemsSchema = new mongoose.Schema ({
    name: String
})
 
const Item = mongoose.model("Item", itemsSchema)
 
const item1 = new Item({
    name : "Welcome to Todolist!"
})
 
const item2 = new Item({
    name : "Hit the + button to add a new item"
})
 
const item3 = new Item({
    name : "<-- Hit this to delete an item>"
})
 
const defaultItems = [ item1, item2, item3]
 
 const listSchema = {
  name: String,
  items: [itemsSchema]
 };

 const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItems)
// .then(() => {
//     console.log('Users saved to MongoDB...');
//   })
//   .catch((error) => {
//     console.error(error);
//   });
 
  app.get("/", async function (req, res) {
    const foundItems = await Item.find({});

    if (!(await Item.exists())) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

 
 
app.post("/", async function(req,res){
 
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/"+ listName);
    }
});

// app.post("/delete", (req, res) => {
//   const checkedItemId = req.body.checkbox;
//   Item.findByIdAndRemove({ _id: checkedItemId})
//     .then(() => {
//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//     })
// });

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(req.body);
 
  if (listName == 'Today') {
      await Item.findByIdAndRemove({ _id: checkedItemId});
      res.redirect("/");  
  } else {
    await List.findOneAndUpdate( { name: listName },
      { $pull: { items: { _id: checkedItemId } } } );
    res.redirect("/" + listName);
  }
});

app.get("/:customListName", async function (req, res) {
  const customListName = (req.params.customListName);
  const foundList = await List.findOne({ name: customListName });
 
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    await list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
  }
});
 
 
 
app.listen(3000, function(){
    console.log("Server is running on 3000")
})
