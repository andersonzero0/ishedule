import { ReactNode, useContext, useEffect, useState } from "react";
import Head from "next/head";
import styles from "./styles.module.scss";
import Image from "next/image";
import cameraAdd from "../../../public/cameraAdd.svg";
import { AiFillHeart } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import { CiLock, CiUnlock } from "react-icons/ci";
import { ServiceCard } from "../../components/ServiceCard";
import pencil from '../../../public/pencilWhite.svg'
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers';
import { setupAPIClient } from "@/services/api";
import { canSSRAuth } from "@/utils/canSSRAuth";
import { ModalService } from "@/components/ModalService";
import { AuthContext } from "@/contexts/AuthContext";
import { api } from "@/services/apiClient";
import { parseCookies } from "nookies";
import { FaChevronDown } from "react-icons/fa";
import { getDownloadURL } from "firebase/storage";
import { firebase } from '../../services/firebase'
import { toast } from "react-toastify";
import Checkbox from '@mui/material/Checkbox';


type PropsDataCompany = {
  company?: {
    company_name: string;
    address: string;
    banner_url: string;
    avatar_url: string;
    opening_time: string;
    closing_time: string;
  }
}

type PropsDayData = {
  name: string;
  selected: boolean;
  closing_time: string;
  opening_time: string;
}


export default function Profile() {
  const { user } = useContext(AuthContext)
  const { getDataCompany } = useContext(AuthContext)
  const { '@firebase.token': token } = parseCookies()
  const [openModal, setOpenModal] = useState(false)
  const handleCloseModal = () => setOpenModal(false)
  const [openHour, setOpenHour] = useState<string>();
  const [closedHour, setClosedHour] = useState<string>();
  const [value, setValue] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));

  const [bannerUrl, setBannerUrl] = useState('');
  const [imageBanner, setImageBanner] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageAvatar, setImageAvatar] = useState(null);
  const [companyName, setCompanyName] = useState<string>();
  const [companyAddress, setCompanyAddress] = useState<string>();

  const [categories, setCategories] = useState([]);
  const [categorySelected, setCategorySelected] = useState("");

  const [services, setServices] = useState([]);
  const [servicesDays, setServicesDays] = useState([{ name: "dom", selected: false }, { name: "seg", selected: false }, { name: "ter", selected: false }, { name: "qua", selected: false }, { name: "qui", selected: false }, { name: "sex", selected: false }, { name: "sab", selected: false }]);
  const [disabled, setDisabled] = useState(true)
  const [selected, setSelected] = useState(false)
  const [selectedDay, setselectedDay] = useState<string>('dom');
  const [weekDays, setWeekDays] = useState([{ name: "dom", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "seg", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "ter", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "qua", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "qui", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "sex", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }, { name: "sab", checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }])

  useEffect(() => {
    setCompanyName(user.company_name)
    setCompanyAddress(user.address)
    setAvatarUrl(user.avatar_url)
    setBannerUrl(user.banner_url)
    setClosedHour(user.closing_time)
    setOpenHour(user.opening_time)

  }, [user])

  const itens = [
    user?.service.map((e, key) =>
      <ServiceCard name={e.name} avatar={e.background_img_url} price={e.price} service={e} key={key} />
    )
  ]

  function handleBannerFile(e) {
    if (!e.target.files) {
      return;
    }


    const image = e.target.files[0];


    if (!image) {
      return;
    }

    if (image.type === "image/jpeg" || image.type === "image/png" || image.type === "image/jpg") {
      setImageBanner(image);
      setBannerUrl(URL.createObjectURL(e.target.files[0]));
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

    if (image.type === "image/jpeg" || image.type === "image/png" || image.type === "image/jpg") {
      setImageAvatar(image);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function uploadCompanyAvatar(image: File) {

    try {
      const randomId = Math.floor(Math.random() * 99999999 + 1);

      const storageRef = firebase.storage().ref().child(`avatarCompany/${randomId}-${image.name}`)
      const snapshot = await storageRef.put(image)

      const url = await getDownloadURL(snapshot.ref)
      return url

    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }

  async function uploadCompanyBanner(image: File) {

    try {
      const randomId = Math.floor(Math.random() * 99999999 + 1);

      const storageRef = firebase.storage().ref().child(`bannerCompany/${randomId}-${image.name}`)
      const snapshot = await storageRef.put(image)

      const url = await getDownloadURL(snapshot.ref)
      return url

    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }

  function handleChangeCategory(e) {
    setCategorySelected(e.target.value);
  }

  function buttonEditProfile() {
    setDisabled(false)
  }

  const handleSaveCompanyData = async (e) => {
    e.preventDefault()
    try {
      let avatar_url = avatarUrl;
      let banner_url = bannerUrl;
      if (imageAvatar) {
        avatar_url = await uploadCompanyAvatar(imageAvatar)
      }

      if (imageBanner) {
        banner_url = await uploadCompanyBanner(imageBanner)
      }



      const response = await api.patch('/user/company', {
        company_name: companyName,
        address: companyAddress,
        avatar_url: avatar_url,
        banner_url: banner_url,
        closing_time: String(closedHour),
        opening_time: String(openHour)
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
      )

      getDataCompany()
    } catch (error) {
      console.log(error)
    }
    finally {
      setDisabled(true)
    }

  }

  const setDate = (name: string) => {
    const day = weekDays.find((param) => param.name === name)

    return (
      <>
        <div className={styles.checkboxCompany}>
          <p>Funciona</p>
          <Checkbox
          value={day.checked}
          onChange={(e) => {
            const checkedDay = weekDays.map((param) => {
              if (param.name === name ) {
                console.log(!param.checked);
                return {
                  ...param ,
                  checked: !param.checked
                }
              }
              return param              
            })
            setWeekDays(checkedDay)
          }}
          />
        </div>
        <div className={styles.useHour}>
          <div className={styles.time}>
            <div className={styles.timeRight}>
              <CiUnlock color="#fff" size={50} />
            </div>
            <div className={styles.timeLeft}>
              <h3>Abertura</h3>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={day.opening_time}
                  onChange={(e) => {
                    const newOpeningTime = weekDays.map((param) => {
                      if (param.name === name) {
                        return {
                          ...param,
                          opening_time: e
                        }
                      }
                      return param
                    })
                    setWeekDays(newOpeningTime)
                  }
                  }
                  className={styles.bgClock}
                  ampm={false}
                  disabled={disabled}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className={styles.time}>
            <div className={styles.timeRight}>
              <CiLock color="#fff" size={50} />
            </div>
            <div className={styles.timeLeft}>
              <h3>Fechamento</h3>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={day.closing_time}
                  onChange={(e) => {
                    const newClosingTime = weekDays.map((param) => {
                      if (param.name === name) {
                        return {
                          ...param,
                          closing_time: e
                        }
                      }
                      return param
                    })
                    setWeekDays(newClosingTime)
                  }}
                  ampm={false}
                  className={styles.bgClock}
                  disabled={disabled}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      </>
    )

  }

  return (
    <>
      <Head>
        <title>Perfil | Ischedule</title>
      </Head>
      <div className={!disabled ? styles.bodyActive : styles.body}>

        <div className={styles.containerCenter}>
          <div className={styles.btnEditProfile}>
            <button className={disabled ? styles.btnEdit : styles.btnEditDisabled} onClick={buttonEditProfile}><Image src={pencil} height={25} width={25} alt="pencil" className={styles.imgEditProfile} /></button>
          </div>
          <div className={styles.headerProfile}>
            <div className={bannerUrl ? styles.editBanner : styles.labelBanner}>
              {bannerUrl ?

                disabled ? '' :
                  <label htmlFor="inpBanner">
                    <Image src={pencil} alt="Camera add icon" width={60} className={styles.image} />
                  </label>
                :
                <label htmlFor="inpBanner">
                  <Image src={cameraAdd} alt="Camera add icon" width={60} className={styles.image} />
                </label>
              }

              <input
                type="file"
                id='inpBanner'
                accept="image/png, image/jpeg"
                onChange={handleBannerFile}
                disabled={disabled}
              />

              {bannerUrl && (
                <Image
                  src={bannerUrl}
                  alt="Banner da loja"
                  width={250}
                  height={250}
                  className={styles.bannerPreview}
                />
              )}
            </div>
            <div className={styles.avatar}>
              <div className={avatarUrl ? styles.editAvatar : styles.labelAvatar}>
                {avatarUrl ?

                  disabled ? '' :
                    <label htmlFor="inpAvatar">
                      <Image src={pencil} alt="Camera add icon" width={40} className={styles.image} />
                    </label>

                  :
                  <label htmlFor="inpAvatar">
                    <Image src={cameraAdd} alt="Camera add icon" width={40} className={styles.image} />
                  </label>
                }

                <input
                  type="file"
                  id="inpAvatar"
                  accept="image/png, image/jpeg"
                  onChange={handleAvatarFile}
                  disabled={disabled}
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
              <div className={styles.info}>
                <input maxLength={35} size={60} type="text" className={styles.inputName} placeholder="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={disabled} />
                <input maxLength={50} type="text" className={styles.inputAdress} placeholder="Rua XXXX - Nº 0" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} disabled={disabled} />
              </div>
            </div>
            <label className={styles.likes}>
              <AiFillHeart color="#fff" size={25} />
              <span>300</span>
            </label>
          </div>
          <select
            value={categorySelected}
            onChange={handleChangeCategory}
            className={styles.select}
          >
            <option value="" selected>
              Editar categoria
            </option>
            {categories.map((item, index) => {
              return (
                <option key={item.id} value={index}>
                  {item.name}
                </option>
              );
            })}
          </select>
          <div className={styles.menuServices}>
            <div className={styles.addService}>
              <div className={styles.plusDiv}>
                <button onClick={() => setOpenModal(true)}>
                  <BsPlusLg color="#e83f5b" size={80} />
                </button>
                <ModalService open={openModal} onClose={handleCloseModal} />
              </div>
              <span>Adicionar novo serviço</span>
            </div>

            {user?.service ?
              itens
              :
              <div className={styles.noServices}>
                <p>não há serviços</p>
              </div>
            }

          </div>
          <div className={styles.menuTime}>
            <h2>Horário de Abertura e Fechamento</h2>
            <div className={styles.timesDiv}>
              <div className={styles.weekDaysCheck}>
                {servicesDays.map((day) => {
                  const dayName = day.name
                  return <button className={day.selected ? styles.containerCheckbox : styles.containerCheckboxDisable}
                    onClick={(e) => {
                      const changeDay = servicesDays.map((day) => {
                        e.preventDefault()
                        if (day.name === dayName) {
                          return { ...day, selected: true }
                        }
                        return { ...day, selected: false }
                      })
                      setServicesDays(changeDay)

                      setselectedDay(day.name)
                    }}>
                    <label htmlFor="dom">{day.name} </label>
                  </button>

                })
                }
              </div>
              {setDate(selectedDay)}
            </div>
          </div>
          {disabled ?
            ''
            :
            <div className={styles.btnProfileChanges}>
              <button className={styles.btnCancel} onClick={() => setDisabled(true)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={(e) => handleSaveCompanyData(e)}>Salvar alterações</button>
            </div>
          }
        </div>
      </div>

    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)

  return {
    props: {}
  }
})