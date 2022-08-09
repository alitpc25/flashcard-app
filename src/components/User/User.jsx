import React, { useState, useEffect } from 'react'
import "./User.css"
import axios from "axios"
import { Modal, Button } from "react-bootstrap"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from "react-toastify"
import { useLocation } from "react-router-dom";
import Essay from '../EssayPost/Essay';
import { RefreshTokenRequest, AccessTokenRequest } from "../../services/HttpService.js"
import { useSelector } from 'react-redux'
import Friends from '../Friends/Friends';

export default function User(props) {
    const userReducer = useSelector((state) => state.userReducer)

    const { user, wordsLength } = props;

    function useQuery() {
        const { search } = useLocation();

        return React.useMemo(() => new URLSearchParams(search), [search]);
    }

    let query = useQuery();

    // To view conditionally if other users view the user's profile.
    const userIdParam = parseInt(query.get('userId'));
    const [visitedUser, setVisitedUser] = useState(null);
    const [visitedUserWordsLength, setVisitedUserWordsLength] = useState(0);

    const getForeignUserRequest = () => {
        if (userIdParam) {
            axios.get(`/users/${userIdParam}`, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            })
                .then(res => {
                    setVisitedUser(res.data)
                }).catch(error => {
                    console.log(error)
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
        }
    }

    const getAllWordsOfForeignUserRequest = () => {
        if (userIdParam) {
            axios.get(`/words/allWords?userId=` + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            })
                .then(res => {
                    setVisitedUserWordsLength(res.data.length)
                }).catch(error => {
                    console.log(error)
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                })
        }
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

    const deleteAccountRequest = () => {
        axios.delete("/users/" + userReducer.currentUserId, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(function (res) {
            toast.success(res.data, { toastProperties });
        }).catch(function (error) {
                console.log(error);
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            });
    };

    const handleDelete = () => {
        deleteAccountRequest()
        localStorage.clear()
        window.location.reload("/")
    }

    const handleUpdateRequest = (values) => {
        axios.put("/users/" + userReducer.currentUserId, {
            username: values.username,
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        }, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(function (res) {
            toast.success('Password successfully changed.', {
                position: "top-right",
                autoClose: 500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
        }).catch(function (error) {
            toast.error('Old password is incorrect.', {
                position: "top-right",
                autoClose: 500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              if (error.response.status === 401 && userReducer.userLoggedIn) {
                AccessTokenRequest(userReducer.currentUserId)
                RefreshTokenRequest()
            }
            });
        handleCloseUpdate();
    }

    const initialValues = {
        username: "",
        oldPassword: "",
        newPassword: ""
    };

    const UpdateUserSchema = Yup.object().shape({
        username: Yup.string()
            .min(5, "Too Short!")
            .max(25, "Too Long!")
            .required("Username is required"),

        oldPassword: Yup.string()
            .required("Password is required")
            .min(5, "Too Short!")
            .max(25, "Too Long!"),

        newPassword: Yup.string()
            .required("Password is required")
            .min(5, "Too Short!")
            .max(25, "Too Long!"),
    });

    const handleSendFriendshipRequest = () => {
        axios.get("/friends/addFriend?userId=" + userReducer.currentUserId + "&friendId=" + userIdParam, {
            headers: {
                Authorization: localStorage.getItem("tokenKey")
            }
        }).then(res => {
            setIsFriendshipAlreadyRequested(true)
            toast.info('Request successfully sent.!', {
                position: "top-right",
                autoClose: 300,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
        }).catch(error => {
            console.log(error)
            if (error.response.status === 401 && userReducer.userLoggedIn) {
                AccessTokenRequest(userReducer.currentUserId)
                RefreshTokenRequest()
            }
        })
    }

    const [friendships, setFriendships] = useState([]);

    const getFriendships = () => {
        if (userIdParam) {
            axios.get("/friends?userId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setFriendships(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [friendshipRequests, setFriendshipRequests] = useState([]);

    const getFriendshipRequests = () => {
        if (userIdParam) {
            axios.get("/friends/friendRequests?userId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setFriendshipRequests(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [isFriendshipAlreadyRequested, setIsFriendshipAlreadyRequested] = useState(false)

    const getIsFriendshipAlreadyRequested = () => {
        if (userIdParam && userReducer.currentUserId) {
            axios.get("/friends/isFriendshipAlreadyRequested?userId=" + userReducer.currentUserId + "&friendId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setIsFriendshipAlreadyRequested(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [isFriendshipAlreadyReceived, setIsFriendshipAlreadyReceived] = useState(false)

    const getIsFriendshipAlreadyReceived = () => {
        if (userIdParam && userReducer.currentUserId) {
            axios.get("/friends/isFriendshipAlreadyReceived?userId=" + userReducer.currentUserId + "&friendId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setIsFriendshipAlreadyReceived(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const [isFriendshipExist, setIsFriendshipExist] = useState(false)

    const getIsFriendshipExist = () => {
        if (userIdParam && userReducer.currentUserId) {
            axios.get("/friends/isFriendshipExist?userId=" + userReducer.currentUserId + "&friendId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(res => {
                setIsFriendshipExist(res.data)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401 && userReducer.userLoggedIn) {
                    AccessTokenRequest(userReducer.currentUserId)
                    RefreshTokenRequest()
                }
            })
        }
    }

    const handleEndFriendship = () => {
        if(userIdParam) {
            axios.delete("/friends?userId=" + userReducer.currentUserId + "&friendId=" + userIdParam, {
                headers: {
                    Authorization: localStorage.getItem("tokenKey")
                }
            }).then(function (res) {
                setIsFriendshipExist(false)
                toast.success("Friendship successfully ended.", { toastProperties });
            }).catch(function (error) {
                    console.log(error);
                    if (error.response.status === 401 && userReducer.userLoggedIn) {
                        AccessTokenRequest(userReducer.currentUserId)
                        RefreshTokenRequest()
                    }
                });
        }
    }

    const [isFriendComponentDatasChanged, setIsFriendComponentDatasChanged] = useState(false);

    useEffect(() => {
        getFriendships()
        getFriendshipRequests()
        if (userIdParam !== userReducer.currentUserId) {
            getForeignUserRequest()
            getAllWordsOfForeignUserRequest()
            getIsFriendshipAlreadyRequested()
            getIsFriendshipAlreadyReceived()
            getIsFriendshipExist()
        }
    }, [userIdParam, isFriendshipAlreadyReceived, isFriendComponentDatasChanged, isFriendshipAlreadyRequested, isFriendshipExist])

    //Modal Delete
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    //Modal Update
    const [showUpdate, setShowUpdate] = useState(false);

    const [viewComponent, setViewComponent] = useState("essays")

    const handleTabChange = (e) => {
        e.preventDefault()
        setViewComponent(e.target.id)
    }

    const handleCloseUpdate = () => setShowUpdate(false);
    const handleShowUpdate = () => setShowUpdate(true);
    // (visitedUser) || (userIdParam==user.id)
    if ((!visitedUser) && !(userIdParam === user.id)) {
        return (<div className="d-flex align-items-center justify-content-center">
            <strong>Loading...</strong>
            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
        </div>)
    } else {
        return (
            <div className='container'>
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="fixedPosition">
                            <div className="card col-md userCard">
                                <img src={require("../../assets/img/avatarpng.png")} className="card-img-top image" alt="..."></img>
                                <div className="card-body text-center">
                                    <h2 className="card-text">{userIdParam === user.id ? user.username : visitedUser.username} { }</h2>
                                </div>
                            </div>
                            <div className="card col-md userCard">
                                <div className="card-body text-center">
                                    <h5>Number of Words : {userIdParam === user.id ? wordsLength : visitedUserWordsLength} </h5>
                                    <h5>Score : {userIdParam === user.id ? user.score : visitedUser.score} </h5>
                                </div>
                            </div>
                            {(userIdParam !== user.id) && !isFriendshipAlreadyReceived && !isFriendshipAlreadyRequested && !isFriendshipExist ? <div className="card col-md userCard">
                                <Button className='deleteButton' variant="light" onClick={handleSendFriendshipRequest}>
                                    Send friendship request
                                </Button>
                            </div> : null}
                            {(userIdParam !== user.id) && isFriendshipAlreadyReceived && !isFriendshipAlreadyRequested ? <div className="card col-md userCard">
                                <Button disabled className='deleteButton' variant="light" onClick={handleSendFriendshipRequest}>
                                    User already sent you a request.
                                </Button>
                            </div> : null}
                            {(userIdParam !== user.id) && !isFriendshipAlreadyReceived && isFriendshipAlreadyRequested ? <div className="card col-md userCard">
                                <Button disabled className='deleteButton' variant="light" onClick={handleSendFriendshipRequest}>
                                    Friendship request sent.
                                </Button>
                            </div> : null}
                            {(userIdParam !== user.id) && isFriendshipExist ? <div className="card col-md userCard">
                                <Button className='deleteButton' variant="danger" onClick={handleEndFriendship}>
                                    End the friendship.
                                </Button>
                            </div> : null}
                            {userIdParam === user.id ? <div className="card col-md userCard">
                                <Button className='deleteButton' style={{ marginBottom: "7px" }} variant="warning" onClick={handleShowUpdate}>
                                    Change Credentials
                                </Button>
                                <Button className='deleteButton' variant="danger" onClick={handleShow}>
                                    Delete Account
                                </Button>
                            </div> : null}
                        </div>
                    </div>
                    {user.id === userIdParam ? 
                    <div className="col-md-8 mb-4">
                        <ul className="nav nav-pills nav-fill userPageTab">
                            <li className="nav-item">
                                <a id='essays' className="nav-link active" href='' onClick={(e) => handleTabChange(e)}>Essays</a>
                            </li>
                            <li className="nav-item">
                                <a id='friends' className="nav-link" href='' onClick={(e) => handleTabChange(e)}>Friends</a>
                            </li>
                        </ul>
                        {viewComponent === "essays" ? (
                            (!user.id || !userIdParam) ? (<div className="d-flex align-items-center justify-content-center">
                            <strong>Loading...</strong>
                            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                        </div>) : <Essay key={userIdParam} userId={user.id} userIdParam={userIdParam}></Essay>
                        ) : (
                            <Friends user={user} userIdParam={userIdParam} friendships={friendships} friendshipRequests={friendshipRequests} setIsFriendComponentDatasChanged={setIsFriendComponentDatasChanged} isFriendComponentDatasChanged={isFriendComponentDatasChanged}></Friends>
                        ) 
                        }
                    </div>
                    : (
                        (!userIdParam) ? (<div className="d-flex align-items-center justify-content-center">
                        <strong>Loading...</strong>
                        <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                    </div>) : <div className="col-md-8 mb-4">
                    <Essay key={userIdParam} userId={user.id} userIdParam={userIdParam}></Essay>
                    </div>
                    )}

                    {userIdParam === user.id ?
                        <Modal
                            show={show}
                            onHide={handleClose}
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Are you sure?</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Are you sure that you want to delete your account permanently? If so, all your vocabulary and progress will be lost.
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                <Button variant="danger" style={{ marginTop: "10px" }} onClick={handleDelete}>Delete Permanently</Button>
                            </Modal.Footer>
                        </Modal> : null}

                    {userIdParam === user.id ?
                        <Modal show={showUpdate} onHide={handleCloseUpdate}>
                            <Modal.Header closeButton>
                                <Modal.Title>Update Profile</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={UpdateUserSchema}
                                    onSubmit={(values) => {
                                        handleUpdateRequest(values)
                                    }}
                                >
                                    {() => (
                                        <Form className='form'>
                                            <div className='formElementDiv'>
                                                <label htmlFor="username">Username</label>
                                                <div className='p-2'>
                                                    <Field type="username" name="username" className='formField form-control' />
                                                    <ErrorMessage name="username" component="div" />
                                                </div>
                                            </div>
                                            <div className='formElementDiv'>
                                                <label htmlFor="oldPassword">Old Password</label>
                                                <div className='p-2'>
                                                    <Field type="password" name="oldPassword" className='formField form-control' />
                                                    <ErrorMessage name="oldPassword" component="div" />
                                                </div>
                                            </div>
                                            <div className='formElementDiv'>
                                                <label htmlFor="newPassword">New Password</label>
                                                <div className='p-2'>
                                                    <Field type="password" name="newPassword" className='formField form-control' />
                                                    <ErrorMessage name="newPassword" component="div" />
                                                </div>
                                            </div>
                                            <button type="submit" className='btn btn-info submitButton'>
                                                Save changes
                                            </button>
                                            <button type="button" className='btn btn-info submitButton' onClick={handleCloseUpdate}>
                                                Cancel
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                            </Modal.Body>
                        </Modal> : null}
                </div>
            </div>
        )
    }
}
