import React from 'react'
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export default function AuthLoginChangePassword() {

    const initialValues = {
        email:""
    };

    function validateEmail(value) {
        let error;
        if (!value) {
          error = 'Required';
        } else if (!/^(.+)@(\S+)$/i.test(value)) {
          error = 'Invalid email address';
        }
        return error;
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

    const ForgotPasswordSchema = Yup.object().shape({
        email: Yup.string()
            .required("Email is required"),
    });

    const handleForgotPasswordRequest = (values) => {
        axios.post("/auth/login/forgotPassword", {
            email: values.email
        }).then(function (response) {
            toast.success(response.data.message, { toastProperties });
            navigate("../auth/login/changePassword")
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
        });
    }

    let navigate = useNavigate();

    return (
        <div className='formDiv'>
            <Formik
                initialValues={initialValues}
                validationSchema={ForgotPasswordSchema}
                onSubmit={(values) => {
                    handleForgotPasswordRequest(values)
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
                            <button type="submit"className='btn btn-info submitButton'>
                                Send
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
