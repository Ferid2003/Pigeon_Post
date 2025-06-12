import { createRoot } from 'react-dom/client'
import './Css/index.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router";
import Login from "./login/Login.jsx";
import PrivateRoute from "./login/PrivateRoute.jsx";
import {AuthProvider} from "./Authentication/AuthContext.jsx";
import UserSettings from "./ChatComponents/UserSettings.jsx";
import Chat from "./MainChat/Chat.jsx";
import Gradient from "./Gradient/gradient.jsx";
import Pigeon from "./Animation/Pigeon.jsx";
import React from "react";
import SingUpFinish from "./login/SingUpFinish.jsx";



const router = createBrowserRouter(    [
    {
        path: "/login",
        element: <Login/>,
    },
    {
        path: "/finish_sign_up",
        element: <SingUpFinish/>,
    },
    {
        path: "/chat",
        element: <PrivateRoute><Chat/></PrivateRoute>,
    },
    {
        path: "/gradient",
        element: <Gradient style={{height:'100vh'}}/>
    },
    {
        path: "/pigeon",
        element: <Pigeon/>
    },
    {
        path: "/settings",
        element: <PrivateRoute><UserSettings/></PrivateRoute>,
    },
    {
        index:true,
        element: <Navigate to="/login"/>
    }

]);

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
)

