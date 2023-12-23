import axios, {AxiosError} from "axios"
import { parseCookies } from "nookies"
import { AuthTokenErrors } from "./err/AuthTokenErrors"
import { signOut } from "../contexts/AuthContext"

export function setupAPIClient(ctx = undefined) {
    const { '@nextauth.token': token } = parseCookies(ctx);

    const api = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    api.defaults.headers.Authorization = `Bearer ${token}`

    return api
}