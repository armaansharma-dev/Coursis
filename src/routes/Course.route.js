const express = require("express")
const Router = express.Router

const courseRouter = Router()

courseRouter.get("/", list)

//admin coures routes:
courseRouter.post("/", auth, restrictTo("admin"), create)                //  instead of   "/create"
courseRouter.put("/:id/publish", auth, restrictTo("admin"), publish)
courseRouter.get("/:id/allusers", auth, restrictTo("admin"), allusers)
courseRouter.patch("/:id", auth, restrictTo("admin"), edit)              //               "/edit/:id"
courseRouter.delete("/:id", auth, restrictTo("admin"), deletecourse)     //               "/delete/:id"

courseRouter.get("/:id", veiewone) //written last so doesnt conflict with other GET (they are multiple) routes with (/:id)

module.exports = {
    courseRouter : courseRouter
}