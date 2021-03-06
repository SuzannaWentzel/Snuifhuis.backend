const Bewoner = require('../../models/bewoner');
const User = require('../../models/user');
const Title = require('../../models/title');
const Photo = require('../../models/photo');
const { dateToString } = require('../../helpers/date');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const fsp = require('fs').promises;

const FOLDERPATH= 'C:/Users/Suzanna Wentzel/Documents/Snuifhuis/SnuifhuisWebsite/Versie 3/Code/Snuifhuis.backend/public/uploads/'

// to get a function for waiting for writeFile to be finished.
// const writePicture = promisify(fs.writeFile);

const transformBewoner = async bewoner => {
    return {
        ...bewoner._doc, 
        moveInDate: dateToString(bewoner._doc.moveInDate),
        moveOutDate: dateToString(bewoner._doc.moveOutDate),
        user: getUser.bind(this, bewoner.user),
        title: bewoner._doc.title? getTitle.bind(this, bewoner.title) : undefined,
        profilePicture: bewoner.profilePicture? await getPhoto.bind(this, bewoner.profilePicture) : undefined
    };
}

const transformTitle = title => {
    return {
        ...title._doc,
        date: dateToString(title._doc.date),
        bewoner: getBewoner.bind(this, title.bewoner)
    }
}

const transformUser = user => {
    return {
        ...user._doc,
        bewoner: user.bewoner? getBewoner.bind(this, user.bewoner) : undefined,
        password: null
    }
}

const transformPhoto = photo => {
    return {
        ...photo._doc,
        bewoner: getBewoner.bind(this, photo.bewoner),
        createdAt: dateToString(photo._doc.createdAt),
        picture: photo.picturePath,
    }
}

const getTitle = async titleId => {
    try {
        const title = await Title.findById(titleId);
        return transformTitle(title);
    } catch (error) {
        throw error;
    }
}

const getUser = async userId => {
    try {
        const user = await User.findById(userId);

        return { 
            ...user._doc,
            bewoner: getBewoner.bind(this, user.bewoner)
        };  
    } catch (error) {
        throw error;
    } 
}

const getBewoner = async bewonerId => {
    try {
        const bewoner = await Bewoner.findById(bewonerId);
        return await transformBewoner(bewoner);
    } catch (error) {
        throw error;
    }
}

const getPhoto = async photoId => {
    try {
        const photo = await Photo.findById(photoId);
        return await transformPhoto(photo);
    } catch (error) {
        throw error;
    }
}

// returns filePath of where image is stored.
const savePictureFromBase64 = async (base64ImageInput, profile) => {
    let base64Image = base64ImageInput.replace(/^data:image\/\w+;base64,/, '');
    let fileNameTemp = '' + new Date().toISOString() + Math.random() + '.png';
    // if profile picture, store in profile folder
    let fileName ="";
    if (profile) {
        fileName = "profile/"
    }
    fileName += fileNameTemp.split(':').join('');

    try {
        await fsp.writeFile(FOLDERPATH + fileName, base64Image, {encoding: 'base64'});
        let image = await cloudinary.uploader.upload(FOLDERPATH + fileName, {
            resource_type: "image",
            public_id: fileName,
            overwrite: true
        });
        return image.secure_url;  
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

const removePicture = async filePath => {
    try {
        fs.unlinkSync(FOLDERPATH + filePath);
    } catch (err) {
        if (err && err.code == 'ENOENT') {
            console.log('File does not exist');
        } else if (err) {
            throw new Error(err);
        }
    }    
}

exports.getUser = getUser;
exports.getBewoner = getBewoner;
exports.transformBewoner = transformBewoner;
exports.transformTitle = transformTitle;
exports.transformUser = transformUser;
exports.savePicture = savePictureFromBase64;
exports.removePicture = removePicture;
exports.transformPhoto = transformPhoto;