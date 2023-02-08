const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const day = require(__dirname +"/day.js")

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.set("strictQuery",true)
mongoose.connect("mongodb+srv://nirangaalgama:2wSIGBTg8gOIg0lE@cluster0.djuosef.mongodb.net/toDoDb") // toDoDb

const itemSchema = new mongoose.Schema({
    name:String
})

const Item = mongoose.model("Item",itemSchema)

const defaultItems = [
    new Item({name:"Welcome to your todolist!"}),
    new Item({name:"Hit + button to add a new item."}),
    new Item({name:"<-- Hit this to delete an ite."}),
]

const listSchema = new mongoose.Schema({
    name:String,
    listItems:[itemSchema]
})

const List = mongoose.model("list", listSchema)

let currentDay = day()

app.get("/", (req,res)=>{
    
    Item.find({}, (err,result)=>{
        if(err){
            console.log("Something bad happened...")
        }else{
            if(result.length === 0){
                Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log("Something wrong happend..")
                }else{
                    console.log("Data was saved...")
                }
                })
                res.redirect("/")
            }else{
                let toDOList = []
                result.forEach((toDoItem)=>{
                    toDOList.push(toDoItem.name)
                })
                res.render("list", {
                    heading : currentDay,
                    list : toDOList
                })
            }
        }
        })

})

app.post("/", (req,res)=>{
    const listTitle = _.capitalize(req.body.button)
    const toDo = req.body.toDo
    const item = new Item({
         name:toDo
    })
    if(listTitle === currentDay){
        item.save((err,doc)=>{
            if(!err){
                console.log("A new item was saved to the database....")
            }
        })
        res.redirect("/")
    }else{

        List.findOneAndUpdate({name:listTitle},{$push:{listItems:item}},(err,result)=>{
            if(!err){
                res.redirect("/"+listTitle)
            }
        })

        // List.findOne({name:listTitle},(err,result)=>{
        //     if(!err){
        //         result.listItems.push(item)
        //         console.log(result.listItems)
        //         result.save()
        //         res.redirect("/"+listTitle)
        //     }
        // })
        // const toDo = req.body.toDo
        // const item = new Item({
        //     name:toDo
        // })
        // item.save((err,doc)=>{
        //     if(!err){
        //         console.log("A new item was saved to the database....")
        //     }
        // })
        // res.redirect("/")
    }
})


app.post("/delete", (req,res)=>{
    const listName = req.body.listName
    const listItem = req.body.checkBox
    if(listName === currentDay){
        Item.deleteOne({name:req.body.checkBox},(err,result)=>{
            if(!err){
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{listItems:{name:listItem}}},(err,result)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
    
})

app.get("/:customListTitle", (req,res)=>{
    const customListName = _.capitalize(req.params.customListTitle)

    List.find({name:customListName},(err,result)=>{
        if(!err){
            if(result.length === 0){
                const defaultCustomListItems = new List({
                    name:customListName,
                    listItems:defaultItems
                })
                defaultCustomListItems.save()
                res.redirect("/" + customListName)
            }else{
                result.forEach((item)=>{
                    if(item.name === customListName){
                        const customListItems = []
                        item.listItems.forEach((toDo)=>{
                            customListItems.push(toDo.name)
                        })
                        res.render("list", {
                            heading:customListName,
                            list:customListItems
                        })
                    }
                })
            }
        }
    })
    
})


// app.get("/work", (req,res)=>{
//     res.render("list", {
//         heading : "Work List",
//         list : workList
//     })
// })


const PORT = process.env.PORT
if(PORT === null || PORT === ""){
    PORT = 3000
}

app.listen(PORT, ()=>{
    console.log("Server is up and running on port 3000")
})