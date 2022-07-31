import React, { useEffect, useState } from 'react'
import "./Essay.css"
import axios from "axios"
import { RefreshTokenRequest } from "../../services/HttpService.js"
import { useNavigate } from "react-router-dom";
import EssayInsert from './EssayInsert';
import PaginationNav from '../PaginationNav/PaginationNav';

export default function Essay(props) {

    const { userId, userIdParam } = props;

    const [essays, setEssays] = useState(null);
    const [isEssaysChanged, setIsEssaysChanged] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const [essaysPerPage, setEssaysPerPage] = useState(9);
    const [pageNumber, setPageNumber] = useState(0); // total page number

    const pageNumberArray = []
    for (let i = 1; i <= pageNumber; i++) {
        pageNumberArray.push(i)
    }

    const handlePaginationButtonClick = (e) => {
        setCurrentPage(e.target.id)
        setIsEssaysChanged(true)
    }

    const timeFormatter = (timestamp) => {
        let year = timestamp.substring(0, 4)
        let month = timestamp.substring(5, 7)
        let day = timestamp.substring(8, 10)
        return "Published on " + day + "." + month + "." + year
    }

    const [searchText, setSearchText] = useState("");
    let searchHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setSearchText(lowerCase);
    };

    const [sortText, setSortText] = useState("Desc")

    const selectAscDesc = (e) => {
        const index = e.target.selectedIndex;
        const el = e.target.childNodes[index]
        const option = el.getAttribute('value')
        setSortText(option)
        setIsEssaysChanged(true)
    }

    const getEssaysRequest = () => {
        if (!essays || isEssaysChanged) {
            axios.get("/essays/sortByTime" + sortText + "?pageSize=" + essaysPerPage + "&page=" + currentPage + "&userId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setEssays(res.data.content)
                setCurrentPage(res.data.number + 1)
                setPageNumber(res.data.totalPages)
            }).catch(error => {
                console.log(error)
                if (error.response.statusText === "Unauthorized") {
                    RefreshTokenRequest()
                }
            })
        }
    }

    let navigate = useNavigate();

    useEffect(() => {
        getEssaysRequest()
        setIsEssaysChanged(false)
    }, [essays, userId, isEssaysChanged])

    const handleReadButton = (e) => {
        navigate("/essays/essay?essayId=" + e.target.id + "&userId=" + userIdParam, { state: { isUpdateButtonClicked: false } })
    }

    const handleUpdateButton = (e) => {
        navigate("/essays/essay?essayId=" + e.target.id + "&userId=" + userIdParam, { state: { isUpdateButtonClicked: true, essayData: essays.filter(essay => essay.id === parseInt(e.target.id)) } })
    }

    const handleDeleteButton = (e) => {
        axios.delete("/essays/" + e.target.id, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        })
            .then(res => {
                setIsEssaysChanged(true)
            }).catch(error => {
                console.log(error)
                if (error.response.statusText === "Unauthorized") {
                    RefreshTokenRequest()
                }
            })
    }

    const handleSearchByTitle = (e) => {
        e.preventDefault()
        console.log("ads")
        axios.get("/essays/searchByTitle?pageSize=" + essaysPerPage + "&page=" + currentPage + "&userId=" + userIdParam + "&title=" + searchText, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(res => {
            setEssays(res.data.content)
            setCurrentPage(res.data.number + 1)
            setPageNumber(res.data.totalPages)
        }).catch(error => {
            console.log(error)
            if (error.response.statusText === "Unauthorized") {
                RefreshTokenRequest()
            }
        })
    }

    if (!essays) {
        (<div className="d-flex align-items-center justify-content-center">
            <strong>Loading...</strong>
            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
        </div>)
    } else {
        return (
            <div>
                <div className="d-flex flex-row justify-content-between">
                    <h1 className="display-3 text-light p-2" style={{ marginTop: "1rem" }}>Essays</h1>
                    <div className="col-auto my-1 align-self-center p-2">
                        <label className="my-1 mr-2 text-light" htmlFor="inlineFormCustomSelectPref">Sort by : </label>
                        <select defaultValue={"Desc"} onChange={selectAscDesc} className="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                            <option value="Desc">Newest First</option>
                            <option value="Asc">Oldest First</option>
                        </select>
                    </div>
                    <PaginationNav className="p-2" renderedAt="essay" pageNumberArray={pageNumberArray} handlePaginationButtonClick={handlePaginationButtonClick} pageNumber={pageNumber} currentPage={currentPage}></PaginationNav>
                </div>
                <div className='container'>
                    <form className="row form-inline my-2 my-md-0">
                        <div className="col-sm d-flex p-2">
                            <input onChange={searchHandler} className="form-control mr-sm-2" type="search" placeholder="Search"></input>
                            <button className="btn btn-success my-2 my-sm-0 block" onClick={handleSearchByTitle}>Search</button>
                        </div>
                    </form>
                </div>
                {userId === userIdParam ? <EssayInsert userId={userId} setIsEssaysChanged={setIsEssaysChanged}></EssayInsert> : null}
                {essays
                    .map(essay => (
                        <div key={essay.id} className="card essayCard">
                            <div className="card-header">
                                {timeFormatter(essay.publishedOn)}
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">{essay.title}</h3>
                                <p className="card-text">{(essay.text.length < 120) ? essay.text : essay.text.substring(0, 200) + "..."}
                                </p>
                                <button id={essay.id} type="button" className="btn btn-info text-light" onClick={handleReadButton}>Read all</button>
                                {(userIdParam !== userId) ? null : (
                                    <button id={essay.id} type="button" className="btn btn-warning" onClick={handleUpdateButton}>Update</button>)}
                                {(userIdParam !== userId) ? null : (
                                    <button id={essay.id} type="button" className="btn btn-danger" onClick={handleDeleteButton}>Delete</button>)}

                            </div>
                        </div>
                    ))}
            </div>
        )
    }
}
