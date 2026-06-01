require("dotenv").config()
const { app } = require("./app.js")
const { connectDB } = require("./config/db.js")

const PORT = process.env.PORT || 5400

const startServer = async() => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch(error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer()