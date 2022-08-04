import axios from 'axios'
import React from 'react'
import { useState } from 'react';
import {RefreshTokenRequest} from "../../services/HttpService"
import "./WordAddUpdateForms.css"

export default function WordAddForm(props) {

    const [englishWordInput, setEnglishWordInput] = useState("");
    const [turkishWordInput, setTurkishWordInput] = useState("");

    const handleEnglishWordChange = (e) => {
        setEnglishWordInput(e.target.value)
    }

    const handleTurkishWordChange = (e) => {
        setTurkishWordInput(e.target.value)
    }

    const handleSubmit = () => {
        axios.post("/words",{
            englishWord: englishWordInput,
            turkishWord: turkishWordInput,
            userId: localStorage.getItem("currentUserId")
        }, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
          }).then(function (response) {
            props.setIsWordsChanged(true);
            document.getElementById("addButton").style.visibility="visible";
        }).catch(function (error) {
            console.log(error);
					if(error.response.statusText === "Unauthorized") {
						RefreshTokenRequest()
					}
        });
    }

    return (
        <tr className='addUpdateTableRow'>
            <td scope="row" ></td>
            <td><input onChange={handleTurkishWordChange}></input></td>
            <td><input onChange={handleEnglishWordChange}></input></td>
            <td><button type="button" className="btn btn-success button" style={{ fontSize: "0.9rem" }} onClick={handleSubmit}>Submit</button></td>
        </tr>
    )
}
