import React from 'react'
import { useState } from 'react'
import "./Essay.css"
import axios from "axios"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { RefreshTokenRequest } from "../../services/HttpService.js"
import * as Yup from 'yup';
import { toast } from "react-toastify";

export default function EssayInsert(props) {

    const { userId, setIsEssaysChanged } = props;

    const initialValues = {
        title: "",
        text: ""
    };

    const EssayPostSchema = Yup.object().shape({
        title: Yup.string()
            .required("Title is required")
            .max(255, "Too Long!"),
        text: Yup.string()
            .required("Text is required")
            .max(1200, "Too Long!")
    });

    const toastProperties = {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
    }

    const handleSubmissionRequest = (values) => {
        axios.post("/essays", {
            text: values.text,
            title: values.title,
            userId: userId
        }, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(function (response) {
            toast.success(response.data.message, { toastProperties });
            setIsEssaysChanged(true);
        }).catch(function (error) {
            toast.error(error.response, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.log(error);
        });
    }

        if (!userId) {
            (<div className="d-flex align-items-center justify-content-center">
                <strong>Loading...</strong>
                <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
            </div>)
        } else {
            return (
                <div>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={EssayPostSchema}
                        onSubmit={(values, actions) => {
                            handleSubmissionRequest(values)
                            actions.resetForm({
                                values: {
                                  title: '',
                                  text: '',
                                },
                              });
                        }}
                    >
                        {() => (
                            <Form className='form'>
                                <div className="card" style={{marginTop:"2rem"}}>
                                    <div className="card-body">
                                        <div>
                                            <label htmlFor="title">Title</label>
                                            <div className='p-2'>
                                                <Field placeholder="Title" type="text" name="title" className='card-title form-control' />
                                                <ErrorMessage name="title" component="div" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="text">Text</label>
                                            <div className='p-2'>
                                                <Field component="textarea" placeholder="Text" type="text" name="text" className='card-text form-control' />
                                                <ErrorMessage name="text" component="div" />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-info text-light">Publish</button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            )
        }
    }

