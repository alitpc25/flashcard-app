import React, { useState, useEffect } from 'react'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { RefreshTokenRequest, AccessTokenRequest } from "../../services/HttpService.js"
import { useSelector } from 'react-redux'
import "./Friends.css"

export default function Friends(props) {
    const userReducer = useSelector((state) => state.userReducer)
    const { user, friendships, userIdParam, friendshipRequests, setIsFriendComponentDatasChanged, isFriendComponentDatasChanged } = props

    const handleFriendshipAccept = (e) => {
        if (e.target.id) {
            axios.get("/friends/acceptFriendshipRequest?userId=" + user.id + "&friendId=" + e.target.id,
                {
                    headers: {
                        Authorization: localStorage.getItem("tokenKey")
                    }
                }).then(function (response) {
                }).catch(function (error) {
                    console.log(error);
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
            setIsFriendComponentDatasChanged(true)
        }
    }

    const handleFriendshipDecline = (e) => {
        if (e.target.id) {
            axios.get("/friends/declineFriendshipRequest?userId=" + user.id + "&friendId=" + e.target.id,
                {
                    headers: {
                        Authorization: localStorage.getItem("tokenKey")
                    }
                }).then(function (response) {
                }).catch(function (error) {
                    console.log(error);
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
            setIsFriendComponentDatasChanged(true)
        }
    }

    useEffect(() => {
        setIsFriendComponentDatasChanged(false)
    }, [userIdParam, isFriendComponentDatasChanged])

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm overflow-auto">
                    <h1 className="display-4">Friends</h1>
                    <ul className="list-group">
                        {friendships.map(f => (<li className="list-group-item bg-warning bg-gradient">{(f.friend.username === user.username) ? f.user.username : f.friend.username}</li>))}
                    </ul>
                </div>
                {user.id === userIdParam ? 
                <div className="col-sm">
                    <h1 className="display-4">Requests</h1>
                    <ul className="list-group">
                        {friendshipRequests.map(f => (<li className="list-group-item bg-warning bg-gradient mr-auto">
                            {f.user.username}
                            <button id={f.user.id} type="button" className="btn btn-light" onClick={(e) => handleFriendshipAccept(e)}><FontAwesomeIcon className='fa-xs ' icon={faCheck} /></button>
                            <button id={f.user.id} type="button" className="btn btn-light" onClick={(e) => handleFriendshipDecline(e)}><FontAwesomeIcon className='fa-xs ' icon={faXmark} /></button>
                        </li>))}
                    </ul>
                </div>
                 : null }
            </div>
        </div>
    )
}
