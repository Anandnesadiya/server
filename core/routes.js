const adminRouter = require("../routes/adminRouter");
const bookRouter = require("../routes/bookRouter");
const userRouter = require("../routes/userRouter");
const cartRouter = require("../routes/cartRouter");
const orderRouter = require("../routes/orderRouter");
const dashboardRouter = require("../routes/dashboardRouter"); 
const wishlistRouter = require("../routes/wishlistRouter")

module.exports = function (app) {
    app.use("/admin",adminRouter);
    app.use("/book",bookRouter);
    app.use("/user",userRouter);
    app.use("/cart",cartRouter);
    app.use("/order",orderRouter);
    app.use("/dashboard",dashboardRouter);
    app.use("/wishlist",wishlistRouter);

}