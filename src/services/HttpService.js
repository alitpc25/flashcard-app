import axios from "axios"

export const RefreshTokenRequest = () => {
    return axios.post("/auth/refreshToken", {
        userId: localStorage.getItem("currentUserId"),
        refreshToken: localStorage.getItem("refreshKey")
    }).then(function (response) {
        localStorage.setItem("tokenKey", response.data.jwtAccessToken)
        localStorage.setItem("refreshKey", response.data.jwtRefreshToken)
    }).catch(function (error) {
        console.log(error);
    }
    )
}

export const AccessTokenRequest = (userId) => {

    return axios.get(`/auth/accessToken/` + userId)
    .then(function (response) {
        localStorage.setItem("tokenKey", response.data.jwtAccessToken)
        localStorage.setItem("refreshKey", response.data.jwtRefreshToken)
        this.props.history.push('/')
    }).catch(function (error) {
        console.log(error);
    }
    )
}