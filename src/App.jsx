import React from "react"
import Header from "./components/Header"
import 'font-awesome/css/font-awesome.min.css';
import "./assets/css/fonts.css"
import {
	Routes,
	Route,
	Navigate
} from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import Words from "./components/Words/Words";
import Practice from "./components/Practice/Practice"
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios"
import AuthRegister from "./components/Auth/AuthRegister";
import AuthLogin from "./components/Auth/AuthLogin";
import AuthRegisterConfirm from "./components/Auth/AuthRegisterConfirm";
import { RefreshTokenRequest, AccessTokenRequest } from "./services/HttpService.js"
import { useSelector } from 'react-redux'
import User from "./components/User/User";
import EssayPage from "./components/EssayPost/EssayPage";
import Chat from "./components/Chat/Chat";
import AuthLoginChangePassword from "./components/Auth/AuthLoginChangePassword";
import AuthLoginForgotPassword from "./components/Auth/AuthLoginForgotPassword";


function App() {

	const userReducer = useSelector((state) => state.userReducer)

	const [user, setUser] = useState({})
	const [wordsLength, setWordsLength] = useState(0)
	const [currentUserId, setCurrentUserId] = useState(userReducer.currentUserId)

	const getUserRequest = () => {
		if (currentUserId) {
			axios.get(`/api/users/${currentUserId}`, {
				headers: {
					Authorization: localStorage.getItem("tokenKey")
				}
			})
				.then(res => {
					setUser(res.data)
				}).catch(error => {
					console.log(error)
					if (error.response.status === 401 && userReducer.userLoggedIn) {
						AccessTokenRequest(currentUserId)
						RefreshTokenRequest()
					}
				})
		}
	}

	const getAllWordsRequest = () => {
		axios.get(`/api/words/allWords?userId=` + currentUserId, {
			headers: {
				Authorization: localStorage.getItem("tokenKey")
			}
		})
			.then(res => {
				setWordsLength(res.data.length)
			}).catch(error => {
				console.log(error)
				if (error.response.status === 401 && userReducer.userLoggedIn) {
					AccessTokenRequest(currentUserId)
					RefreshTokenRequest()
				}
			})
	}

	useEffect(() => {
		setCurrentUserId(userReducer.currentUserId)
	}, [userReducer.currentUserId])

	useEffect(() => {
		if(userReducer.userLoggedIn) {
			getAllWordsRequest()
			getUserRequest()
		}
	}, [wordsLength, currentUserId])

	return (
		<div>
			<Header currentUserId={userReducer.currentUserId} />
			<Routes>
				<Route exact path="/" element={userReducer.userLoggedIn ? <HomePage /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/profile" element={userReducer.userLoggedIn ? <User user={user} wordsLength={wordsLength} /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/auth/register" element={userReducer.userLoggedIn ? <Navigate replace to="/" /> : <AuthRegister />} />
				<Route exact path="/auth/login" element={userReducer.userLoggedIn ? <Navigate replace to="/" /> : <AuthLogin />} />
				<Route exact path="/auth/login/forgotPassword" element={userReducer.userLoggedIn ? <Navigate replace to="/" /> : <AuthLoginForgotPassword />} />
				<Route exact path="/auth/login/changePassword" element={userReducer.userLoggedIn ? <Navigate replace to="/" /> : <AuthLoginChangePassword />} />
				<Route exact path="/auth/register/confirm" element={userReducer.userLoggedIn ? <Navigate replace to="/" /> : <AuthRegisterConfirm />} />
				<Route exact path="/leaderboard" element={userReducer.userLoggedIn ? <Leaderboard /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/words" element={userReducer.userLoggedIn ? <Words currentUserId={currentUserId} getAllWordsRequest={getAllWordsRequest} /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/practice" element={userReducer.userLoggedIn ? <Practice user={user} wordsLength={wordsLength} /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/essays/essay" element={userReducer.userLoggedIn ? <EssayPage user={user} /> : <Navigate replace to="/auth/register" />} />
				<Route exact path="/chat" element={userReducer.userLoggedIn ? <Chat user={user} /> : <Navigate replace to="/auth/register" />} />
			</Routes>
		</div>
	)
}

export default App