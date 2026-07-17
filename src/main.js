import express from "express"
import {env} from "./config/config.env.js"
import {connectDb} from "./config/connect.database.js"
 
const app = express()


app.get('/', (req, res)=> {
    res.send('Hello World')
})

connectDb();

if(env.ENVIORMENT === 'DEVELOPMENT'){
    app.listen(env.PORT, ()=> {
        console.log(`Server is running on http://localhost:${env.PORT}`)
    });
}



export default app;