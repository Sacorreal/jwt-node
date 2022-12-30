const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config()

const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.fuv16e1.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;


mongoose.set('strictQuery', true)

mongoose.connect(uri,{ keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,} )

    .then(db => console.log("Conectado a base de datos-login"))
    .catch(e => console.log(e))

// import routes
const authRoutes = require("./routes/auth");
const dashboadRoutes = require('./routes/admin');
const verifyToken = require('./routes/validate-token');

// route middlewares
app.use("/api/user", authRoutes);
app.use('/api/admin', verifyToken, dashboadRoutes);

//rutas
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en puerto: ${PORT}`)
})