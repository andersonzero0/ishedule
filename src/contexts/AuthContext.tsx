import { destroyCookie, parseCookies, setCookie } from "nookies";
import { ReactNode, createContext, useEffect, useState } from "react";
import Router from "next/router";
import { api } from "@/services/apiClient";
import { toast } from "react-toastify";
import { firebase, auth } from "@/services/firebase";
import dayjs, { Dayjs } from "dayjs";


type AuthContextData = {
    user?: UserProps,
    schedule: ScheduleProps[],
    isAuthenticated?: boolean,
    signInWithEmailAndPassword: (credentials: SignInProps) => Promise<void>
    signOut: () => void,
    signUpWithEmailAndPassword: (credentials: SignUpProps) => Promise<void>,
    signUpWithGoogle: (credentials: SignUpProps) => Promise<void>,
    signUpWithFacebook: (credentials: SignUpProps) => Promise<void>,
    signInWithGoogle: () => Promise<void>,
    signInWithFacebook: () => Promise<void>,
    getDataCompany: () => void
}

type Professionals = {
    name: string,
    role: string,
    avatar_url: string
}

type ServiceProps = {
    name: string,
    background_img_url: string,
    price: string,
    estimated_time: string
}

export type ScheduleProps = {
    name: string,
    checked: boolean,
    opening_time: Date | Dayjs | string | undefined | null ,
    closing_time: Date | Dayjs | string | undefined | null
}

type UserProps = {
    id: string,
    name?: string,
    email: string,
    professionals?: Professionals[],
    service?: ServiceProps[],
    company_name?: string,
    address?: string,
    avatar_url?: string,
    banner_url?: string,
    schedule?: ScheduleProps[],
    description?: string,
    _count?: {
        likes?: number,
    }
}

type SignUpProps = {
    name?: string,
    email?: string,
    password?: string
}

type SignInProps = {
    email: string,
    password: string,
}

type AuthProviderProps = {
    children: ReactNode
}


export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
    try {
        destroyCookie(undefined, '@firebase.token')
        Router.push("/") 
    }
    catch (err) {
        console.log("Erro ao deslogar")
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { '@firebase.token': token } = parseCookies();
    const [user, setUser] = useState<UserProps>({
        id: "",
        email: "",
        company_name: "",
        address: "",
        avatar_url: "",
        banner_url: "",
        description: "",
        professionals: [],
        service: [],
        _count: {
            likes: 0
        }
    })
    const [schedule, setSchedule] = useState<ScheduleProps[]>()
    const isAuthenticated = !!user
    

    useEffect(() => {
        // tentar pegar algo no cookie
        getDataCompany()
    }, [])

    function getDataCompany () {
        if (token) {

            api.get('/user/company', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => {
                const {data} = response
                
                setUser(data)
                
            })
            .catch((error) => {
                console.log(error);
                
                signOut();
            })


            api.get('/user/company/schedule', {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
            })
            .then(({data}) => {
                setSchedule(data.schedule)
                
            })
        }
    }

    async function signUpWithEmailAndPassword({ email, password, name }: SignUpProps) {
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password)

            if (userCredential) {

                const { uid, email } = userCredential.user;
                const token = await userCredential.user.getIdToken()

                const response = await api.post('/user/company', {
                    id: uid,
                    email: email,
                    name: name
                },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }

                )
                console.log(response);
            }


            Router.push("/")

            toast.success("Conta criada com sucesso!")


        } catch (err) {
            toast.error("Erro ao cadastrar!")
            console.log("ERRO AO CADASTRAR", err)
        }
    }

    async function signInWithEmailAndPassword({ email, password }: SignInProps) {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)

            if (userCredential) {
                const { uid, email } = userCredential.user;
                const token = await userCredential.user.getIdToken()


                const { data } = await api.get('/auth/company/signin', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                api.defaults.headers["Authorization"] = `Bearer ${data.access_token}`


                setCookie(undefined, "@firebase.token", data.access_token, {
                    maxAge: 60 * 60 * 24 * 30, //expirar em 1 mes
                    path: "/" // quais caminhos terao acesso a cookie
                })

                toast.success("Logado com sucesso!")
                Router.push("/dashboard")

            }
        } catch (error) {
            toast.error("Erro ao acessar!")
            console.log("Erro ao acessar", error)
        }

    }

    async function signUpWithFacebook() {
        try {
            const provider = new firebase.auth.FacebookAuthProvider()
            const result = await auth.signInWithPopup(provider)

            if (result.user) {
                const { email, uid, displayName } = result.user
                const token = await result.user.getIdToken()


                const response = await api.post('/user/company', {
                    id: uid,
                    email: email,
                    name: displayName
                },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }

                )
                console.log(response);

                toast.success("Conta com o Facebook criada!")
                Router.push("/")

            }
        } catch (error) {
            toast.error("Erro ao criar conta com Facebook")
            console.log(error)
        }
    }

    async function signInWithFacebook() {
        try {
            const provider = new firebase.auth.FacebookAuthProvider()
            const result = await auth.signInWithPopup(provider)

            if (result.user) {
                const { email, uid, displayName } = result.user
                const token = await result.user.getIdToken()


                const { data } = await api.get('/auth/company/signin', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                api.defaults.headers["Authorization"] = `Bearer ${data.access_token}`
                

                setCookie(undefined, "@firebase.token", data.access_token, {
                    maxAge: 60 * 60 * 24 * 30, //expirar em 1 mes
                    path: "/" // quais caminhos terao acesso a cookie
                })


                toast.success("Logado com sucesso!")
                Router.push("/dashboard")
            }
        } catch (error) {
            toast.error("Erro ao acessar com Facebook!")
            console.log("Erro ao acessar", error)
        }

    }

    async function signUpWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider()
            const result = await auth.signInWithPopup(provider)

            if (result.user) {
                const { email, uid, displayName } = result.user
                const token = await result.user.getIdToken()


                const response = await api.post('/user/company', {
                    id: uid,
                    email: email,
                    name: displayName
                },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }

                )
                console.log(response);

                toast.success("Conta com o Google criada!")
                Router.push("/")

            }


        } catch (error) {
            toast.error("Erro ao criar conta com Google!")
            console.log(error)
        }
    }

    async function signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider()
            const result = await auth.signInWithPopup(provider)

            if (result.user) {
                const { email, uid, displayName } = result.user
                const token = await result.user.getIdToken()


                const { data } = await api.get('/auth/company/signin', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                api.defaults.headers["Authorization"] = `Bearer ${data.access_token}`
                

                setCookie(undefined, "@firebase.token", data.access_token, {
                    maxAge: 60 * 60 * 24 * 30, //expirar em 1 mes
                    path: "/" // quais caminhos terao acesso a cookie
                })


                toast.success("Logado com sucesso!")
                Router.push("/dashboard")

            }
        } catch (error) {
            toast.error("Erro ao acessar com Google!")
            console.log("Erro ao acessar", error)
        }

    }


    return (
        <AuthContext.Provider value={{ user, schedule , isAuthenticated, signUpWithFacebook,signUpWithGoogle, signUpWithEmailAndPassword, signOut, signInWithEmailAndPassword, signInWithGoogle, signInWithFacebook, getDataCompany }}>
            {children}
        </AuthContext.Provider>
    )
}