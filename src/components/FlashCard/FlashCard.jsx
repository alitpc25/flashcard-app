import React from 'react'
import "./FlashCard.css"

export default function FlashCard(props) {

    const isAnswered = props.isAnswered;
    const word = props.word;

    return (
        <div className={isAnswered ? "flip-card flip-card-click" : "flip-card"}>
            <div className={"flip-card-inner flip-card-click"}>
                <div className="flip-card-front"> 
                        <h1>{word.englishWord}</h1>
                </div>
                <div className="flip-card-back">
                        <h1>{word.turkishWord}</h1>
                </div>
            </div>
        </div>    
    )
}
