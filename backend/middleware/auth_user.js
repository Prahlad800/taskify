import Joi from "joi";

export const auth_sigup = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
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

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    next();
};
export const auth_login = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email(),
        user_name: Joi.string().min(4).max(20),
      /*  number: Joi.string()
        .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                "string.pattern.base":
                    "Phone number must be exactly 10 digits"
                }),*/
                // name: Joi.string().min(3).max(100).required(),
        password: Joi.string()
            .min(6)
            .max(100)
            .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
            .required()
            .messages({
                "string.pattern.base":
                    "Password is worng"
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    next();
};