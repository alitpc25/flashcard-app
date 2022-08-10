import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"

import moment from 'moment'
import { RefreshTokenRequest, AccessTokenRequest } from "../../services/HttpService.js"
import "./Chat.css"
import ChatMessaging from "./ChatMessaging"
import { useSelector } from 'react-redux'
import { toast } from "react-toastify"

import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import UserMessage from './UserMessage.jsx'
import FriendMessage from "./FriendMessage.jsx"

var stompClient = null;

export default function Chat(props) {

    const userReducer = useSelector((state) => state.userReducer)

    const { user } = props;

    const [friendships, setFriendships] = useState(null);
    //const [doesNewMessageOfFriendExist, setDoesNewMessageOfFriendExist] = useState([]);
    //const [friendIds, setFriendIds] = useState([])
    const doesNewMessageOfFriendExist = useRef(new Array())
    const friendIds = useRef(new Array())

    const getFriendships = () => {
        if (userReducer.currentUserId) {
            axios.get("/friends?userId=" + userReducer.currentUserId, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setFriendships(res.data)
                //send message exist request here with res.data
                res.data.map((f, index) => {
                    var friendRequestId = f.friend.id;
                    if (f.friend.id === userReducer.currentUserId) {
                        friendRequestId = f.user.id;
                    }
                    //setFriendIds([...friendIds, friendRequestId])
                    friendIds.current = friendIds.current.push(friendRequestId)
                    axios.get("/chat/privateChat/messages/friend/doesUnseenMessageExist?userId=" + userReducer.currentUserId + "&friendId=" + friendRequestId, {
                        headers: {
                            Authorization: localStorage.getItem("tokenKey")
                        }
                    }).then(res => {
                        //setDoesNewMessageOfFriendExist([...doesNewMessageOfFriendExist, res.data])
                        doesNewMessageOfFriendExist.current = doesNewMessageOfFriendExist.current.push(res.data)
                    }).catch(error => {
                        console.log(error)
                        if (error.response.status === 401 && userReducer.userLoggedIn) {
                            AccessTokenRequest(userReducer.currentUserId)
                            RefreshTokenRequest()
                        }
                    })
                })
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [userChatData, setUserChatData] = useState(null);
    const [friendChatData, setFriendChatData] = useState(null);
    const [messageHistoryOfUser, setMessageHistoryOfUser] = useState(null)
    const [messageHistoryOfFriend, setMessageHistoryOfFriend] = useState(null)
    const allMessageHistory = useRef(null)

    const [isAllDataFetched, setIsAllDataFetched] = useState(false)

    const [friendId, setFriendId] = useState(0)

    const myRef = useRef(null)

    const getMessagesAndChat = (friendId) => {
        setFriendId(friendId);
        if (userReducer.currentUserId && friendId) {
            axios.put("chat/privateChat/messages/friend/allMessagesSeen?userId=" + userReducer.currentUserId + "&friendId=" + friendId, {},
            {
                headers: {
                  Authorization: localStorage.getItem("tokenKey")
                }
            }).then(function (response) {
            }).catch(function (error) {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                  AccessTokenRequest(userReducer.currentUserId)
                  RefreshTokenRequest()
                }
            });
            //User chat data
            axios.get("/chat/privateChat/toUser?userId=" + userReducer.currentUserId + "&friendId=" + friendId, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setUserChatData(res.data)
                axios.get("chat/privateChat/messages/user?chatId=" + res.data.id + "&userId=" + userReducer.currentUserId, {
                    headers: {
                        Authorization: localStorage.getItem("tokenKey")
                    }
                }).then(res => {
                    setMessageHistoryOfUser(res.data)
                    allMessageHistory.current = (res.data)
                }).catch(error => {
                    console.log(error)
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
            }).then(() => {
                //Friend chat data
                axios.get("/chat/privateChat/toFriend?userId=" + userReducer.currentUserId + "&friendId=" + friendId, {
                    headers: {
                        Authorization: localStorage.getItem("tokenKey")
                    }
                }).then(res => {
                    setFriendChatData(res.data)
                    axios.get("chat/privateChat/messages/friend?chatId=" + res.data.id + "&friendId=" + friendId, {
                        headers: {
                            Authorization: localStorage.getItem("tokenKey")
                        }
                    }).then(res => {
                        setMessageHistoryOfFriend(res.data)
                        connect(res.data)
                        allMessageHistory.current = allMessageHistory.current.concat(res.data)
                    }).catch(error => {
                        console.log(error)
                        if (error.response.status === 401 && userReducer.userLoggedIn) {
                            AccessTokenRequest(userReducer.currentUserId)
                            RefreshTokenRequest()
                        }
                    })
                }).then(() => {
                    if (myRef.current) {
                        myRef.current.scrollIntoView({ behavior: 'smooth' })
                    }
                }).catch(error => {
                    console.log(error)
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
            //const newState = doesNewMessageOfFriendExist.slice() //copy the array
            friendIndexToChange = friendIds.current.indexOf(friendId)
            //newState[friendIndexToChange] = 0 //execute the manipulations
            //setDoesNewMessageOfFriendExist(newState);
            doesNewMessageOfFriendExist.current[friendIndexToChange] = 0;
            setIsAllDataFetched(true)
        }
    }

    const selectedFriendId = useRef(0);

    const handleFriendSelectClick = (e) => {
        setMessageHistoryOfUser(null)
        setMessageHistoryOfFriend(null)
        selectedFriendId.current = (e.target.id)
        getMessagesAndChat(e.target.id)
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

    const deleteChat = (userId, friendId) => {
        axios.delete("/chat/privateChat?userId=" + userId + "&friendId=" + friendId, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(function (res) {
            setMessageHistoryOfUser(null)
            setMessageHistoryOfFriend(null)
            allMessageHistory.current = null
            setUserChatData(null)
            toast.success("Chat successfully deleted.", { toastProperties });
        }).catch(function (error) {
            console.log(error);
            if (error.response.status === 401 && userReducer.userLoggedIn) {
                AccessTokenRequest(userReducer.currentUserId)
                RefreshTokenRequest()
            }
        });
    }

    //Websocket.
    const connect = (messageHistoryOfFriendData) => {
        let socket = new SockJS('https://vocabuilder.herokuapp.com/chat');
        stompClient = over(socket);
        stompClient.debug = function () { };//do nothing
        stompClient.connect({}, function () {
            stompClient.subscribe('/topic/messages', function (notificationResponse) {
                showNotificationResponse(JSON.parse(notificationResponse.body), messageHistoryOfFriendData);
            });
        });
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function showNotificationResponse(message, messageHistoryOfFriendData) {
        if (message.userId != userReducer.currentUserId && selectedFriendId.current == message.userId) {
            setMessageHistoryOfFriend([...messageHistoryOfFriendData, { id: message.id, sentAt: message.sentAt, text: decodeHtml(message.text) }])
            allMessageHistory.current = [...allMessageHistory.current, { id: message.id, sentAt: message.sentAt, text: decodeHtml(message.text) }]
        }
    }

    function sendNotification(messageInfo) {
        stompClient.send("/app/chat", {}, JSON.stringify({
            ...messageInfo, 'userId': userReducer.currentUserId, 'friendId': friendId
        }));
    }

    const [isFriendshipsFetched, setIsFriendshipsFetched] = useState(false)

    useEffect(() => {
        if(!isFriendshipsFetched) {
            getFriendships();
            setIsFriendshipsFetched(true)
        }
        if (myRef.current) {
            myRef.current.scrollIntoView({ behavior: 'auto' })
        }
        if (stompClient == null && messageHistoryOfFriend) {
            connect(messageHistoryOfFriend)
        }
    }, [isAllDataFetched, myRef.current, messageHistoryOfUser, messageHistoryOfFriend, doesNewMessageOfFriendExist.current])

    if (!friendships || !isFriendshipsFetched) {
        return (<div className="d-flex align-items-center justify-content-center">
            <strong>Loading...</strong>
            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
        </div>)
    } else {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="col-sm fixedPosition">
                            <h1 className="display-4">Friends</h1>
                            <ul className="list-group">
                                {friendships.map((f, index) => (
                                    <div className='chatButtonDiv'>
                                        <button key={f.friend.id === user.id ? f.user.id : f.friend.id} id={f.friend.id === user.id ? f.user.id : f.friend.id} onClick={handleFriendSelectClick} className="list-group-item bg-light bg-gradient friendSelectButton">{(f.friend.username === user.username) ? f.user.username : f.friend.username}
                                            {doesNewMessageOfFriendExist.current[index] > 0 ? <span className="badge">{doesNewMessageOfFriendExist.current[index]}</span> : null}
                                        </button>
                                        <button type="button" className="btn btn-danger button" onClick={() => deleteChat(user.id, friendId)}><i style={{ fontSize: "25px" }} className="fa fa-trash"></i></button>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div id="messageDiv" className="col-md-8 mb-4 messageDiv">
                        {isAllDataFetched && messageHistoryOfFriend && messageHistoryOfUser && allMessageHistory.current ?
                            <div>
                                <div className='overflow-auto'>
                                    {allMessageHistory.current.sort(function (x, y) {
                                        return moment(x.sentAt).diff(y.sentAt);
                                    }).map(message => (
                                        messageHistoryOfUser.includes(message) ?
                                            (<UserMessage message={message}></UserMessage>) :
                                            (<FriendMessage userChatData={userChatData} user={user} message={message}></FriendMessage>)
                                    )
                                    )}
                                    <div ref={myRef}></div>
                                </div>
                            </div> : null
                        }
                    </div>
                    <ChatMessaging setMessageHistoryOfUser={setMessageHistoryOfUser} setMessageHistoryOfFriend={setMessageHistoryOfFriend} messageHistoryOfUser={messageHistoryOfUser} messageHistoryOfFriend={messageHistoryOfFriend} allMessageHistory={allMessageHistory} sendNotification={sendNotification} user={user} userChatData={userChatData} friendId={friendId}></ChatMessaging>
                </div>
            </div>
        )
    }
}
