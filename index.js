
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
const moment = require('moment')
require('dotenv').config();



app.use(express.json())
app.use(cors())

// DBMS Connection

const mongoURL = process.env.mongoURL

console.log(mongoURL)
mongoose.connect(`${mongoURL}/userinfo`)
    .then(() => {
        console.log("DBMS server is Connected")
    })
    .catch((err) => {
        console.log(err)
    });


// User Schema
const userSchema = mongoose.Schema(
    {
        name:
        {
            type: String,
            required: [true, "Required Name"]
        },
        position:
        {
            type: String,
            required: [true, "Required Position"]
        },
        email:
        {
            type: String,
            required: [true, "Required Age"],
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

        },

        phone: {
            type: String,
            validate: {
                validator: function (v) {

                    return /^[0-9]{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            },
            required: true
        },

        date:
        {
            type: String

        }
    }, { timestamps: true })


const userModel = mongoose.model('users', userSchema)



// Get EndPoint
app.get('/users', (req, res) => {

    console.log("This req in get", req.body, req.params)


    userModel.find()
        .then((response) => {
            res.send(response)
        })
        .catch((err) => {
            res.status(401).send("this is err of Get all user data", err)
        })

})

// Get End Point Search by name
app.get('/users/name/:name', async (req, res) => {


    try {
        const name = req.params.name;

        let userName = await userModel.find({ name: { $regex: name, $options: 'i' } })
        console.log("search API", userName)


        res.send(userName)

    }
    catch (err) {
        res.status(500).send({ message: "Some Problem" })

    }

})



// Get EndPoint Single
app.get('/users/id/:id', (req, res) => {

    console.log("This req in get")
    let id = req.params.id



    userModel.findOne({ _id: id })

        .then((response) => {
            res.send(response)
        })
        .catch((err) => {
            res.status(500).send({ message: "Some Problem" })
        })



})
// MiddleWare for Single Get EndPoint
function idMiddleware(req, res, next) {

    let id = req.params.id;
    if (id < 10) {
        res.send({ Message: "Your are blocked" })
    }
    else {
        next()
    }


}

// POST End point - Create User

app.post('/user', (req, res) => {

    const { name, position, email, phone } = req.body;
    console.log("Post", req.body)
    const date = moment(Date.now()).format("YYYY-MM-DD")


    userModel.create({
        name: name,
        position: position,
        email: email,
        phone: phone,
        date: date
    })
        .then((response) => {
            res.send({ Message: "User created Successfully", response })


        })
        .catch((err) => {
            res.send({ Message: "Failed to create user", err })
        })


})


// Delete End point single

app.delete('/user/:id', (req, res) => {

    let id = req.params.id;

    userModel.deleteOne({ _id: id })
        .then((response) => {
            res.send({ Message: "User deleted Successfully", response })


        })
        .catch((err) => {
            res.send({ Message: "Faild to delete user", err })
        })

})


// Update PUT End Point

app.put('/user/:id', (req, res) => {


    let id = req.params.id
    const updateData = req.body;


    userModel.updateOne({ _id: id }, updateData, { runValidators: true })

        .then((response) => {
            res.send({ Message: "User Updated  Successfully", response })


        })
        .catch((err) => {
            res.send({ Message: "Faild to Update user", err })
        })

})




const PORT = 5000;
app.listen(PORT, () => {
    console.log("Server is UP and Running at Port :", PORT)
})