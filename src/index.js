const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const fileRouter = require("./routers/fileRouter");
require("./db/mongoose");

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(fileRouter);

app.get("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => console.log("Server is connected, Port:", port));
