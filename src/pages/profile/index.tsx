import { useContext, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import styles from "./styles.module.scss";
import Image from "next/image";
import cameraAdd from "../../../public/cameraAdd.svg";
import { AiFillHeart } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import { CiLock, CiUnlock } from "react-icons/ci";
import { ServiceCard } from "../../components/ServiceCard";
import pencil from "../../../public/pencilWhite.svg";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker, TimeValidationError } from "@mui/x-date-pickers";
import { setupAPIClient } from "@/services/api";
import { canSSRAuth } from "@/utils/canSSRAuth";
import { ModalService } from "@/components/ModalService";
import { AuthContext, ScheduleProps } from "@/contexts/AuthContext";
import { api } from "@/services/apiClient";
import { parseCookies } from "nookies";
import { getDownloadURL } from "firebase/storage";
import { firebase } from "../../services/firebase";
import { FaRegCheckSquare } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { toast } from "react-toastify";
import { Loader } from 'lucide-react'
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

export default function Profile() {
  const { user, schedule } = useContext(AuthContext);
  const { getDataCompany } = useContext(AuthContext);
  const { "@firebase.token": token } = parseCookies();
  const [openModal, setOpenModal] = useState(false);
  const handleCloseModal = () => setOpenModal(false);

  const [bannerUrl, setBannerUrl] = useState("");
  const [imageBanner, setImageBanner] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageAvatar, setImageAvatar] = useState(null);
  const [companyName, setCompanyName] = useState<string>();
  const [likes, setLikes] = useState<number>(0);
  const [companyAddress, setCompanyAddress] = useState<string>();

  const [errorMessageEntrada, setErrorMessageEntrada] = useState('')
  const [errorMessageSaida, setErrorMessageSaida] = useState('')

  const [day, setDay] = useState<ScheduleProps>(
    {
      name: "dom",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    }
  )

  const [errorSaida, setErrorSaida] = useState<TimeValidationError | null>(
    null
  );
  const [errorEntrada, setErrorEntrada] = useState<TimeValidationError | null>(
    null
  );
  const [validTimes, setValidTimes] = useState({
    dom: true,
    seg: true,
    ter: true,
    qua: true,
    qui: true,
    sex: true,
    sab: true,
  });
  const [validMain, setValidMain] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categorySelected, setCategorySelected] = useState<string[]>([]);

  const [services, setServices] = useState([]);
  const [servicesDays, setServicesDays] = useState([
    { name: "dom", selected: true },
    { name: "seg", selected: false },
    { name: "ter", selected: false },
    { name: "qua", selected: false },
    { name: "qui", selected: false },
    { name: "sex", selected: false },
    { name: "sab", selected: false },
  ]);
  const [disabled, setDisabled] = useState(true);
  const [selectedDay, setselectedDay] = useState<string>("dom");
  const [weekDays, setWeekDays] = useState<ScheduleProps[]>([
    {
      name: "dom",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "seg",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "ter",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "qua",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "qui",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "sex",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
    {
      name: "sab",
      opening_time: dayjs(Date.now()),
      closing_time: dayjs(Date.now()),
      checked: false,
    },
  ]);

  const [names, setName] = useState([]);

  const [personName, setPersonName] = useState<string[]>([]);

  useEffect(() => {
    setCompanyName(user.company_name);
    setCompanyAddress(user.address);
    setAvatarUrl(user.avatar_url);
    setBannerUrl(user.banner_url);

    if (schedule) {
      const current_schedule = schedule.map((day) => {
        return {
          ...day,
          opening_time: dayjs(day.opening_time),
          closing_time: dayjs(day.closing_time),
        };
      });
      setWeekDays(current_schedule);
      setDay(current_schedule[0]);
    }
  }, [user, schedule]);

  const itens = [
    user?.service.map((e, key) => (
      <ServiceCard
        name={e.name}
        avatar={e.background_img_url}
        price={e.price}
        service={e}
        key={key}
      />
    )),
  ];

  function handleBannerFile(e) {
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

    if (
      image.type === "image/jpeg" ||
      image.type === "image/png" ||
      image.type === "image/jpg"
    ) {
      setImageAvatar(image);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  }

  async function uploadCompanyAvatar(image: File) {
    try {
      const randomId = Math.floor(Math.random() * 99999999 + 1);

      const storageRef = firebase
        .storage()
        .ref()
        .child(`avatarCompany/${randomId}-${image.name}`);
      const snapshot = await storageRef.put(image);

      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async function uploadCompanyBanner(image: File) {
    try {
      const randomId = Math.floor(Math.random() * 99999999 + 1);

      const storageRef = firebase
        .storage()
        .ref()
        .child(`bannerCompany/${randomId}-${image.name}`);
      const snapshot = await storageRef.put(image);

      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  function buttonEditProfile() {
    setDisabled(false);
  }

  const handleSaveCompanyData = async (e) => {
    e.preventDefault();
    try {
      let avatar_url = avatarUrl;
      let banner_url = bannerUrl;
      if (imageAvatar) {
        avatar_url = await uploadCompanyAvatar(imageAvatar);
      }

      if (imageBanner) {
        banner_url = await uploadCompanyBanner(imageBanner);
      }

      const data_company = await api.patch(
        "/user/company",
        {
          company_name: companyName,
          address: companyAddress,
          avatar_url: avatar_url,
          banner_url: banner_url,
          schedule: weekDays,
          categories: categorySelected
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWeekDays(data_company.data.schedule);
      getDataCompany();
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      console.log(error);
    } finally {
      setDisabled(true);
    }
  };

  function findFalseKey(obj: any) {
    for (const key in obj) {
      if (obj[key] === false) {
        return key; // Retorna a chave com valor 'false'
      }
    }
    return null; // Retorna null se nenhum valor 'false' for encontrado
  }

  useEffect(() => {
    const validFalse = findFalseKey(validTimes);

    if (validFalse) {
      setValidMain(false);
    } else {
      setValidMain(true);
    }
  }, [validTimes]);

  useEffect(() => {

    if(!day.checked) {

      setErrorMessageEntrada('')
      setErrorMessageSaida('')

      return
      
    }

    if(day.checked && (errorEntrada == 'maxTime' || errorEntrada == 'minTime')) {

      setErrorMessageEntrada(`O horário da entrada deve ser anterior ao horário da saída.`)
      
    } else if(errorEntrada == 'invalidDate') {

      setErrorMessageEntrada(`Horário inválido`)

    } else {

      setErrorMessageEntrada('')
      
    }

    if(day.checked && (errorSaida == 'maxTime' || errorSaida == 'minTime')) {

      setErrorMessageSaida(`O horário da entrada deve ser anterior ao horário da saída.`)
      
    } else if(errorSaida == 'invalidDate') {

      setErrorMessageSaida(`Horário inválido`)

    } else {

      setErrorMessageSaida('')
      
    }

  }, [errorEntrada, errorSaida, schedule, day, selectedDay])

  useEffect(() => {

    const daySelect = weekDays.find((param) => param.name === selectedDay);

    setDay(daySelect)
    
  }, [selectedDay, weekDays])

  useEffect(() => {

    if(errorMessageSaida == '' && errorMessageEntrada == '') {


      const newValidTimes = {...validTimes, [selectedDay]: true}

      setValidTimes(newValidTimes)
      
    } else {

      const newValidTimes = {...validTimes, [selectedDay]: false}
      
      setValidTimes(newValidTimes)
      
    }

  }, [errorMessageSaida, errorMessageEntrada])

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      
    }
  };


  const handleChange = (event: SelectChangeEvent<typeof categorySelected>) => {
    const {
      target: { value },
    } = event;
    setCategorySelected(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  async function getCategories() {
    const { data } = await api.get("/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setCategories(data);
  }

  async function postCategorySelected() {
    if(user.categories.length == 0) {
      return
    }
    const categoryChecked = await Promise.all(user.categories.map((category: any) => category.category_id))
    
    setCategorySelected(categoryChecked)
  }

  useEffect(() => {
    getCategories();
  }, [user])

  useEffect(() => {
    postCategorySelected()
  }, [user])

  const setDate = (name: string) => {

    if (!weekDays) {
      return;
    }
    
    return (
      <>
        <div className={styles.checkboxCompany}>
          <p className={disabled ? styles.textNotChecked : styles.textChecked}>
            Funciona
          </p>
          <button
            onClick={() => {
              const checkedDay = weekDays.map((param) => {
                if (param.name === name) {
                  return {
                    ...param,
                    checked: !param.checked,
                  };
                }
                return param;
              });
              setWeekDays(checkedDay);
            }}
            disabled={disabled}
            className={styles.btnChecked}
          >
            {day.checked ? (
              <FaRegCheckSquare size={25} />
            ) : (
              <FaRegSquare size={25} />
            )}
          </button>
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
                  disabled={!day.checked || disabled}
                  value={day.opening_time}
                  maxTime={dayjs(day.closing_time).subtract(1, "minute")}
                  onError={(newError) => setErrorEntrada(newError)}
                  slotProps={{
                    textField: {
                      helperText: errorMessageEntrada,
                    },
                  }}
                  onChange={(e) => {
                    const newOpeningTime = weekDays.map((param) => {
                      if (param.name === name) {
                        return {
                          ...param,
                          opening_time: e,
                        };
                      }
                      return param;
                    });
                    setWeekDays(newOpeningTime);
                  }}
                  className={styles.bgClock}
                  ampm={false}
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
                  disabled={!day.checked || disabled}
                  value={day.closing_time}
                  minTime={dayjs(day.opening_time).add(1, "minute")}
                  onError={(newError) => setErrorSaida(newError)}
                  slotProps={{
                    textField: {
                      helperText: errorMessageSaida,
                    },
                  }}
                  onChange={(e) => {
                    const newClosingTime = weekDays.map((param) => {
                      if (param.name === name) {
                        return {
                          ...param,
                          closing_time: e,
                        };
                      }
                      return param;
                    });
                    setWeekDays(newClosingTime);
                  }}
                  ampm={false}
                  className={styles.bgClock}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Perfil | Ischedule</title>
      </Head>
      <div className={!disabled ? styles.bodyActive : styles.body}>
        <div className={styles.containerCenter}>
          <div className={styles.btnEditProfile}>
            <button
              className={disabled ? styles.btnEdit : styles.btnEditDisabled}
              onClick={buttonEditProfile}
            >
              <Image
                src={pencil}
                height={25}
                width={25}
                alt="pencil"
                className={styles.imgEditProfile}
              />
            </button>
          </div>
          <div className={styles.headerProfile}>
            <div
              style={{ position: "relative" }}
              className={bannerUrl ? styles.editBanner : styles.labelBanner}
            >
              {bannerUrl ? (
                disabled ? (
                  ""
                ) : (
                  <label htmlFor="inpBanner">
                    <Image
                      src={pencil}
                      alt="Camera add icon"
                      width={60}
                      className={styles.image}
                    />
                  </label>
                )
              ) : (
                <label htmlFor="inpBanner">
                  <Image
                    src={cameraAdd}
                    alt="Camera add icon"
                    width={60}
                    className={styles.image}
                  />
                </label>
              )}

              <input
                type="file"
                id="inpBanner"
                accept="image/png, image/jpeg"
                onChange={handleBannerFile}
                disabled={disabled}
              />

              {bannerUrl && (
                <Image
                  src={bannerUrl}
                  alt="Banner da loja"
                  className={styles.bannerPreview}
                  fill
                />
              )}
            </div>
            <div className={styles.avatar}>
              <div
                className={avatarUrl ? styles.editAvatar : styles.labelAvatar}
              >
                {avatarUrl ? (
                  disabled ? (
                    ""
                  ) : (
                    <label htmlFor="inpAvatar">
                      <Image
                        src={pencil}
                        alt="Camera add icon"
                        width={40}
                        className={styles.image}
                      />
                    </label>
                  )
                ) : (
                  <label htmlFor="inpAvatar">
                    <Image
                      src={cameraAdd}
                      alt="Camera add icon"
                      width={40}
                      className={styles.image}
                    />
                  </label>
                )}

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
                <input
                  maxLength={35}
                  size={60}
                  type="text"
                  className={styles.inputName}
                  placeholder="Nome da empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={disabled}
                />
                <input
                  maxLength={50}
                  type="text"
                  className={styles.inputAdress}
                  placeholder="Rua XXXX - Nº 0"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
            <label className={styles.likes}>
              <AiFillHeart color="#fff" size={25} />
              <span>{likes}</span>
            </label>
          </div>

          <FormControl sx={{ marginTop: 1, width: "auto", float: 'right', display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 0.5 }}>
                <label className={styles.labelCategories} style={{float: 'right'}}>Categorias</label>
                <Select
                  disabled={disabled}
                  className={styles.selectCategories}
                  /* labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox" */
                  multiple
                  displayEmpty
                  value={categorySelected}
                  onChange={handleChange}
                  input={<OutlinedInput />}

                  renderValue={(selected) => (
                    categories.length == 0 ? <Loader/> :
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'end' }}>
                      {selected.length == 0 ? <Chip label={"Nenhuma categoria selecionada"} /> : selected.map((value) => {

                        const categoryView = categories.find((category) => category.id == value)

                        return (
                          <Chip key={value} label={categoryView.name} />
                        )

                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {categories.length > 0 && categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox style={{
                        backgroundColor: "#2F317C",
                        marginRight: "10px"
                      }} checked={categorySelected.indexOf(category.id) > -1} />
                      <ListItemText primary={category.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

            {user?.service ? (
              itens
            ) : (
              <div className={styles.noServices}>
                <p>não há serviços</p>
              </div>
            )}
          </div>
          <div className={styles.menuTime}>
            <h2>Horário de Abertura e Fechamento</h2>
            <div className={styles.timesDiv}>
              <div className={styles.weekDaysCheck}>
                {servicesDays.map((day) => {
                  const dayName = day.name;
                  return (
                    <button
                      key={day.name}
                      className={
                        day.selected
                          ? styles.containerCheckbox
                          : styles.containerCheckboxDisable
                      }
                      onClick={(e) => {
                        const changeDay = servicesDays.map((day) => {
                          e.preventDefault();
                          if (day.name === dayName) {
                            return { ...day, selected: true };
                          }
                          return { ...day, selected: false };
                        });
                        setServicesDays(changeDay);

                        setselectedDay(day.name);
                      }}
                    >
                      <label htmlFor="dom">{day.name} </label>
                    </button>
                  );
                })}
              </div>
              {schedule !== undefined && setDate(selectedDay)}
            </div>
          </div>
          {disabled ? (
            ""
          ) : (
            <div className={styles.btnProfileChanges}>
              <button
                className={styles.btnCancel}
                onClick={() => setDisabled(true)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirm}
                onClick={(e) => handleSaveCompanyData(e)}
                disabled={!validMain}
              >
                Salvar alterações
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  return {
    props: {},
  };
});
