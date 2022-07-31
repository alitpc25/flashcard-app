import axios from 'axios';
import React from 'react'
import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom"
import { RefreshTokenRequest } from "../../services/HttpService.js"
import "./EssayPage.css"
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function EssayPage(props) {

  const currentUserId = props.user.id

  function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
  }

  const { state } = useLocation();

  const { isUpdateButtonClicked, essayData } = state;

  const [essay, setEssay] = useState(null);

  let query = useQuery();

  const essayId = query.get("essayId")
  const userIdParam = query.get("userId")

  const getEssayByIdRequest = () => {
    if (!isUpdateButtonClicked) {
      axios.get(`/essays/essay?essayId=${essayId}&userId=${userIdParam}`, {
        headers: {
          Authorization: localStorage.getItem("tokenKey")
        }
      })
        .then(res => {
          setEssay(res.data)
        }).catch(error => {
          console.log(error)
          if (error.response.statusText === "Unauthorized") {
            RefreshTokenRequest()
          }
        })
    }
  }

  const [isSubmitUpdateButtonClicked, setIsSubmitUpdateButtonClicked] = useState(false)

  const EssayPostSchema = Yup.object().shape({
    title: Yup.string()
      .required("Title is required")
      .max(255, "Too Long!"),
    text: Yup.string()
      .required("Text is required")
      .max(1200, "Too Long!")
  });

  useEffect(() => {
    getEssayByIdRequest()
  }, [essay])

  if (essayData) {
    var initialValues = {
      title: essayData[0].title,
      text: essayData[0].text
    };
  }

  let navigate = useNavigate();

  const handleBackButton = () => {
    navigate("/profile?userId=" + userIdParam, { replace: true });
  }

  const handleSubmitUpdateButton = (values) => {
    axios.put("/essays/" + essayId, {
      title: values.title,
      text: values.text,
      userId: localStorage.getItem("currentUserId")
    }, {
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    }).then(function (response) {
      setIsSubmitUpdateButtonClicked(true)
      navigate("/profile?userId=" + userIdParam, { replace: true });
    }).catch(function (error) {
      console.log(error)
      if (error.response.statusText === "Unauthorized") {
        RefreshTokenRequest()
      }
    });
  }


  if (!essay && !essayData) {
    return (<div className="d-flex align-items-center justify-content-center">
      <strong>Loading...</strong>
      <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
    </div>)
  } else {
    return (
      <div className="card essayPageCard">
        <div className="card-header">
          <button id={essayId} type="button" className="btn btn-dark backButton text-light" onClick={handleBackButton}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>
        </div>
        {(!isUpdateButtonClicked) ?
          <div className="card-body">
            <h3 className="card-title">{essay.title}</h3>
            <p className="card-text">{essay.text}
            </p>
          </div>
          :
          <div className="card-body">
            <Formik
              initialValues={initialValues}
              validationSchema={EssayPostSchema}
              onSubmit={(values) => {
                handleSubmitUpdateButton(values)
              }}
            >
              {() => (
                <Form className='form'>
                  <div className="card" style={{ marginTop: "2rem" }}>
                    <div className="card-body">
                      <div>
                        <label htmlFor="title">Title</label>
                        <div className='p-2'>
                          <Field type="text" name="title" className='card-title form-control' />
                          <ErrorMessage name="title" component="div" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="text">Text</label>
                        <div className='p-2'>
                          <Field component="textarea" type="text" name="text" className='card-text form-control' />
                          <ErrorMessage name="text" component="div" />
                        </div>
                      </div>
                    </div>
                    <button id={essayId} type="submit" className="btn btn-success" style={{width:"50%", margin:"auto"}}>Submit Update</button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>}
      </div>
    )
  }
}
