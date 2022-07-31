import React, { useState} from 'react'
import "./Auth.css"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { logIn } from '../../store/actions/userActions';

export default function Auth() {

    const initialValues = {
        password: "",
        token: ""
    };

    const SignUpSchema = Yup.object().shape({

        password: Yup.string()
            .required("Password is required")
            .min(5, "Too Short!")
            .max(25, "Too Long!"),

            token: Yup.string()
            .required("Confirmation code is required")
            .min(5, "Too Short!")
            .max(7, "Too Long!"),
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

    let navigate = useNavigate();

    const dispatch = useDispatch()

    const handleSubmissionRequest = (values) => {
        axios.post("/auth/register/confirm", {
            password: values.password,
            token: values.token
        }).then(function (response) {
            localStorage.setItem("tokenKey", response.data.jwtAccessToken)
            localStorage.setItem("refreshKey", response.data.jwtRefreshToken)
            localStorage.setItem("currentUserId", response.data.userId)
            localStorage.setItem("currentUserUsername", values.username)
            toast.success('Successfully registered!', { toastProperties });
            dispatch(logIn({
                userLoggedIn: true,
                currentUserId: response.data.userId
            }))
            navigate("/")
        }).catch(function (error) {
            toast.error(error.response.data, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                });
            console.log(error);
            dispatch(logIn(false))
        });
    }

    return (
        <div className='formDiv'>
            <Formik
                initialValues={initialValues}
                validationSchema={SignUpSchema}
                onSubmit={(values) => {
                    handleSubmissionRequest(values)
                }}
            >
                {() => (
                    <Form className='form'>
                        <div className='d-flex justify-content-between align-items-center'>
                            <label htmlFor="password">Password</label>
                            <div className='p-2'>
                                <Field type="password" name="password" className='formField form-control' />
                                <ErrorMessage name="password" component="div" />
                            </div>
                        </div>
                        <div className='d-flex justify-content-between align-items-center'>
                            <label htmlFor="token">Confirmation code</label>
                            <div className='p-2'>
                                <Field type="text" name="token" className='formField form-control' />
                                <ErrorMessage name="token" component="div" />
                            </div>
                        </div>
                        <button type="submit" className='btn btn-info submitButton'>
                            Send Code
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
