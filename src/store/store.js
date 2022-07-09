import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "./rootReducer"
import {persistStore, persistReducer} from "redux-persist"
import storage from "redux-persist/lib/storage"

const persistConfig = {
    key: "root",
    storage
  }
  
const persistedReducer = persistReducer(persistConfig, rootReducer)

export default () => {
    let store = configureStore({reducer: persistedReducer})
    let persistor = persistStore(store)
    return { store, persistor }
  }
