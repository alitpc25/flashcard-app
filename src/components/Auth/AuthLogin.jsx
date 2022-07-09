import React, { useState } from 'react'
import "./Auth.css"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { logIn } from '../../store/actions/userActions';

export default function Auth() {

    const initialValues = {
        username: "",
        password: ""
    };

    const SignUpSchema = Yup.object().shape({

        username: Yup.string()
            .min(5, "Too Short!")
            .max(25, "Too Long!")
            .required("Username is required"),

        password: Yup.string()
            .required("Password is required")
            .min(5, "Too Short!")
            .max(25, "Too Long!"),
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
        axios.post("/auth/login", {
            username: values.username,
            password: values.password
        }).then(function (response) {
            localStorage.setItem("tokenKey", response.data.jwtAccessToken)
            localStorage.setItem("refreshKey", response.data.jwtRefreshToken)
            localStorage.setItem("currentUserId", response.data.userId)
            localStorage.setItem("currentUserUsername", values.username)
            toast.success('Successfully logged in!', { toastProperties });
            dispatch(logIn({
                userLoggedIn: true,
                currentUserId: response.data.userId
            }))
        }).catch(function (error) {
            toast.error(error.response.data.message, {
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
                            <label htmlFor="username">Username</label>
                            <div className='p-2'>
                                <Field type="username" name="username" className='formField form-control' />
                                <ErrorMessage name="username" component="div" />
                            </div>
                        </div>
                        <div className='d-flex justify-content-between align-items-center'>
                            <label htmlFor="password">Password</label>
                            <div className='p-2'>
                                <Field type="password" name="password" className='formField form-control' />
                                <ErrorMessage name="password" component="div" />
                            </div>
                        </div>
                        <button type="submit"className='btn btn-info submitButton' >
                            Login
                        </button>
                        <p className='text-center mt-4'>Don't you have an account?</p>
                        <button type="button" className='btn btn-info submitButton' onClick={() => navigate("../auth/register")}>
                            Register
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
