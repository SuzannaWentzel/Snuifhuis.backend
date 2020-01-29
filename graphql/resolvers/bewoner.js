const Bewoner = require('../../models/bewoner');
const User = require('../../models/user');
const Photo = require('../../models/photo');
const { transformBewoner, savePicture } = require('./resolverHelper');
const ERROR = require('../../helpers/errors');

module.exports = {
    bewoners: async () => {
        try {
            const bewoners = await Bewoner.find();
            return bewoners.map(async bewoner => {
                return await transformBewoner(bewoner); // if things break: try add this: _id: event._doc._id.toString()
            })
        } catch (error) {
            throw error;
        }
    },
    createBewoner: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }
        try {
            const bewoner = new Bewoner({
                name: args.bewonerInput.name,
                description: args.bewonerInput.description,
                moveInDate: new Date(args.bewonerInput.moveInDate),
                moveOutDate: new Date(args.bewonerInput.moveOutDate),
                user: req.userId
            });

            if (args.bewonerInput.profilePicture){
                let filePath = await savePicture(args.bewonerInput.profilePicture, true);
                const photo = new Photo({
                    picturePath: filePath,
                    createdAt: new Date(),
                    bewoner: bewoner,
                    profilePicture: true,
                    fwos: false,
                });
                const savedPhoto = await photo.save();
                bewoner.profilePicture = savedPhoto._id;
            }

            let createdBewoner;
            const result = await bewoner.save();
            createdBewoner = await transformBewoner(result);
            
            const user = await User.findById(result._doc.user);
            if (!user) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }
            user.bewoner = bewoner;
            await user.save();
            
            return createdBewoner;
        } catch (error) {
            throw error;
        }     
    },
    giveTitle: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }
        try {
            const bewoner = await Bewoner.findById(args.bewonerId);
            bewoner.title = args.titleId;
            let result = await bewoner.save();

            return transformBewoner(result);
        } catch (error) {
            throw error
        }
    },
    bewoner: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        } try {
            const bewoner = await Bewoner.findById(args.bewonerId);

            if (!bewoner) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }
            return await transformBewoner(bewoner);
        } catch (error) {
            throw error
        }
    },
    editBewoner: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }

        try {
            const bewoner = await Bewoner.findById(args.bewonerInput._id);
            if (!bewoner) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }

            if (bewoner.user._id != req.userId) {
                throw new Error(ERROR.PERMISSION_ERROR);
            }

            if (args.bewonerInput.profilePicture){
                let filePath = await savePicture(args.bewonerInput.profilePicture, true);
                console.log('path: ', filePath);
                const photo = new Photo({
                    picturePath: filePath,
                    createdAt: new Date(),
                    bewoner: bewoner,
                    profilePicture: true,
                    fwos: false,
                });
                const savedPhoto = await photo.save();
                bewoner.profilePicture = savedPhoto._id;
            }
            
            bewoner.name = args.bewonerInput.name;
            bewoner.description = args.bewonerInput.description;
            bewoner.moveInDate = new Date(args.bewonerInput.moveInDate);
            bewoner.moveOutDate = new Date(args.bewonerInput.moveOutDate);
            let result = await bewoner.save();

            return await transformBewoner(result);
        } catch (error) {
            throw error;
        }
    }
}