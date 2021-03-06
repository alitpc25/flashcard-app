import axios from 'axios';
import { useState, useEffect } from 'react';
import PaginationNav from '../PaginationNav/PaginationNav';
import WordAddForm from './WordAddForm';
import "./Words.css"
import WordUpdateForm from './WordUpdateForm';
import {RefreshTokenRequest} from "../../services/HttpService.js"

export default function Words(props) {

  const {currentUserId, getAllWordsRequest} = props;

  let index = 1;

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
      axios.get("/words?pageSize=" + wordsPerPage + "&userId=" + currentUserId +"&page=" + currentPage,{
        headers: {
          Authorization: localStorage.getItem("tokenKey")
        }
      })
        .then(res => {
          setIsLoaded(true)
          setWords(res.data.data.content.sort((a, b) => a.id - b.id))
          setCurrentPage(res.data.data.number+1)
          setPageNumber(res.data.data.totalPages)
          setIsAddWordClicked(false)
          setIsWordsChanged(false)
        })
        .catch(error => {
          setIsLoaded(true)
          console.log(error)
            if(error.response.statusText === "Unauthorized") {
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
    axios.delete("/words/" + wordId,{
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    })
      .then(res => {
        setIsWordsChanged(true)
        setIsAddWordClicked(false)
      }).catch(error => {
        console.log(error)
					if(error.response.statusText === "Unauthorized") {
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
            {words.map(word => isUpdateWordClicked && word.id === updateWordId ? <WordUpdateForm setIsUpdateWordClicked={setIsUpdateWordClicked} setIsWordsChanged={setIsWordsChanged} word={word}></WordUpdateForm> : 
                
                <tr key={word.id}>
                <th scope="row" >{(currentPage-1)*wordsPerPage+index++}</th>
                <td>{word.turkishWord}</td>
                <td>{word.englishWord}</td>
                <td>
                <button type="button" className="btn btn-info button" onClick={() => updateWord(word.id)}>Update Word</button>
                <button type="button" className="btn btn-danger button" onClick={() => removeWord(word.id)}>Remove Word</button>
                </td>
              </tr>
            )}
            {isAddWordClicked ? <WordAddForm setIsWordsChanged={setIsWordsChanged}></WordAddForm> : null}
          </tbody>
        </table>
        <button id='addButton' type="button" className="btn btn-warning btn-circle btn-xl addButton" onClick={addWord} style={ isAddWordClicked ? {visibility:"hidden"} : null}>Add Word</button>
      </div>
      <PaginationNav renderedAt="words" pageNumberArray={pageNumberArray} handlePaginationButtonClick={handlePaginationButtonClick} pageNumber={pageNumber} currentPage={currentPage}></PaginationNav>
      </div>
    )
  }
}