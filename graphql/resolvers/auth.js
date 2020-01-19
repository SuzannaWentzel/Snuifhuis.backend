const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const { transformUser, removePicture } = require('./resolverHelper');
const ERROR = require('../../helpers/errors');
const Bewoner = require('../../models/bewoner');


module.exports = {
    createUser: async args => {
            const existingUser = await User.findOne({email: args.userInput.email});
            if (existingUser) {
                throw new Error(ERROR.EMAIL_IN_USE);
            }
    
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });

            const result = await user.save();

            const token = jwt.sign({userId: result._id, email: result.email}, process.env.HASH_KEY, {
                expiresIn: '1h'
            });

            return {
                user: transformUser(user),
                token: token,
                tokenExpiration: 1
            };  
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({email: email});

        if (!user) {
            // throw new Error('User does not exist!');
            throw new Error(ERROR.INVALID_CREDENTIALS);
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            // throw new Error('Password is incorrect!');
            throw new Error(ERROR.INVALID_CREDENTIALS);
        }

        const token = jwt.sign({userId: user.id, email: user.email}, process.env.HASH_KEY, {
            expiresIn: '1h'
        });

        return {
            user: transformUser(user),
            token: token,
            tokenExpiration: 1
        }
    },
    user: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }
        try {
            const user = await User.findById(args.userId);

            if (!user) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }

            if (user._id != req.userId) {
                throw new Error(ERROR.PERMISSION_ERROR);
            }

            return transformUser(user);
        } catch (error) {
            throw new Error(error);
        }
    },
    editEmail: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }

        const user = await User.findById(req.userId);
        // user does not exist
        if (!user) {
            throw new Error(ERROR.PERMISSION_ERROR);
        }

        const userWithEmail = await User.findOne({email: args.email});
        if (userWithEmail) {
            throw new Error(ERROR.EMAIL_IN_USE);
        }

        try {
            user.email = args.email;
            let result = await user.save();

            const token = jwt.sign({userId: user.id, email: user.email}, process.env.HASH_KEY, {
                expiresIn: '1h'
            });

            return {
                user: transformUser(result),
                token: token,
                tokenExpiration: 1
            }
        } catch (error) {
            throw new Error(error);
        }         
    },
    editPassword: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }

        const user = await User.findById(req.userId);

        if (!user) {
            throw new Error(ERROR.PERMISSION_ERROR);
        }

        const isEqual = await bcrypt.compare(args.oldPassword, user.password);

        if (!isEqual) {
            throw new Error(ERROR.PERMISSION_ERROR);
        }

        try {
            const hashedPassword = await bcrypt.hash(args.newPassword, 12);
            user.password = hashedPassword;
            let result = await user.save();

            console.log(process.env.HASH_KEY);

            const token = jwt.sign({userId: user.id, email: user.email}, process.env.HASH_KEY, {
                expiresIn: '1h'
            });

            return {
                user: transformUser(result),
                token: token,
                tokenExpiration: 1
            }
        } catch (error) {
            throw new Error(error);
        }
    },
    deleteUser: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }

        const user = await User.findById(req.userId);

        if (!user) {
            throw new Error(ERROR.PERMISSION_ERROR);
        }

        try {
            if (!!user.bewoner) {
                const bewoner = await Bewoner.findById(user.bewoner);
                console.log('Bewoner: ', bewoner);
                
                if (!bewoner) {
                    throw new Error(ERROR.OBJECT_NOT_EXISTS);
                }

                if (bewoner.profilePicture) {
                    await removePicture(bewoner.profilePicture);
                }

                try {
                    await Bewoner.deleteOne({_id: bewoner._id});
                } catch (error) {
                    throw new Error(error);
                }
            }

            try {
                await User.deleteOne({_id: user._id});
            } catch (error) {
                throw new Error(error);
            }

            return true;
        } catch (error) {
            throw new Error(error);
        }        
    }
};