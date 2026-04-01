const bcrypt = require("bcrypt")

exports.hasher = async(password, saltRounds = 12) => {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
}

exports.compare = async(plainPassword, password) => {
    const ismatch = await bcrypt.compare(plainPassword, password)
    return ismatch
}