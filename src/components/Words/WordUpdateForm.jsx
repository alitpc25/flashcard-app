import axios from 'axios'
import React from 'react'
import { useState } from 'react';
import {toast} from "react-toastify"
import {RefreshTokenRequest} from "../../services/HttpService"

export default function WordUpdateForm(props) {

    const {word} = props;

    const [englishWordInput, setEnglishWordInput] = useState("");
    const [turkishWordInput, setTurkishWordInput] = useState("");

    const handleEnglishWordChange = (e) => {
        setEnglishWordInput(e.target.value)
    }

    const handleTurkishWordChange = (e) => {
        setTurkishWordInput(e.target.value)
    }

    const toastProperties = {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
    }

    const handleUpdate = (wordId) => {
        axios.put("/words/"+wordId,{
            englishWord: englishWordInput,
            turkishWord: turkishWordInput,
            userId: localStorage.getItem("currentUserId")
        }, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(function (res) {
            toast.success(res.data, { toastProperties });
            props.setIsWordsChanged(true);
            props.setIsUpdateWordClicked(false)
            
        }).catch(function (error) {
            console.log(error)
					if(error.response.statusText === "Unauthorized") {
						RefreshTokenRequest()
					}
        });
    }

    return (
        <tr>
            <th scope="row" ></th>
            <td><input defaultValue={word.turkishWord} onChange={handleTurkishWordChange}></input></td>
            <td><input defaultValue={word.englishWord} onChange={handleEnglishWordChange}></input></td>
            <td><button type="button" className="btn btn-success button" style={{ fontSize: "0.9rem" }} onClick={() => handleUpdate(word.id)}>Update</button></td>
        </tr>
    )
}
