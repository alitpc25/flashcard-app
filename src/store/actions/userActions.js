export const USER_LOGIN = "USER_LOGIN"

export function logIn(userInfo) {
	return {
		type: USER_LOGIN,
		payload: userInfo
	}
}
