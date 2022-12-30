const router = require("express").Router();
const User = require("../models/User");
const Joi = require("@hapi/joi");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Se crean las validaciones de los input por medio de la libreria @hapi/joi
const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

//validaciones para el login 
const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

router.post("/login", async (req, res) =>{
    const { error } = schemaLogin.validate(req.body);
    if (error)return res.status(400).json({ error: error.details[0].message })

    const user = await  await User.findOne({ email: req.body.email })
    if(!user) return res.status(400).json({ error: true, mensaje: "Credenciales no válidas" });

    const passValida = await bcrypt.compare(req.body.password, user.password);
    if(!passValida) return res.status(400).json({ error: true, mensaje: "Credenciales no válidas" });

    // creo el toquen  
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    //se envia el token en el header para darle acceso a las rutas protegidas
    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })

})




router.post("/register", async (req, res) => {

    //vamos a validar lo que recibimos del body de acuerdo al schema que declaramos en schemaRegister
    const { error } = schemaRegister.validate(req.body)

    // creamos una condicional, si existe un error no continuar con el código
    if (error) {
        return res.status(400).json({ error: error.details[0].message })
    }

    //se verifica si el email ya exite 
    const existeEmail = await User.findOne({ email: req.body.email })
    if (existeEmail) return res.status(400).json({ error: "Email ya registrado" })

    //se encrypta la constraseña
    const saltos = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, saltos)

    //creo una constante para capturar todo los datos
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password
    })

    try {
        //utilizo esa const para guadar los datos en la bd por medio del método save()
        const userDB = await user.save();
        //si todo va bien envio una respuesta en formato json
        res.json({
            error: null,
            data: userDB
        })


    } catch (error) {
        res.status(400).json({ error })
    }


})

module.exports = router

