const User = require('../../models/user');
const Photo = require('../../models/photo');
const { transformPhoto, savePicture } = require('./resolverHelper');
const ERROR = require('../../helpers/errors');

module.exports = {
    createPhoto: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }
        try {
            const user = await User.findById(req.userId);
            const bewoner = user.bewoner;

            const filePath = await savePicture(args.photoInput.picture);
            const photo = new Photo({
                picturePath: filePath,
                createdAt: new Date(),
                bewoner: bewoner,
                description: args.photoInput.description,
                private: args.photoInput.private,
                fwos: args.photoInput.fwos? true : false,
            });

            const savedPhoto = await photo.save();
            const createdPhoto = await transformPhoto(savedPhoto);
            return createdPhoto;
        } catch (error) {
            throw new Error(error);
        }
    },
    createPhotos: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }
        try {
            const user = await User.findById(req.userId);
            const bewoner = user.bewoner;
            let isFwos = args.photoInputs[0].fwos? true: false;
            for (let photoInput of args.photoInputs) {
                const filePath = await savePicture(photoInput.picture);
                const photo = new Photo({
                    picturePath: filePath,
                    createdAt: new Date(),
                    bewoner: bewoner,
                    private: photoInput.private,
                    fwos: isFwos,
                });

                const savedPhoto = await photo.save();
                await transformPhoto(savedPhoto);
            }

            const photos = await Photo.find({ bewoner: bewoner, fwos: isFwos });
            let result = [];
            photos.forEach(async photo => {
                let transformedPhoto = await transformPhoto(photo);
                result.push(transformedPhoto);
            });

            return result;
        } catch (error) {
            throw new Error(error);
        }
    },
    photos: async (args, req) => {
        if (!req.isAuth) {
            // get public photos
            try {
                const photos = await Photo.find({ fwos: false, private: false });
                let result = [];
                photos.forEach(async photo => {
                    let transformedPhoto = await transformPhoto(photo);
                    result.push(transformedPhoto);
                });

                return result;
            } catch (error) {
                throw new Error(error);
            }
        } else {
            // get all photos
            try {
                let photos;
                if (!!args.bewonerId) {
                    photos = await Photo.find({ fwos: false, bewoner: args.bewonerId });
                } else {
                    photos = await Photo.find({ fwos: false });
                }
                let result = [];
                photos.forEach(async photo => {
                    let transformedPhoto = await transformPhoto(photo);
                    result.push(transformedPhoto);
                });

                return result;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    fwosPhotos: async (args, req) => {
        if (!req.isAuth) {
            // get public fwos photos
            try {
                const photos = await Photo.find({ fwos: true, private: false });
                let result = [];
                photos.forEach(async photo => {
                    let transformedPhoto = await transformPhoto(photo);
                    result.push(transformedPhoto);
                });

                return result;
            } catch (error) {
                throw new Error(error);
            }
        } else {
            // get all fwos photos
            try {
                let photos;
                console.log(args.bewonerId);
                if (!!args.bewonerId) {
                    photos = await Photo.find({ fwos: true, bewoner: args.bewonerId });
                } else {
                    photos = await Photo.find({ fwos: true });
                }
                let result = [];
                photos.forEach(async photo => {
                    let transformedPhoto = await transformPhoto(photo);
                    result.push(transformedPhoto);
                });

                return result;
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    editPhoto: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(ERROR.AUTH_ERROR);
        }

        try {
            const photo = await Photo.findById(args.photoInput._id);
            if (!photo) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }

            const user = await User.findById(req.userId);
            if (!user) {
                throw new Error(ERROR.OBJECT_NOT_EXISTS);
            }

            if (JSON.stringify(user.bewoner._id) != JSON.stringify(photo.bewoner._id)) {
                throw new Error(ERROR.PERMISSION_ERROR);
            }

            photo.description = args.photoInput.description;
            photo.private = args.photoInput.private;
            photo.fwos = args.photoInput.fwos;

            const savedPhoto = await photo.save();

            return transformPhoto(savedPhoto);
        } catch (error) {
            throw new Error(error);
        }
    }
}