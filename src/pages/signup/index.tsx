import Head from 'next/head'
import Image from 'next/image'
import { Button } from '@/components/Ui/button'
import styles from '@/styles/Home.module.scss'
import { Input } from '@/components/Ui/input'
import { useState } from 'react'
import Link from 'next/link'
import LoginImg from '../../../public/loginImg.svg'
import googleIconImg from '../../../public/googleIconImg.svg'
import facebookIconImg from '../../../public/facebookIconImg.svg'

export default function SignUp() {
    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <>
            <Head>
                <title>Ishedule - Faça seu login</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.containerCenter}>
                <aside>
                    <Image src={LoginImg} alt='login svg' className={styles.loginImg} />
                </aside>
                <div className={styles.containerContent}>
                    <h2>Cadastrar</h2>
                    <form>
                        <label>Nome</label>
                        <Input
                            withEye={false}
                            type='text'
                            value={form.name}
                            onChange={(e) => setForm({...form , name: e.target.value})}
                        />
                        <label>Email ou Telefone</label>
                        <Input
                            withEye={false}
                            type='text'
                            value={form.username}
                            onChange={(e) => setForm({...form , username: e.target.value})}
                        /><label>Senha</label>
                        <Input
                            withEye={true}
                            onShow={() => setShowPassword(!showPassword)}
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm({...form , password: e.target.value})}
                        />
                        <label>Confirmar senha</label>
                        <Input
                            withEye={true}
                            onShow={() => setShowConfirmPassword(!showConfirmPassword)}
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({...form , confirmPassword: e.target.value})}
                        />
                        <Button
                            type='submit'
                            loading={loading}
                        >
                            Entrar
                        </Button>
                    </form>

                    <div className={styles.lineGroup}>
                        <div className={styles.line}></div>
                        <p>
                            ou entrar com
                        </p>
                        <div className={styles.line}></div>
                    </div>

                    <div className={styles.buttonsLogin}>
                        <button className={styles.btnGoogle}>
                            <Image src={googleIconImg} alt="imagem do google" />
                        </button>
                        <button className={styles.btnFacebook}>
                            <Image src={facebookIconImg} alt="imagem do facebook" />
                        </button>
                    </div>

                    <Link href="/">
                        <p className={styles.text}>Já possui uma conta? <strong>Entrar</strong></p>
                    </Link>

                </div>
            </div>

        </>
    )
}
