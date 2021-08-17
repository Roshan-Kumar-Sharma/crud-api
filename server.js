const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv').config();
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

let users = [];

app.get('/', (req, res) => {
    res.send('Nothing here. Use /users endpoint');
})

app.get("/users", (req, res) => {
    res.json(users.length?users: "User database is empty.");
});

app.post("/users", async (req, res) => {
    const body = req.body;
    const hashedPassword = await bcrypt.hash(body.password, 10);

    users.push({
        name: body.name,
        password: hashedPassword,
    });

    console.log(`new user created successfully => {${body.name}, ${body.password}}`);

    res.status(201).send("user created succefully");
});

app.put("/users", async (req, res) => {
    const old_name = req.body.old_name;
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    // const exists = users.find((user) => {
    //     return user.name == old_name;
    // })

    // let user = users.forEach((user) => {
    //     if(user.name == old_name){
    //         user.name = req.body.new_name;
    //         user.password = req.body.password;
    //         // res.send('User updated succesfully');
    //     }
    // })

    let user = users.find((user) => {
        if (user.name === old_name) {
            user.name = req.body.new_name;
            user.password = hashedPassword;
            return user;
        }
    });

    console.log(req.body);
    // console.log(user);

    res.send(user ? "User updated successfully" : "No user found");
});

app.delete("/users", async (req, res) => {
    let msg = "User doesn't exist";

    for(let itr=0; itr<users.length; itr++){
        if(users[itr].name === req.body.name){
            const isTrue = await bcrypt.compare(req.body.password, users[itr].password);
            if (isTrue) {
                msg = "User deleted succefully";
                console.log(users.splice(itr, 1));
                break;
            } 
            else 
            {
                msg = "Wrong Password";
            }
        }
    }

    res.send(msg);
});

app.use((req, res, next) => {
    const error = new Error('This endpoint is not available.');
    error.status = 404;
    next(error);
})

app.use((err, req, res, next) => {
    res.send({
        error: {
            status: err.status,
            message: err.message
        }
    })
})

app.listen(8888, () => {
    console.log("server is up at port 8888");
});
