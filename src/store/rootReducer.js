import userReducer from "./reducers/userReducers"
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
	userReducer: userReducer
}) 

export default rootReducer