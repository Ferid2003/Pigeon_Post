import {Navigate} from "react-router";
import {useAuth} from "../Authentication/AuthContext.jsx";

function PrivateRoute({children}){

    const {user} = useAuth()


    return !user ? <Navigate to="/login"/> : children
}

export default PrivateRoute