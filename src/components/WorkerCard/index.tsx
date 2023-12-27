import { useState } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import userShape from "../../../public/userShape.png";
import { LuCalendarClock, LuPencil, LuTrash2 } from "react-icons/lu";
import { BasicModal } from "../Modal";
import { DraggableDialog } from "../Dialog";
import { ModalScheduleProfessionals } from "../ModalScheduleProfessionals";
import { Chip } from "@mui/material";

export function WorkerCard({ avatar, name, role, func, schedule, servicesCompany}) {
  const [editModal, setEditModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const handleCloseSchedule = () => setOpenSchedule(false)
  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => setOpenDialog(false)
  const handleCloseModal = () => setOpenModal(false)
  const handleOpenModal = (param) => {
    setEditModal(param)
    setOpenModal(true)
  }
  
  return (
    <>
    
    <div className={styles.workerCard}>
      <div className={styles.workerContent}>
        {avatar ? (
          <Image
            src={avatar}
            alt="user"
            width={60}
            height={60}
            className={styles.workerAvatar}
          />
        ) : (
          <Image
            src={userShape}
            alt="user"
            width={60}
            height={60}
            className={styles.workerAvatar}
          />
        )}
        <div className={styles.workerInfo}>
          <h3>{name}</h3>
          <p>{role}</p>
          <div>
          {
            func && func.services.length > 0 && func.services.map((service: any) => {
              const serviceSelect = servicesCompany.find((serviceCompany: any) => serviceCompany.id == service.service_id)

              return (
                <Chip key={serviceSelect.id} label={serviceSelect.name}/>
              )
              
            })
          }
          </div>
        </div>
      </div>

      <div className={styles.workerActions}>
        <button className={styles.btnActions} onClick={() => setOpenSchedule(true)}><LuCalendarClock color="#2F317C" size={25} cursor="pointer"/></button>
        <button onClick={() => handleOpenModal(true)}  className={styles.btnActions}><LuPencil color="#2F317C" size={25} cursor="pointer"/></button>
        <button className={styles.btnActions} onClick={handleOpenDialog}><LuTrash2 color="#e83f5b" size={25} cursor="pointer" /></button>
      </div>
    </div>
        <BasicModal open={openModal} onClose={handleCloseModal} servicesCompany={servicesCompany} edit={editModal} func={func} />
        <DraggableDialog open={openDialog} onClose={handleCloseDialog} id={func.id}/>
        <ModalScheduleProfessionals open={openSchedule} scheduleProfessional={schedule} onClose={handleCloseSchedule} id={func.id} />
    </>
  )
}
