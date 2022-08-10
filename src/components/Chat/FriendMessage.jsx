import React from 'react'
import moment from 'moment'

export default function ChatMessage(props) {
    const { message, userChatData, user } = props;
    return (
        <div className='friendMessage d-flex flex-column'>
            <p style={{fontSize:"0.75rem"}} className='chatTime p-2'>{moment(message.sentAt).local().format('HH:mm:ss DD-MM-YYYY')}</p>
            <p className='chatMessage p-2 h6'> {userChatData.friend.username === user.username ? userChatData.user.username : userChatData.friend.username} : {message.text} </p>
        </div>
    )
}
