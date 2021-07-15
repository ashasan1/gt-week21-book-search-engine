
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {

    Query: {

        me: async (parent, args, context) => {

            if(context.user) {
                const userData = await User.findOne({})
                .select('-__v -password')
                .populate('books')
            
                return userData;
            }

            throw new AuthenticationError('Not logged in')

        },

    },

    Mutation: {

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
          
            return {token, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('Login credentials incorrect!');
            }

            const correctPass = await user.isCorrectPassword(password);

            if(!correctPass) {
                throw new AuthenticationError('Login credentials incorrect!');
            }

            const token = signToken(user);
            return {token, user};
    
        },

        saveBook: async (parent, args, context) => {
            if (context.user) {
          
             const updatedUser =  await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.input } },
                { new: true }
              );
          
            return updatedUser;
            }
          
            throw new AuthenticationError('Please login first!');
        },



        removeBook: async (parent, args, context) => {
            if(context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
            );

            return updatedUser;
            }

            throw new AuthenticationError('Please login first!');
        }
    }
};

module.exports = resolvers;

