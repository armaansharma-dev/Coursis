// Load .env FIRST. utils/token.js reads process.env.JWT_SECRET the
// moment it is required, so the secret must exist before app.js loads.
// Resolve the path explicitly: dotenv otherwise looks in process.cwd(),
// which breaks when the server is started from src/ or the repo root.
require("dotenv").config({
    path: require("node:path").resolve(__dirname, "..", ".env")
})

// Some local networks refuse DNS SRV lookups, which mongodb+srv://
// requires. Keep the workaround, but make it explicit and optional.
const dns = require("node:dns")
const dnsServers = (process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean)

if (dnsServers.length > 0) {
    dns.setServers(dnsServers)
}

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
