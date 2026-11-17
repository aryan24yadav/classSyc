

export const protect = async(req , res , next) => {
    try {
        let token;
        if(req.headers.authorization && req.headers.authorization.startWith('Bearer')) {
            token = req.headers.authorization.split('')[1]; // extract token part
        }

        if(!token) {
            return res.status(401).json({
                success:false,
                error:'Not authorized, no token provided'
            })
        }

        try {
            const decode = verifyToken(token);
            console.log('this is token decode result',decode);
            req.user = decode;
            next();
        } catch (error) {
            console.log('invalid or expired token')
            res.status(401).json({
                success:false,
                error:'invalid or expired token'
            })
        }
    } catch (error) {
        next(error);
    }
}