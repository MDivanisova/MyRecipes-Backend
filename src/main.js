import express from "express"
import {env} from "./config/config.env.js"
import {connectDb} from "./config/connect.database.js"
import bookmarkRouter from "../src/router/bookmark.router.js"
import commentRouter from "../src/router/comment.router.js"
import ratingRouter from "../src/router/rating.router.js"
import recepieRouter from "../src/router/recepie.router.js"
import reviewRouter from "../src/router/review.router.js"
import roleRouter from "../src/router/role.router.js"
import {authMidler} from "../src/midler/user.midler.js"
import userRouter from "./router/user.router.js"
import { errorHandler } from "./midler/zod.handler.middler.js"
import statisticRouter from "../src/router/statistic.router.js"
import recommendationRouter from "./router/recommendation.router.js"
 
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json())


app.get('/', (req, res)=> {
    res.send('Hello World')
})


app.use(`${env.BASEPATH}/bookmark`, authMidler, bookmarkRouter);
app.use(`${env.BASEPATH}/comment`, authMidler, commentRouter);
app.use(`${env.BASEPATH}/rating`, authMidler, ratingRouter); 
app.use(`${env.BASEPATH}/recepie`, authMidler,  recepieRouter);
app.use(`${env.BASEPATH}/review`, authMidler, reviewRouter );
app.use(`${env.BASEPATH}/role`, authMidler, roleRouter);
app.use(`${env.BASEPATH}/user`, userRouter);
app.use(`${env.BASEPATH}/statistic`, authMidler, statisticRouter);
app.use(`${env.BASEPATH}/recommendation`, authMidler, recommendationRouter);

app.use(errorHandler);
connectDb();

if(env.ENVIORMENT === 'DEVELOPMENT'){
    app.listen(env.PORT, ()=> {
        console.log(`Server is running on http://localhost:${env.PORT}`)
    });
}



export default app;