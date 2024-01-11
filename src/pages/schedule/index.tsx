import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import Head from "next/head";
import styles from "./styles.module.scss";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import todayIcon from "../../../public/todayIcon.svg";
import searchIcon from "../../../public/searchIcon.svg";
import { canSSRAuth } from "@/utils/canSSRAuth";
import { setupAPIClient } from "@/services/api";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BadgePlus } from "lucide-react";

export default function Schedule() {
  const [date, setDate] = useState<dayjs.Dayjs>();
  const [formatDate, setFormatDate] = useState("");
  const [focus, setFocus] = useState("done");

  useEffect(() => {
    let today = dayjs();
    handleFormatDate(today);
  }, []);

  function handleFormatDate(day) {
    setDate(day);
    const monthString = new Date(day.$d).toLocaleString("pt-br", {
      month: "long",
    });
    const dayString = new Date(day.$d).toLocaleString("pt-br", {
      day: "numeric",
    });
    const upperMonth =
      monthString.charAt(0).toUpperCase() + monthString.slice(1);

    setFormatDate(`${dayString} de ${upperMonth}`);
  }

  return (
    <>
      <Head>
        <title>Agenda | Ischedule</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.containerScheduleLeft}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <div className={styles.scheduleContents}>
              <h4>{formatDate}</h4>
              <div className={styles.scheduleButtons}>
                <button
                  className={styles.btnSchedule}
                  onClick={() =>
                    handleFormatDate(dayjs(date).subtract(1, "month"))
                  }
                >
                  <IoIosArrowBack />
                </button>
                <button
                  className={styles.btnSchedule}
                  onClick={() => handleFormatDate(dayjs(new Date()))}
                >
                  <Image src={todayIcon} alt="today icon" width={20} />
                  Hoje
                </button>
                <button
                  className={styles.btnSchedule}
                  onClick={() => handleFormatDate(dayjs(date).add(1, "month"))}
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </div>

            <StaticDatePicker
              orientation="portrait"
              openTo="day"
              value={date}
              onChange={(day: dayjs.Dayjs) => handleFormatDate(day)}
              defaultValue={dayjs(date)}
              dayOfWeekFormatter={(_day, weekday) => `${weekday.format("ddd")}`}
            />
          </LocalizationProvider>
          <div className={styles.statusList}>
            <div className={styles.statusHeader}>
              <button
                className={focus === "done" ? styles.focus : styles.btnStatus}
                onClick={() => {
                  setFocus("done");
                }}
              >
                Concluídos
              </button>
              <button
                className={
                  focus === "canceled" ? styles.focus : styles.btnStatus
                }
                onClick={() => {
                  setFocus("canceled");
                }}
              >
                Cancelados
              </button>
              <button
                className={focus === "off" ? styles.focus : styles.btnStatus}
                onClick={() => {
                  setFocus("off");
                }}
              >
                Ausências
              </button>
            </div>
            <div className={styles.statusDate}>
              <p className={styles.dateForStatus}>
                {dayjs(date).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className={styles.statusContent}>
              {false ? (
                ""
              ) : (
                <p className={styles.warningNotEmptyRegisters}>
                  Não há registros!
                </p>
              )}
            </div>
          </div>
        </div>
        <div className={styles.containerScheduleRight}>
          <div className={styles.scheduleTop}>
            <div className={styles.fixed}>
              <h2 className={styles.scheduleTitle}>Agenda</h2>
              <p className={styles.dateSchedule}>
                {dayjs(date).format("DD/MM/YYYY")}
              </p>
            </div>
            <div className={styles.boxActionsBtn}>
              <button className={styles.btnSearch}>
                <BadgePlus size={32}/>
              </button>
              <button className={styles.btnSearch}>
                <Image
                  src={searchIcon}
                  alt="icone search"
                  className={styles.btnSearch}
                />
              </button>
            </div>
          </div>
          <div className={styles.rigthScheduleContent}>
            <p>Não há registros!</p>
          </div>
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
