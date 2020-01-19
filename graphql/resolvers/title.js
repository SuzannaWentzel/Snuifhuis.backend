const Title = require('../../models/title');
const Bewoner = require('../../models/bewoner');
const { transformTitle } = require('./resolverHelper');

module.exports = {
    titles: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not authenticated');
        }
        
        try {
            const titles = await Title.find();
            return titles.map(title => {
                return transformTitle(title);
            });
        } catch (error) {
            throw error;
        }
    },
    createTitle: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not authenticated');
        }
        try {
            const title = new Title({
                name: args.titleInput.name,
                date: args.titleInput.date? args.titleInput.date : new Date(),
                bewoner: args.bewonerId
            });

            const result = await title.save();
            let createdTitle = transformTitle(result);

            const bewoner = await Bewoner.findById(result._doc.bewoner);
            if (!bewoner) {
                throw new Error('Bewoner does not exist');
            }

            bewoner.title = title;
            await bewoner.save();

            return createdTitle;
        } catch (error) {
            throw error;
        }
    }
}