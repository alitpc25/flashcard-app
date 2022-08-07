import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"

import moment from 'moment'
import { RefreshTokenRequest } from "../../services/HttpService.js"
import "./Chat.css"
import ChatMessaging from "./ChatMessaging"

import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import UserMessage from './UserMessage.jsx'
import FriendMessage from "./FriendMessage.jsx"

var stompClient = null;

export default function Chat(props) {

    const { user } = props;

    const [friendships, setFriendships] = useState(null);

    const getFriendships = () => {
        if (user.id) {
            axios.get("/friends?userId=" + user.id, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setFriendships(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.statusText === "Unauthorized") {
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [chatData, setChatData] = useState(null);
    const [chatId, setChatId] = useState(0);
    const [messageHistoryOfUser, setMessageHistoryOfUser] = useState(null)
    const [messageHistoryOfFriend, setMessageHistoryOfFriend] = useState(null)
    const allMessageHistory = useRef(null)

    const [isAllDataFetched, setIsAllDataFetched] = useState(false)

    const [friendId, setFriendId] = useState(0)

    const myRef = useRef(null)

    const getMessagesAndChat = (friendId) => {
        setFriendId(friendId);
        if (user.id && friendId) {
            axios.get("/chat/privateChat?userId=" + user.id + "&friendId=" + friendId, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setChatData(res.data)
                setChatId(res.data.id)
                axios.get("chat/privateChat/messages/user?chatId=" + res.data.id + "&userId=" + user.id, {
                    headers: {
                        Authorization: localStorage.getItem("tokenKey")
                    }
                }).then(res => {
                    setMessageHistoryOfUser(res.data)
                    allMessageHistory.current = (res.data)
                }).catch(error => {
                    console.log(error)
                    if (error.response.statusText === "Unauthorized") {
                        RefreshTokenRequest()
                    }
                }).then(() => {
                    axios.get("chat/privateChat/messages/friend?chatId=" + res.data.id + "&friendId=" + friendId, {
                        headers: {
                            Authorization: localStorage.getItem("tokenKey")
                        }
                    }).then(res => {
                        setMessageHistoryOfFriend(res.data)
                        allMessageHistory.current = allMessageHistory.current.concat(res.data)
                    }).catch(error => {
                        console.log(error)
                        if (error.response.statusText === "Unauthorized") {
                            RefreshTokenRequest()
                        }
                    })
                }).then(() => {
                    if (myRef.current) {
                        myRef.current.scrollIntoView({ behavior: 'smooth' })
                    }
                    if (stompClient == null && messageHistoryOfFriend) {
                        connect()
                    }
                })
            }).catch(error => {
                console.log(error)
                if (error.response.statusText === "Unauthorized") {
                    RefreshTokenRequest()
                }
            })
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

    //Websocket.
    const connect = () => {
        let socket = new SockJS('https://vocabuilder.herokuapp.com/ws');
        stompClient = over(socket);
        stompClient.connect({}, function () {
            stompClient.subscribe('/topic/notifications', function (notificationResponse) {
                showNotificationResponse(JSON.parse(notificationResponse.body));
            });
        });
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function showNotificationResponse(message) {
        if (message.userId != user.id && selectedFriendId.current == message.userId) {
            setMessageHistoryOfFriend([...messageHistoryOfFriend, { id: message.id, sentAt: message.sentAt, text: decodeHtml(message.text) }])
            allMessageHistory.current = [...allMessageHistory.current, { id: message.id, sentAt: message.sentAt, text: decodeHtml(message.text) }]
        }
    }

    function sendNotification(messageInfo) {
        stompClient.send("/app/notify", {}, JSON.stringify({
            ...messageInfo, 'userId': user.id, 'friendId': friendId
        }));
    }

    useEffect(() => {
        getFriendships();
        if (myRef.current) {
            myRef.current.scrollIntoView({ behavior: 'auto' })
        }
        if (stompClient == null && messageHistoryOfFriend) {
            connect()
        }
    }, [isAllDataFetched, myRef.current, messageHistoryOfUser, messageHistoryOfFriend])

    if (!friendships) {
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
                                {friendships.map(f => (<button key={f.friend.id === user.id ? f.user.id : f.friend.id} id={f.friend.id === user.id ? f.user.id : f.friend.id} onClick={handleFriendSelectClick} className="list-group-item bg-light bg-gradient friendSelectButton">{(f.friend.username === user.username) ? f.user.username : f.friend.username}</button>))}
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
                                            (<FriendMessage chatData={chatData} user={user} message={message}></FriendMessage>)
                                    )
                                    )}
                                    <div ref={myRef}></div>
                                </div>
                            </div> : null
                        }
                    </div>
                    <ChatMessaging setMessageHistoryOfUser={setMessageHistoryOfUser} setMessageHistoryOfFriend={setMessageHistoryOfFriend} messageHistoryOfUser={messageHistoryOfUser} messageHistoryOfFriend={messageHistoryOfFriend} allMessageHistory={allMessageHistory} sendNotification={sendNotification} user={user} chatData={chatData} friendId={friendId}></ChatMessaging>
                </div>
            </div>
        )
    }
}
