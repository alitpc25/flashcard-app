import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RefreshTokenRequest, AccessTokenRequest } from "../../services/HttpService.js"
import { useSelector } from 'react-redux'

export default function ChatMessaging(props) {

    const userReducer = useSelector((state) => state.userReducer)

    const {user, chatData, friendId, sendNotification, messageHistoryOfUser, allMessageHistory, setMessageHistoryOfUser} = props;

    const initialValues = {
        text: ""
    };

    const ChatSchema = Yup.object().shape({
        text: Yup.string()
            .min(1, "Too Short!")
            .max(250, "Too Long!")
            .required("Text is required"),

    });

    const [isDataChanged, setIsDataChanged] = useState(false)

    const handleSubmissionRequest = (values) => {
        let friendId = chatData.friend.id;
        if (friendId === user.id) {
            friendId = chatData.user.id;
        }
        axios.post("/chat/privateChat?userId=" + user.id + "&friendId=" + friendId, {
            text: values.text
        },
            {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(function (response) {
                setMessageHistoryOfUser([...messageHistoryOfUser, response.data])
                allMessageHistory.current = [...allMessageHistory.current, response.data]
                sendNotification(response.data)
                setIsDataChanged(true)
            }).catch(function (error) {
                console.log(error);
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        setIsDataChanged(false)
    }

    useEffect(() => {
    }, [messageHistoryOfUser, isDataChanged])

    return (
        <div>
            {!friendId ? null : <div className='container'>
                <div className='row'>
                    <div className="col-md-12">
                        <div className='d-flex justify-content-end'>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={ChatSchema}
                                onSubmit={(values, actions) => {
                                    handleSubmissionRequest(values)
                                    actions.resetForm({
                                        values: {
                                          text: '',
                                        },
                                      });
                                }}
                            >
                                {() => (
                                    <Form className='form'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <label htmlFor="text"></label>
                                            <div className='p-2'>
                                                <Field component="textarea" name="text" className='form-control chatForm' />
                                                <ErrorMessage name="text" component="div" />
                                            </div>
                                            <button type="submit" className='btn btn-info' >
                                                Send
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>}
            
        </div>
    )
}
