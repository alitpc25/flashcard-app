import { USER_LOGIN } from "../actions/userActions";

const initialState = {
	userLoggedIn: false,
    currentUserId:null
}

export default function userReducer(state=initialState, {type, payload}) {
	switch (type) {
		case USER_LOGIN:
			if(payload.userLoggedIn) {
				return {
					...state,
                    userLoggedIn:true,
                    currentUserId:payload.currentUserId
				}
			} else {
				return {
					...state	
				}
			}
		default:
			return state;
	}
}