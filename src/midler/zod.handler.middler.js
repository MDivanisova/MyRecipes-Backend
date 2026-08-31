import zod from "zod"

const errorHandler = (err, req, res, next)=>{
    if(err instanceof zod.ZodError){
        const formatedError = err.issues.map(error=>({
            field: error.path.join("."),
            message: error.message
        }));

        return res.status(400).json({
            "message" : "validation error",
            "error": formatedError
        })
    }
    else{
        console.log("--------------------------------------");
        console.log("ERROR DETECTED")
        console.log("--------------------------------------");
        console.log("Path: " + req.method +  " " + req.path)
        console.log("--------------------------------------")
        console.log(err.stack)
        console.log("--------------------------------------")
    }
    return res.status(500).json({
        "msg":"Internal server error"
    })
}

export {errorHandler};