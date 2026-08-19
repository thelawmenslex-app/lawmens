const joi = require("joi")
const register = joi
    .object({
        body: joi.object({
            firstName: joi
                .string()
                .trim()
                .required(),
            lastName: joi
                .string()
                .trim()
                .allow('', null)
                .optional(),
            phoneNumber: joi
                .string()
                .trim()
                .required(),
            email: joi
                .string()
                .email()
                .trim()
                .required(),
            password: joi.string().required(),
            professionId: joi.string().allow('', null).optional()
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
                .trim()
                .optional(),
            lastName: joi
                .string()
                .trim()
                .allow('', null)
                .optional(),
            phoneNumber: joi
                .string()
                .trim()
                .optional(),
            email: joi
                .string()
                .email()
                .trim()
                .optional(),
            professionId: joi.string().allow('', null).optional()
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