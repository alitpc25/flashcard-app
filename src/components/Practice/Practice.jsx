import React from 'react'
import { useState } from 'react'
import FlashCard from "../FlashCard/FlashCard"
import "./Practice.css"
import axios from "axios"
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useRef } from 'react'
import {RefreshTokenRequest} from "../../services/HttpService.js"

export default function Practice(props) {

  const [words, setWords] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  const { user, wordsLength } = props;
  const correctAnswerNumber = useRef(user.score)

  const [isAnswered, setIsAnswered] = useState(false)
  const [randomNum, setRandomNum] = useState(0)

  const getWordsRequest = () => {
    axios.get(`/words/getFourDifferentWords/`+localStorage.getItem("currentUserId"),{
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    })
      .then(res => {
        setWords(res.data)
        setIsLoaded(true)
        setRandomNum(Math.floor(Math.random() * 3))
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
    getWordsRequest()
  }, [])

  useEffect(() => {
    user.score = correctAnswerNumber.current
    axios.put(`/users/updateScoreByUserId/`+localStorage.getItem("currentUserId"),{
      score: correctAnswerNumber.current
    }, {
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    }).then(function (res) {
    })
      .catch(function (error) {
        console.log(error);
					if(error.response.statusText === "Unauthorized") {
						RefreshTokenRequest()
					}
      });
  }
  ,[correctAnswerNumber.current])

  const handleNextQuestionClick = () => {
    setIsLoaded(false)
    setIsAnswered(false)
    getWordsRequest()
  }

  const handleClick = (e) => {
    for (let i = 0; i < words.length; i++) {
      let elem = document.getElementById(i)
      elem.style.opacity = 1
      if (i === randomNum) {
        elem.style.background = "#42f560"
        if (i === parseInt(e.target.id)) {
          correctAnswerNumber.current += 1
        }
      } else {
        elem.style.background = "#f54242"
      }
    }
    setIsAnswered(true);
  }

  if (!user) {
    return (
      <div>ERROR</div>
    )
  } else if (!isLoaded) {
    return (<div className="d-flex align-items-center justify-content-center">
      <strong>Loading...</strong>
      <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
    </div>)
  } else {
    return (
      (wordsLength < 10)
        ? <div className="alert alert-warning" role="alert">
          <h2 className="alert-heading">Welcome, but ...</h2>
          <p>You should have more than 10 words to be able to practice.</p>
        </div>
        : <div>

          <h3 className="d-flex align-items-center justify-content-center">Score: {correctAnswerNumber.current}</h3>
          <FlashCard isAnswered={isAnswered} word={words[randomNum]}></FlashCard>
          <div className='buttonDiv'>
            <button id="0" type="button" className="btn btn-warning" onClick={handleClick} disabled={isAnswered ? true : false}>{words[0].turkishWord}</button>
            <button id="1" type="button" className="btn btn-warning" onClick={handleClick} disabled={isAnswered ? true : false}>{words[1].turkishWord}</button>
            <button id="2" type="button" className="btn btn-warning" onClick={handleClick} disabled={isAnswered ? true : false}>{words[2].turkishWord}</button>
            <button id="3" type="button" className="btn btn-warning" onClick={handleClick} disabled={isAnswered ? true : false}>{words[3].turkishWord}</button>
          </div>
          <div className='buttonContainer'>
          {isAnswered ? <button type="button" onClick={handleNextQuestionClick} className="btn btn-light btn-circle btn-xl nextButton"><FontAwesomeIcon className='fa-2xl' icon={faArrowRight} /></button> : null}
          </div>
        </div>
    )
  }
}
