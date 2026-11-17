import { createContext, useCallback, useContext,useState } from "react";
import { API_ENDPOINTS } from "../utils/constants";
import api from "../utils/api";


 
const SessionContext = createContext();


export const SessionProvider = ({children}) => {
    const [currentSession,setCurrentSession] = useState(null);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);

    //Create a new session
    const createSession = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(API_ENDPOINTS.SESSION.CREATE);
            const session = response.data.data.session;

            setCurrentSession(session);
            return {success:true, session};
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to create new Session';
            setError(errorMessage);
            return {success:false, error:errorMessage};
        }finally{
            setLoading(false);
        }
    },[])

    // joinSession
    const joinSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(API_ENDPOINTS.SESSION.JOIN, {roomId} );
            const session = response.data.data.session;

            setCurrentSession(session);
            return {success:true, session};
        } catch (error) {
            const errorMessage = error.response?.dsta?.error || 'Failed to join Session';
            setError(errorMessage);
            return {success:false, error:errorMessage};
        }finally{
            setLoading(false);
        }
    },[])


    // get Session
    const getSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.get(`${API_ENDPOINTS.SESSION.GET}/${roomId}`);

            const session = response.data.data.session;

            setCurrentSession(session);
            return {success:true, session};
        } catch (error) {
            const errorMessage = error.response?.dsta?.error || 'Failed to get Session';
            setError(errorMessage);
            return {success:false, error:errorMessage};
        }finally{
            setLoading(false);
        }
    },[])


        // leave Session
    const leaveSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            await api.post(API_ENDPOINTS.SESSION.LEAVE, {roomId});

            setCurrentSession(null);
            return {success:true};
        } catch (error) {
            const errorMessage = error.response?.dsta?.error || 'Failed to leave Session';
            setError(errorMessage);
            return {success:false, error:errorMessage};
        }finally{
            setLoading(false);
        }
    },[])

       // list Session
    const listSessions = useCallback(async (status = 'active') => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.get('/session/list',{
                params: {status}
            });
            const sessions = response.data.data.session;
            return {success:true, sessions};
        } catch (error) {
            const errorMessage = error.response?.dsta?.error || 'Failed to get List of Session';
            setError(errorMessage);
            return {success:false, error:errorMessage};
        }finally{
            setLoading(false);
        }
    },[])


    const clearSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
}, []);

const value = {
    currentSession,
    loading,
    error,
    createSession,
    joinSession,
    getSession,
    leaveSession,
    listSessions,
    clearSession,
    setError
};

return( 
<SessionContext.Provider value={value}>
    {children}
    </SessionContext.Provider>
)


};


export const useSession = () => {
    
    const context = useContext(SessionContext);
    if(!context) {
        throw new Error('useSession must be used within a session Provider')
    }

    return context;
}


export default SessionContext
