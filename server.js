require('dotenv').config();
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const cors = require('cors')
const connection = require("./database/config");

// const adminRouter = require("./routes/adminRouter");
// const bookRouter = require("./routes/bookRouter");
// const userRouter = require("./routes/userRouter");
// const cartRouter = require("./routes/cartRouter");
// const orderRouter = require("./routes/orderRouter");

app.use(cors())
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false
}));
app.use(bodyParser.json({ limit: "50mb" }));

// app.use("/admin",adminRouter);
// app.use("/book",bookRouter);
// app.use("/user",userRouter);
// app.use("/cart",cartRouter);
// app.use("/order",orderRouter);

require("./core/index")(app)

const port = process.env.PORT;
app.listen(port, () => console.log(`Server started on port ${port}`));