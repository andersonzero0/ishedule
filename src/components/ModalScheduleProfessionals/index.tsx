import Modal from "@mui/material/Modal";
import styles from "./styles.module.scss";
import { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban } from 'lucide-react'
import { firebase } from "@/services/firebase";
import { api } from "@/services/apiClient";
import { parseCookies } from "nookies";
import { AuthContext } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { FaRegCheckSquare } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker, TimeValidationError } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { CiLock, CiUnlock } from "react-icons/ci";

type PropsModalScheduleProfessionals = {
  id: string;
  open: boolean;
  edit?: boolean;
  scheduleProfessionals?: [enter_time: string, exit_time: string, weekdays: []];
  onClose: () => void;
  scheduleProfessional: []
};

export function ModalScheduleProfessionals({
  id,
  open,
  onClose,
  edit = false,
  scheduleProfessionals,
  scheduleProfessional
}: PropsModalScheduleProfessionals) {
  const [companyWeekdays, setCompanyWeekdays] = useState([]);
  const { schedule } = useContext(AuthContext)
  const [errorEntrada, setErrorEntrada] = useState<TimeValidationError | null>(null)
  const [errorSaida, setErrorSaida] = useState<TimeValidationError | null>(null)
  const [validTimes, setValidTimes] = useState({
    'dom': true,
    'seg': true,
    'ter': true,
    'qua': true,
    'qui': true,
    'sex': true,
    'sab': true,
  })
  const [validMain, setValidMain] = useState(true)
  const [selectScheduleCompany, setSelectScheduleCompany] = useState({ name: '', checked: false, opening_time: dayjs(Date.now()), closing_time: dayjs(Date.now()) }) 
  const [companyEnterTime, setCompanyEnterTime] = useState("");
  const { '@firebase.token': token } = parseCookies()
  const [companyExitTime, setCompanyExitTime] = useState("");

  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [enterTime, setEnterTime] = useState("");
  const [exitTime, setExitTime] = useState("");

  const weekDaysDefault = [
    {
      name: "dom",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "seg",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "ter",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "qua",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "qui",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "sex",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
    {
      name: "sab",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0)),
    },
  ]

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
  const [selected, setSelected] = useState(false);
  const [selectedDay, setselectedDay] = useState<string>("dom");
  const [weekDays, setWeekDays] = useState(weekDaysDefault);

  async function handleUpdateSchedule() {

    try {

      const response = await api.patch(`professionals/schedule/${id}`, weekDays, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      toast.success("Schedule atualizado!")
      onClose()
      
    } catch (error) {
      console.log(error)
      toast.error("Error ao definir Schedule!")
    }
    
  }

  function findFalseKey(obj: any) {
    for (const key in obj) {
      if (obj[key] === false) {
        return key; // Retorna a chave com valor 'false'
      }
    }
    return null; // Retorna null se nenhum valor 'false' for encontrado
  }

  useEffect(() => {

    const validFalse = findFalseKey(validTimes)


    if(validFalse) {
      setValidMain(false)
    } else {
      setValidMain(true)
    }
    
  }, [validTimes])


  useEffect(() => {

    if(scheduleProfessional) {
      const current_schedule = scheduleProfessional.map((day: any) => {    
        return {...day, opening_time:dayjs(day.opening_time), closing_time: dayjs(day.closing_time)}
      })
      setWeekDays(current_schedule)    
    }
    
  }, [open, scheduleProfessional, id])

  const setDate = (name: string) => {

    let select: any = {
      name: "dom",
      checked: false,
      opening_time: dayjs(new Date().setHours(0, 0, 0, 0)),
      closing_time: dayjs(new Date().setHours(0, 0, 0, 0))
    }

    if(schedule) {

      select = schedule.find((param) => param.name === name)
      
    }

    let errorMessageEntrada = useMemo(() => {
      switch (errorEntrada) {
        case 'maxTime':
        case 'minTime': {
          return `Selecione o horário entre ${dayjs(select.opening_time).format('HH:mm')} e ${dayjs(select.closing_time).format('HH:mm')}, e que a entrada seja menor que a saída`
        }
        case 'invalidDate': {
          return "Horario inválido"
        }

        default: {
          return ''
        }
      }
    }, [errorEntrada])

    let errorMessageSaida = useMemo(() => {
      switch (errorSaida) {
        case 'maxTime':
        case 'minTime': {
          return `Selecione o horário entre ${dayjs(select.opening_time).format('HH:mm')} e ${dayjs(select.closing_time).format('HH:mm')}, `
        }
        case 'invalidDate': {
          return "Horário inválido"
        }

        default: {
          return ''
        }
      }
    }, [errorSaida])
    
    const day = weekDays.find((param) => param.name === name);

    if(!day.checked) {

      errorMessageEntrada = ''
      errorMessageSaida = ''
      
    }

    useMemo(() => {

      if(errorMessageSaida == '' && errorMessageEntrada == '') {


        const newValidTimes = {...validTimes, [name]: true}

        setValidTimes(newValidTimes)
        
      } else {

        const newValidTimes = {...validTimes, [name]: false}
        
        setValidTimes(newValidTimes)
        
      }

    }, [errorMessageSaida, errorMessageEntrada])
    
    return (
      <div className={styles.conteinerModal}>
        <div className={styles.checkboxCompany}>
          <p className={ styles.textChecked}>
            trabalha
          </p>
          <button
            disabled={!select.checked}
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
            className={styles.btnChecked}
          >
            {!select.checked ? <Ban /> : day.checked ? (
              <FaRegCheckSquare size={25} />
            ) : (
              <FaRegSquare size={25} />
            )}
          </button>
        </div>
        <div className={styles.useHour}>
          <div className={styles.time}>
            <h3>Entrada</h3>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                disabled={!day.checked}
                minTime={dayjs(select.opening_time).subtract(1, 'minute')}
                maxTime={dayjs(select.closing_time).add(1, 'minute') && dayjs(day.closing_time).subtract(1, 'minute')}
                onError={(newError) => setErrorEntrada(newError)}
                slotProps={{
                  textField: {
                    helperText: errorMessageEntrada
                  }
                }}
                value={day.opening_time}
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
          <div className={styles.time}>
            <h3>Saída</h3>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                disabled={!day.checked}
                minTime={dayjs(select.opening_time).subtract(1, 'minute') && dayjs(day.opening_time).add(1, 'minute')}
                maxTime={dayjs(select.closing_time).add(1, 'minute')}
                onError={(newError) => setErrorSaida(newError)}
                slotProps={{
                  textField: {
                    helperText: errorMessageSaida
                  }
                }}
                value={day.closing_time}
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
        <div className={styles.btnProfileChanges}>
              <button className={styles.btnCancel} onClick={() => {
                setWeekDays(weekDaysDefault)
                onClose()
              }}>Cancelar</button>
              <button onClick={handleUpdateSchedule} disabled={!validMain} className={styles.btnConfirm}>Salvar alterações</button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.containerCenter}>
        <div className={styles.containerHeader}>
          <p>Editar horários</p>
        </div>
        <div className={styles.containerForm}>
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
                  <label htmlFor="dom">{day.name}</label>
                </button>
              );
            })}
          </div>
          {setDate(selectedDay)}
        </div>
      </div>
    </Modal>
  );
}
