const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const userRoutes = require('./routers/user');
const propertyRoutes = require('./routers/property');
const {sequelize}= require('./config/db')
const PORT = process.env.PORT || 5000


app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use('/user' , userRoutes);
app.use('/property' , propertyRoutes);

const startServer = async () => {
    try {
        await sequelize.sync();
        await sequelize.authenticate();
        console.log('Database connected successfully');
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

startServer();