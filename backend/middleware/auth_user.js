import Joi from "joi";

export const auth_sigup = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().trim().lowercase().email().required(),
        user_name: Joi.string().min(4).max(20).required(),
        number: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                "string.pattern.base":
                    "Phone number must be exactly 10 digits"
            }),
        password: Joi.string()
            .min(6)
            .max(100)
            .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
            .required()
            .messages({
                "string.pattern.base":
                    "Password must contain at least one uppercase letter, one number, and one special character"
            }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    req.body = value;
    next();
};
export const auth_login = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().lowercase().email(),
        user_name: Joi.string().trim().min(4).max(20),
        password: Joi.string()
            .min(6)
            .max(100)
            .required()
    }).or('email', 'user_name');

    const { error, value } = schema.validate(req.body, { abortEarly: true });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    req.body = value;
    next();
};
const validateOtp=(schema)=>(req,res,next)=>{const {error,value}=schema.validate(req.body);if(error)return res.status(400).json({success:false,message:error.details[0].message});req.body=value;next();};
const challengeFields={email:Joi.string().trim().lowercase().email().required(),challengeId:Joi.string().hex().length(48).required()};
export const auth_verify_signup=validateOtp(Joi.object({...challengeFields,otp:Joi.string().pattern(/^[0-9]{6}$/).required()}));
export const auth_resend_signup=validateOtp(Joi.object(challengeFields));
