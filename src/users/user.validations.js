const joi = require("joi")
const register = joi
    .object({
        body: joi.object({
            firstName: joi
                .string()
                .regex(/^[A-Za-z\s]+$/)
                .required(),
            lastName: joi
                .string()
                .regex(/^[A-Za-z\s]+$/)
                .optional(),
            phoneNumber: joi
                .string()
                .regex(/^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/)
                .length(10)
                .trim()
                .required()
                .error(new Error('Valid phone number only allowed')),
            email: joi
                .string()
                .email({
                    minDomainSegments: 2,
                    tlds: {
                        allow: ['com', 'net', 'in', 'co', 'org', 'guru', 'etc', 'info'],
                    },
                })
                .strict()
                .trim()
                .required(),
            password: joi.string().required(),
            professionId:joi.string().optional()
        }),
    })
    .unknown(true);
const login = joi
    .object({
        body: joi.object({
            userName: joi
                .string()
                .strict()
                .trim()
                .required(),
            password: joi.string().required(),
        }),
    })
    .unknown(true);
const otp = joi
    .object({
        body: joi.object({
            type: joi.string().required(),
            email: joi
                .string()
                .email({
                    minDomainSegments: 2,
                    tlds: {
                        allow: ['com', 'net', 'in', 'co', 'org', 'guru', 'etc', 'info'],
                    },
                })
                .strict()
                .trim()
                .required(),
            otp: joi.when('type', {
                is: 'verify',
                then: joi.required(),
                otherwise: joi.forbidden(),
            }),
            phoneNumber: joi.string()
        }),
    }).unknown(true);

const forgot = joi
    .object({
        body: joi.object({
            email: joi
                .string()
                .email({
                    minDomainSegments: 2,
                    tlds: {
                        allow: ['com', 'net', 'in', 'co', 'org', 'guru', 'etc', 'info'],
                    },
                })
                .strict()
                .trim()
                .required(),
            password: joi.string()
        }),
    }).unknown(true);
const profile = joi
    .object({
        body: joi.object({
            firstName: joi
                .string()
                .regex(/^[A-Za-z\s]+$/)
                .optional(),
            lastName: joi
                .string()
                .regex(/^[A-Za-z\s]+$/)
                .optional(),
            phoneNumber: joi
                .string()
                .regex(/^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/)
                .length(10)
                .trim()
                .optional()
                .error(new Error('Valid phone number only allowed')),
            email: joi
                .string()
                .email({
                    minDomainSegments: 2,
                    tlds: {
                        allow: ['com', 'net', 'in', 'co', 'org', 'guru', 'etc', 'info'],
                    },
                })
                .strict()
                .trim()
                .optional(),
            professionId:joi.string().optional()
        }),
    })
    .unknown(true);
module.exports = {
    register,
    login,
    otp,
    forgot,
    profile
}