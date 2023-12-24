import Head from "next/head"
import styles from "./styles.module.scss"
import Image from "next/image";
import plus from "../../../public/plus.svg";
import { WorkerCard } from "@/components/WorkerCard";
import { useContext, useState } from "react";
import { BasicModal } from "@/components/Modal";
import { canSSRAuth } from "@/utils/canSSRAuth";
import { setupAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import noFunc from '../../../public/noFunc.svg'
import { ModalScheduleProfessionals } from "@/components/ModalScheduleProfessionals";

export default function Workers() {
    const [openModal, setOpenModal] = useState(false)
    const handleCloseModal = () => setOpenModal(false)
    const { user } = useContext(AuthContext)

    const [openSchedule, setOpenSchedule] = useState(false)
    const handleCloseSchedule = () => setOpenSchedule(false)

    return (
            <>
                <Head>
                    <title>Profissionais | Ischedule</title>
                </Head>
                <div className={styles.containerCenter}>
                    <div className={styles.containerTop}>
                        <p>Membros</p>
                        <button className={styles.btnNew} onClick={() => setOpenModal(true)}>
                            Novo
                            <Image src={plus} alt="plus" width={20} />
                        </button>
                    </div>
                    {user?.professionals.length != 0 ?
                        user?.professionals.map((e, key) => {return(
                            <WorkerCard name={e.name} schedule={e.schedule} role={e.role} avatar={e.avatar_url} func={e} key={e.id}/>
                        )}
                        )
                        :
                        <div className={styles.noFunc}>
                            <Image src={noFunc} alt="image for there are no professionals" className={styles.imgError} />
                            <p className={styles.textError}>Ainda não há funcionários registrados</p>
                        </div>
                    }
                </div>

                <BasicModal open={openModal} onClose={handleCloseModal} />
            </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    return {
        props: {}
    }
})