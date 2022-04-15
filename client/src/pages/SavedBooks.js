import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
// import { Redirect } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries';
// import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const { data: userDataMe } = useQuery(QUERY_ME);
  const user = userDataMe?.me.savedBooks || {};
  // console.log(user)

  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const [userData, setUserData] = useState();
  // const [removeBook, { error }] = useMutation(REMOVE_BOOK, {
  //   update(cache, { data: { removeBook } }) {
  //     try {
  //       // could potentially not exist yet, so wrap in a try...catch
  //       const { books } = cache.readQuery({ query: QUERY_BOOKS });
  //       cache.writeQuery({
  //         query: QUERY_BOOKS,
  //         data: { books: [removeBook, ...books] }
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }
  
  //     // update me object's cache, appending new thought to the end of the array
  //     const { me } = cache.readQuery({ query: QUERY_ME });
  //     cache.writeQuery({
  //       query: QUERY_ME,
  //       data: { me: { ...me, savedBooks: [...me.savedBooks, removeBook] } }
  //     });
  //   }
  // });

  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(user).length;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
          return false;
        }
        
        const test = await userDataLength;
        
        if (!test) {
          throw new Error('something went wrong!');
        }
        
        setUserData(user);
      } catch (err) {
        console.error(err);
      }
    };

    getUserData();
  }, [user, userDataLength]);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    function refreshPage() {
      window.location.reload();
    }
    
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const removed = await removeBook({
        variables: { bookId }
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);

      refreshPage();
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>Save some books!</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {user.length
            ? `Viewing ${user.length} saved ${user.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {user.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button 
                    className='btn-block btn-info'
                    onClick={() => window.location.href = `${book.link}`}
                  >
                    Link
                  </Button>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
