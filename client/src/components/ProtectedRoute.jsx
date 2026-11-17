import { useAuth } from "../hooks/useAuth";
import {FaSpinner} from "react-icons/fa";
import {Navigate} from 'react-router-dom';
import {ROUTES} from '../utils/constants';

function ProtectedRoute({children}) {

    const {isAuthenticated,loading} = useAuth();

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-primary mb-4"/>
                    <p className="text-lg text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if(!isAuthenticated){
        return <Navigate to={ROUTES.HOME} replace/>
    }

    return children;
    
}

export default ProtectedRoute;