
const env={
    DATABASE : process.env.DATABASE,
    PORT : process.env.PORT,
    ENVIORMENT: process.env.ENVIORMENT,
    BASEPATH: process.env.BASEPATH,
    SECRETJWTKEY: process.env.JWT,
    HASH_ROUND: process.env.HASH_ROUND,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER, 
    SMTP_PASS: process.env.SMTP_PASS  
}

export { env }