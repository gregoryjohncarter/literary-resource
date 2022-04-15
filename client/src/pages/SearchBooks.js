import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, Col, Form, Button, Card, CardColumns } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { ADD_BOOK } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import auth from '../utils/auth';

const SearchBooks = () => {
  const [addBook, { error }] = useMutation(ADD_BOOK);
  // const [addBook, { error }] = useMutation(ADD_BOOK, {
  //   update(cache, { data: { addBook } }) {
  //     try {
  //       // could potentially not exist yet, so wrap in a try...catch
  //       const { books}  = cache.readQuery({ query: QUERY_BOOKS });
  //       cache.writeQuery({
  //         query: QUERY_BOOKS,
  //         data: { books: [addBook, ...books] }
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }
  
  //     // update me object's cache, appending new thought to the end of the array
  //     const { me } = cache.readQuery({ query: QUERY_ME });
  //     cache.writeQuery({
  //       query: QUERY_ME,
  //       data: { me: { ...me, savedBooks: [...me.savedBooks, addBook] } }
  //     });
  //   }
  // });

   // use object destructuring to extract `data` from the `useQuery` Hook's response and rename it `userData` to be more descriptive
   const { data: userData } = useQuery(QUERY_ME);
  //  console.log(userData)

  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });
  
  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title || '',
        description: book.volumeInfo.description || '',
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink || ''
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    // console.log(bookToSave);

    if (bookToSave.bookId) {
      var newBookId = bookToSave.bookId;
    } else {
      newBookId = "";
    }
    if (bookToSave.authors) {
      var newAuthors = bookToSave.authors;
    } else {
      newAuthors = "";
    }
    if (bookToSave.title) {
      var newTitle = bookToSave.title;
    } else {
      newTitle = "";
    }
    if (bookToSave.description) {
      var newDescription = bookToSave.description;
    } else {
      newDescription = "";
    }
    if (bookToSave.link) {
      var newLink = bookToSave.link;
    } else {
      newLink = "";
    }
    if (bookToSave.image) {
      var newImage = bookToSave.image;
    } else {
      newImage = "";
    }
  
    // get token
    const token = auth.loggedIn() ? auth.getToken() : null;

    if (!token) {
      return false;
    }
  
    try {
      // add thought to database
      await addBook({
        variables: { bookId: newBookId, authors: newAuthors, title: newTitle, description: newDescription, link: newLink, image: newImage },
      });

      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <CardColumns>
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                ) : null}
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
                  {auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}>
                      {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
