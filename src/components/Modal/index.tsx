import Modal from "@mui/material/Modal";
import styles from "./styles.module.scss";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import cameraAdd from "../../../public/cameraAdd.svg";
import pencil from "../../../public/pencilWhite.svg";
import { firebase } from "@/services/firebase";
import { getDownloadURL } from "firebase/storage";
import { api } from "@/services/apiClient";
import { parseCookies } from "nookies";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import {
  Checkbox,
  InputLabel,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Box,
  Chip,
} from "@mui/material";

type propsModal = {
  open: boolean;
  edit?: boolean;
  func?: {
    id: string;
    name: string;
    role: string;
    avatar_url: string;
  };
  onClose: () => void;
  servicesCompany?: any[];
};

export function BasicModal({
  open,
  onClose,
  edit = false,
  func,
  servicesCompany,
}: propsModal) {
  const { getDataCompany } = useContext(AuthContext);
  const { "@firebase.token": token } = parseCookies();
  const [funcName, setFuncName] = useState<string>();
  const [funcRole, setFuncRole] = useState<string>();
  const [imageAvatar, setImageAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (func) {
      setAvatarUrl(func.avatar_url);
      setFuncName(func.name);
      setFuncRole(func.role);
    }
  }, [onClose]);

  async function uploadAvatar(image: File) {
    try {
      const randomId = Math.floor(Math.random() * 99999999 + 1);

      const storageRef = firebase
        .storage()
        .ref()
        .child(`avatarProfessionals/${randomId}-${image.name}`);
      const snapshot = await storageRef.put(image);

      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  function handleAvatarFile(e) {
    if (!e.target.files) {
      return;
    }

    const image = e.target.files[0];

    if (!image) {
      return;
    }

    if (
      image.type === "image/jpeg" ||
      image.type === "image/png" ||
      image.type === "image/jpg"
    ) {
      setImageAvatar(image);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  const handleCreateProfessional = async (e) => {
    setDisabled(true);
    e.preventDefault();
    try {
      const avatar_url = await uploadAvatar(imageAvatar);

      const response = await api.post(
        "/professionals",
        {
          name: funcName,
          role: funcRole,
          avatar_url: avatar_url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getDataCompany();
      setAvatarUrl("");
      setImageAvatar(null);
      setFuncName("");
      setFuncRole("");
      onClose();
      toast.success("Profissional adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao criar funcionário");
      console.log(error);
    } finally {
      setDisabled(false);
    }
  };

  const handleEditProfessional = async (e, id: string) => {
    e.preventDefault();
    setDisabled(true);

    try {
      let avatar_url: string | boolean = func.avatar_url;

      if (func.avatar_url != avatarUrl) {
        avatar_url = await uploadAvatar(imageAvatar);

        if (!avatar_url) {
          console.log("Error");
          throw new Error();
        }
      }

      const response = await api.put(
        `/professionals/${id}`,
        {
          name: funcName,
          role: funcRole,
          avatar_url: avatar_url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getDataCompany();
      onClose();
      toast.success("Profissional editado com sucesso");
    } catch (error) {
      toast.error("Erro ao editar funcionário");
      console.log(error);
    } finally {
      setDisabled(false);
    }
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const [names, setName] = useState([]);

  const [personName, setPersonName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  useEffect(() => {
    if(servicesCompany){
      setName(servicesCompany)
    }
  }, [servicesCompany])

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.containerCenter}>
        <div className={styles.containerHeader}>
          <p>{edit ? "Editar" : "Adicionar novo"} membro</p>
        </div>
        <div className={styles.containerForm}>
          <form>
            <div className={avatarUrl ? styles.edit : styles.labelAvatar}>
              <label htmlFor="inpAvatar">
                <Image
                  src={avatarUrl ? pencil : cameraAdd}
                  alt="Camera add icon"
                  width={20}
                  className={styles.image}
                />
              </label>
              <input
                required
                type="file"
                id="inpAvatar"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleAvatarFile}
              />

              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="Foto de perfil"
                  width={50}
                  height={50}
                  className={styles.avatarPreview}
                />
              )}
            </div>

            <label>Nome</label>
            <div className={styles.allInput}>
              <input
                required
                type="text"
                value={funcName}
                onChange={(e) => setFuncName(e.target.value)}
                className={styles.input}
              />
            </div>
            <label>Cargo</label>
            <div className={styles.allInput}>
              <input
                required
                type="text"
                value={funcRole}
                onChange={(e) => setFuncRole(e.target.value)}
                className={styles.input}
              />
            </div>

            <div>
              <FormControl sx={{ m: 0, width: "100%" }}>
                <InputLabel id="demo-multiple-checkbox-label" className={styles.labelServices}>Serviços</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={personName}
                  onChange={handleChange}
                  input={<OutlinedInput label="Serviços" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {names.length > 0 && names.map((name) => (
                    <MenuItem key={name.name} value={name.name}>
                      <Checkbox style={{
                        backgroundColor: "#2F317C",
                        marginRight: "10px"
                      }} checked={personName.indexOf(name.name) > -1} />
                      <img style={{
                        height: "50px",
                        aspectRatio: "4/3",
                        objectFit: "cover",
                        borderRadius: "12px",
                        marginRight: "10px"
                      }} src={name.background_img_url} alt=""/>
                      <ListItemText primary={name.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className={styles.containerButtons}>
              <button className={styles.btnCancel} onClick={onClose}>
                Cancelar
              </button>
              <button
                disabled={disabled}
                className={styles.btnConfirm}
                onClick={(e) =>
                  edit
                    ? handleEditProfessional(e, func.id)
                    : handleCreateProfessional(e)
                }
              >
                Concluído
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
