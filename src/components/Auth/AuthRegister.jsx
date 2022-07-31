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
        email:"",
        username: "",
        password: ""
    };

    function validateEmail(value) {
        let error;
        if (!value) {
          error = 'Required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
          error = 'Invalid email address';
        }
        return error;
      }

    const SignUpSchema = Yup.object().shape({

        email: Yup.string()
            .required("Email is required"),
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
        axios.post("/auth/register", {
            email: values.email,
            username: values.username,
            password: values.password
        }).then(function (response) {
            toast.info('Please verify your email via 6-digit code!', { toastProperties });
            navigate("/auth/register/confirm")
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
                            <label htmlFor="email">Email</label>
                            <div className='p-2'>
                                <Field type="email" name="email" className='formField form-control' validate={validateEmail} />
                                <ErrorMessage name="email" component="div" />
                            </div>
                        </div>
                        <div className='d-flex justify-content-between align-items-center'>
                            <label htmlFor="username">Username</label>
                            <div className='p-2 align-self-end'>
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
                        <button type="submit" className='btn btn-info submitButton'>
                            Register
                        </button>
                        <p className='text-center mt-4'>Are you already registered?</p>
                        <button type="button" className='btn btn-info submitButton' onClick={() => navigate("../auth/login")}>
                            Login
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
