import { useEffect } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import Image from "next/image";
import logoImg from "../../../public/logoImg.svg";
import { useState } from "react";
import { useRouter } from "next/router";

function Header() {
  const [focus, setFocus] = useState('');
  const router = useRouter();

  /* useEffect(() => {
    router.push("/dashboard");
    setFocus("dashboard");
  }, []); */


  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/dashboard">
          <Image src={logoImg} alt="logo ishedule" />
        </Link>

        <nav className={styles.navMenu}>
          <button
            onClick={async () => {
              await router.push("/dashboard");
              setFocus("dashboard");
            }}
          >
            <p className={focus === "dashboard" && styles.focus}>
              Dashboard
            </p>
          </button>
          <button
            onClick={async () => {
              await router.push("/schedule");
              setFocus("schedule");
            }}
          >
            <p className={focus === "schedule" && styles.focus}>Agenda</p>
          </button>
          <button
            onClick={async () => {
              await router.push("/workers");
              setFocus("workers");
            }}
          >
            <p className={focus === "workers" && styles.focus}>Profissionais</p>
          </button>
          <button
            onClick={async () => {
              await router.push("/profile");
              setFocus("profile");
            }}
          >
            <p className={focus === "profile" && styles.focus}>Perfil</p>
          </button>
        </nav>
      </div>
    </header>
  );
}

export function LayoutHeader({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
