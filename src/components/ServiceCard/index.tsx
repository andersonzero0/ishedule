import styles from "./styles.module.scss";
import Image from "next/image";
import { useState } from "react";
import { LuPencil } from "react-icons/lu";
import { ModalService } from "../ModalService";

export function ServiceCard({name, avatar, price, service}) {
  const [openModal, setOpenModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const handleCloseModal = () => setOpenModal(false)
  const handleOpenModal = (param) => {
    setEditModal(param)
    setOpenModal(true)
  }

  return (
    <>
      <div className={styles.addService}>
        <div className={styles.boxImageService}>

        <button className={styles.editDiv} onClick={() => handleOpenModal(true)}>
            <LuPencil color="#fff" size={40} />
        </button>
        <Image width={50} height={50} src={avatar} alt="service image" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcw/C/HgAE9wIcjjQfagAAAABJRU5ErkJggg==" className={styles.serviceAvatar}/>

        </div>
        
        <span>{name} | R${price}</span>
      </div>
      <ModalService open={openModal} onClose={handleCloseModal} edit={editModal} service={service} />
    </>
  );
}
