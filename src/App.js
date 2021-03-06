import React, { useEffect, useState } from 'react';
import { fetchNews } from './api';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Main from './components/Main/Main';
import NewsCard from './components/NewsCard/NewsCard';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Pagination from './components/Pagination/Pagination';
import SearchBar from './components/SearchBar/SearchBar';
import ErrorAlert from './components/ErrorAlert/ErrorAlert';
import Loader from './components/Loader/Loader';

function App() {
  const [news, setNews] = useState([]);
  const [userInput, setUserInput] = useState({ isValidated: false, value: '' });
  const [error, setError] = useState({ isError: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(10);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    // Get news from API
    fetchNewsHomePage();
    // Refresh news every 5 minutes
    const intervalID = setInterval(() => {
      fetchNewsHomePage();
    }, 300000);
    // Clear interval
    return () => clearInterval(intervalID);
  }, []);

  const fetchNewsHomePage = () => {
    // Get news from API
    setLoader(true);
    fetchNews('https://hn.algolia.com/api/v1/search?tags=front_page')
      .then((data) => {
        setError({ isError: false, message: '' });
        setLoader(false);
        setNews(data);
      })
      .catch((err) => {
        setLoader(false);
        setError({ isError: true, message: err.message });
      });
  };

  const handleInputUser = (e) => {
    setUserInput({ ...userInput, value: e.target.value });
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    // Check if input is not empty
    if (!userInput.value)
      return setUserInput({ ...userInput, isValidated: true });
    // Retrieve data
    setLoader(true);
    fetchNews(
      `https://hn.algolia.com/api/v1/search?query=${userInput.value}&page=1&hitsPerPage=50`
    )
      .then((data) => {
        if (data.length > 0) {
          setError({ isError: false, message: '' });
          setLoader(false);
          setNews(data);
        } else {
          throw new Error('Articles not found! Try another keyword.');
        }
      })
      .catch((err) => {
        setLoader(false);
        setError({ isError: true, message: err.message });
      });
  };

  const handleCloseAlert = () => {
    setError({ isError: false, message: '' });
    setUserInput({ isValidated: false, value: '' });
    document.forms[0].reset();
  };

  const handleClickHome = () => {
    // Get news from API
    fetchNewsHomePage();
    setUserInput({ isValidated: false, value: '' });
    document.forms[0].reset();
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = news.slice(indexOfFirstCard, indexOfLastCard);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Container fluid>
      <Row>
        <Header handleClickHome={handleClickHome} />
      </Row>
      <Row>
        <Col xs={12} lg={{ span: 6, offset: 3 }}>
          <SearchBar
            handleSubmitUser={handleSubmitUser}
            handleInputUser={handleInputUser}
            userInput={userInput}
            isValidated={userInput.isValidated}
          />
          <Main>
            {loader && <Loader />}
            {error.isError && (
              <ErrorAlert {...error} handleCloseAlert={handleCloseAlert} />
            )}
            {news &&
              currentCards.map((article) => (
                <NewsCard key={article.objectID} {...article} />
              ))}
          </Main>
          <Pagination
            cardsPerPage={cardsPerPage}
            totalCards={news.length}
            paginate={paginate}
          />
        </Col>
      </Row>
      <Row>
        <Footer />
      </Row>
    </Container>
  );
}

export default App;
