import React from 'react'
import moment from 'moment'

export default function ChatMessage(props) {
    const {message} = props;
    return (
        <div className='userMessage d-flex flex-column align-self-end'>
            <p className='chatTime p-2 align-self-end'>{moment(message.sentAt).local().format('HH:mm:ss DD-MM-YYYY')}</p>
            <p className='chatMessage p-2 align-self-end h6'>You : {message.text} </p>
        </div>
    )
}
