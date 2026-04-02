import jwt from "jsonwebtoken"
export const auth_notes_page = (req, res, next) => {
     // Extract token from Authorization header
     const authHeader = req.headers.authorization;
     const auth = authHeader && authHeader.startsWith("Bearer ") 
         ? authHeader.slice(7) // Remove "Bearer " prefix
         : req.cookies.token; // Fallback to cookies
    
    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized, JWT token is required"
        });
    }

    try {
        
        const decoded = jwt.verify(auth, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: `Invalid or expired token ${err}`
        });
    }
}