const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks')
    
        return userData;
      }
    
      throw new AuthenticationError('Not logged in');
    },
    books: async () => {
      return Book.find({});
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
    
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
    
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const correctPw = await user.isCorrectPassword(password);
    
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const token = signToken(user);
      return { token, user };
    },
    // addBook: async (parent, { userId, bookId1 }, context) => {
    //   // if (context.user) {
    //     const updatedList = await User.findByIdAndUpdate(
    //       { _id: userId },
    //       { $push: { savedBooks: { book: bookId1 } } },
    //       { new: true, runValidators: true }
    //     );
    
    //     return updatedList;
    //   // }
    
    //   // throw new AuthenticationError('You need to be logged in!');
    // },
    addBook: async (parent, {bookId, authors, title, description, link, image}, context) => {
      if (context.user) {
        const book = await Book.create({ bookId, authors, title, image, link, description  });
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book._id } },
          { new: true, runValidators: true }
        );
        return book;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedList = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { savedBooks: bookId } } },
          { new: true, runValidators: true }
        );
        const updatedBooks = await Book.deleteOne({ bookId });
      
        return updatedBooks;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

module.exports = resolvers;