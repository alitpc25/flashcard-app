import React, { useState } from 'react';
import { useEffect } from 'react';
import "../FlashCard/FlashCard.css"
import { Link } from "react-router-dom"
import {RefreshTokenRequest} from "../../services/HttpService.js"
const axios = require('axios');


function User() {

  const [isLoaded, setIsLoaded] = useState(false)
  const [userList, setUserList] = useState([])

  let index = 1;

  function compare( a, b ) {
    if ( a.score < b.score ){
      return +1;
    }
    if ( a.score > b.score ){
      return -1;
    }
    return 0;
  }

  useEffect(() => {
    axios.get('/users', {
      headers: {
        Authorization: localStorage.getItem("tokenKey")
      }
    })
      .then(function (response) {
        setIsLoaded(true)
        setUserList(response.data.data.sort(compare))
      })
      .catch(function (error) {
        setIsLoaded(true)
        console.log(error)
					if(error.response.statusText === "Unauthorized") {
						RefreshTokenRequest()
					}
      })
  }, [])

  if (!userList) {
    return (
      <div>ERROR</div>
    )
  } else if (!isLoaded) {
    return (<div className="d-flex align-items-center justify-content-center">
      <strong>Loading...</strong>
      <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
    </div>)
  } else {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" >
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Username</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id}>
                <td>{index++}</td>
                <td><Link className="navbar-brand text-light" to={"/profile?userId="+user.id}>{user.username}</Link></td>
                <td>{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default User