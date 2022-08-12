import axios from 'axios';
import { useState, useEffect } from 'react';
import PaginationNav from '../PaginationNav/PaginationNav';
import WordAddForm from './WordAddForm';
import "./Words.css"
import WordUpdateForm from './WordUpdateForm';
import { RefreshTokenRequest, AccessTokenRequest } from "../../services/HttpService.js"
import { useSelector } from 'react-redux'

export default function Words(props) {
  const userReducer = useSelector((state) => state.userReducer)
  const {currentUserId, getAllWordsRequest} = props;

  const [words, setWords] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isWordsChanged, setIsWordsChanged] = useState(false)
  const [isAddWordClicked, setIsAddWordClicked] = useState(false);
  const [isUpdateWordClicked, setIsUpdateWordClicked] = useState(false);
  const [updateWordId, setUpdateWordId] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage, setWordsPerPage] = useState(9);
  const [pageNumber, setPageNumber] = useState(0); // total page number

  const pageNumberArray = []
  for (let i = 1; i<=pageNumber; i++) {
    pageNumberArray.push(i)
  }
  
  const getWordsRequest = (wordsPerPage, currentUserId, currentPage) => {
      axios.get("/api/words?pageSize=" + wordsPerPage + "&userId=" + currentUserId +"&page=" + currentPage,{
        headers: {
          Authorization: localStorage.getItem("tokenKey")
        }
      })
        .then(res => {
          setIsLoaded(true)
          setWords(res.data.content.sort((a, b) => a.id - b.id))
          setCurrentPage(res.data.number+1)
          setPageNumber(res.data.totalPages)
          setIsAddWordClicked(false)
          setIsWordsChanged(false)
        })
        .catch(error => {
          setIsLoaded(true)
          console.log(error)
          if (error.response.status === 401 && userReducer.userLoggedIn) {
            AccessTokenRequest(userReducer.currentUserId)
            RefreshTokenRequest()
        }
        })
  }

  useEffect(() => {
    getWordsRequest(wordsPerPage, currentUserId, currentPage)
    getAllWordsRequest()
  }, [isWordsChanged, currentUserId])

  const addWord = () => {
    setIsAddWordClicked(true);
  }

  const removeWord = (wordId) => {
    axios.delete("/api/words/" + wordId,{
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    })
      .then(res => {
        setIsWordsChanged(true)
        setIsAddWordClicked(false)
      }).catch(error => {
        console.log(error)
        if (error.response.status === 401 && userReducer.userLoggedIn) {
          AccessTokenRequest(userReducer.currentUserId)
          RefreshTokenRequest()
      }
      })
  }

  const updateWord = (wordId) => {
    setUpdateWordId(wordId)
    setIsUpdateWordClicked(true)
    setIsAddWordClicked(false)
    setIsWordsChanged(true)
  }

  const handlePaginationButtonClick = (e) => {
    setCurrentPage(e.target.id)
    setIsWordsChanged(true)
  }

  if (!currentUserId) {
    return (
      <div>ERROR</div>
    )
  } else if (!isLoaded) {
    return (<div className="d-flex align-items-center justify-content-center">
      <strong>Loading...</strong>
      <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
    </div>)
  }else {

    return (
      <div>
      <div className="d-flex justify-content-center align-items-center flex-column" >
        
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th scope="col" style={{width: "16%"}}>Index</th>
              <th scope="col"  style={{width: "28%"}}>Turkish</th>
              <th scope="col"  style={{width: "28%"}}>English</th>
              <th scope="col"  style={{width: "28%"}}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word,index) => isUpdateWordClicked && word.id === updateWordId ? <WordUpdateForm setIsUpdateWordClicked={setIsUpdateWordClicked} setIsWordsChanged={setIsWordsChanged} word={word}></WordUpdateForm> : 
                
                <tr key={word.id}>
                <th scope="row" >{(currentPage-1)*wordsPerPage+index+1}</th>
                <td>{word.turkishWord}</td>
                <td>{word.englishWord}</td>
                <td className='wordsButtons'>
                <button type="button" className="btn btn-info button" onClick={() => updateWord(word.id)}><i className="fa fa-refresh" aria-hidden="true"></i></button>
                <button type="button" className="btn btn-danger button" onClick={() => removeWord(word.id)}><i className="fa fa-trash"></i></button>
                </td>
              </tr>
            )}
            {isAddWordClicked ? <WordAddForm setIsWordsChanged={setIsWordsChanged}></WordAddForm> : null}
          </tbody>
        </table>
        <button id='addButton' type="button" className="btn btn-warning btn-circle btn-xl addButton" onClick={addWord} style={ isAddWordClicked ? {visibility:"hidden"} : null}><i style={{fontSize:"30px", color:"white"}} class="fa fa-plus" aria-hidden="true"></i></button>
      </div>
      <PaginationNav renderedAt="words" pageNumberArray={pageNumberArray} handlePaginationButtonClick={handlePaginationButtonClick} pageNumber={pageNumber} currentPage={currentPage}></PaginationNav>
      </div>
    )
  }
}