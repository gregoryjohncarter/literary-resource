import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addBook($bookId: String!, $authors: [String], $title: String, $image: String, $link: String, $description: String ) {
    addBook(bookId: $bookId, authors: $authors, title: $title, image: $image, link: $link, description: $description) {
        _id
        authors
        description
        bookId
        image
        link
        title
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      _id
      authors
      description
      bookId
      image
      link
      title
    }
  }
`;