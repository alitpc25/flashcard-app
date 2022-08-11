import React from 'react'
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from "react-toastify";
import { useNavigate } from 'react-router-dom';

export default function AuthLoginSavePasswordSuccess() {

  const initialValues = {
    email: "",
    newPassword: "",
    confirmPassword: "",
    token: ""
  };

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("Password is required")
      .min(5, "Too Short!")
      .max(25, "Too Long!"),
      confirmPassword: Yup.string()
      .required("Password is required")
      .min(5, "Too Short!")
      .max(25, "Too Long!")
  });

  let navigate = useNavigate();

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

  const handleChangePassword = (values) => {
    if(values.confirmPassword === values.newPassword) {
      axios.post("/auth/login/changePassword", {
        email: values.email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
        token: values.token
      }).then(function (response) {
        toast.success(response.data.message, { toastProperties });
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
    } else {
      toast.error("Passwords don't match.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  return (
    <div className='formDiv'>
      <Formik
        initialValues={initialValues}
        validationSchema={ChangePasswordSchema}
        onSubmit={(values) => {
          handleChangePassword(values)
          navigate("../auth/login/")
        }}
      >
        {() => (
          <Form className='form'>
            <div className='formElementDiv'>
              <label htmlFor="email">Email</label>
              <div className='p-2'>
                <Field type="email" name="email" className='formField form-control' validate={validateEmail} />
                <ErrorMessage name="email" component="div" />
              </div>
            </div>
            <div className='formElementDiv'>
              <label htmlFor="newPassword">New Password</label>
              <div className='p-2'>
                <Field type="password" name="newPassword" className='formField form-control' />
                <ErrorMessage name="newPassword" component="div" />
              </div>
            </div>
            <div className='formElementDiv'>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className='p-2'>
                <Field type="password" name="confirmPassword" className='formField form-control' />
                <ErrorMessage name="confirmPassword" component="div" />
              </div>
            </div>
            <div className='formElementDiv'>
              <label htmlFor="token">Confirmation code</label>
              <div className='p-2'>
                <Field type="text" name="token" className='formField form-control' />
                <ErrorMessage name="token" component="div" />
              </div>
            </div>
            <button type="submit" className='btn btn-info submitButton'>
              Save changes
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
