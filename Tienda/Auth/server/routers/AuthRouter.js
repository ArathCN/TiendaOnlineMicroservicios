import { Router } from "express";
import AuthService from "../servicios/AuthService.js";

const AuthRouter = Router();

AuthRouter.post('/signUp', async (req, res) => {
    let {name, email, password} = req.body;
    let response = null;

    let user = {
        name: name,
        email: email,
        password: password
    }

    try {
        let userToken = await AuthService.SignUp(user);
        response = {estado: "OK", mensaje: "Se ha registrado correctamente", data: userToken};
    } catch (error) {
        console.log(error);
        res.status(500);
        response = {estado: "ERROR", mensaje: error.message, data: null};
    }

    res.send(response);
});


AuthRouter.post('/logIn', async (req, res) => {
    let {email, password} = req.body;
    let response = null;

    try {
        let userToken = await AuthService.LogIn(email, password);
        response = {estado: "OK", mensaje: "Se ha iniciado sessión correctamente", data: userToken};
    } catch (error) {
        console.log(error);
        res.status(500);
        response = {estado: "ERROR", mensaje: error.message, data: null};
    }

    res.send(response);
});

AuthRouter.get('/verify', async (req, res) => {
    let tokenHeader = req.header('authorization');
    let response = null;

    if (!tokenHeader) return res.status(401).send({estado: "ERROR", mensaje: "Acceso denegado", data: null});

    try {
        let user = await AuthService.Verify(tokenHeader);
        response = {estado: "OK", mensaje: "Se ha verificado el token.", data: user};
    } catch (error) {
        console.log(error);
        res.status(401);
        response = {estado: "ERROR", mensaje: error.message, data: null};
    }

    res.send(response);
});

export default AuthRouter;