import Modal from "@mui/material/Modal"

type propsModalSchedule = {
    open: boolean,
    onClose: any
};

export default function ModalSchedule ({ open, onClose }): propsModalSchedule {
    return (
        <Modal open={open} onClose={onClose}>

        </Modal>
    )
}