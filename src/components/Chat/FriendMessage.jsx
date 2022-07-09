import React from 'react'
import moment from 'moment'

export default function ChatMessage(props) {
    const { message, chatData, user } = props;
    return (
        <div className='friendMessage d-flex flex-column'>
            <p className='chatTime p-2'>{moment(message.sentAt).local().format('HH:mm:ss DD-MM-YYYY')}</p>
            <p className='chatMessage p-2 h6'> {chatData.friend.username === user.username ? chatData.user.username : chatData.friend.username} : {message.text} </p>
        </div>
    )
}
