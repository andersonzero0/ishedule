import { useState, useEffect, useContext } from "react";
import { setupAPIClient } from "@/services/api";
import { canSSRAuth } from "@/utils/canSSRAuth";
import styles from "./styles.module.scss";
import Head from "next/head";
import dayjs from "dayjs";
import {
  BiBulb,
  BiBookmark,
  BiBody,
  BiGroup,
  BiArrowToBottom,
} from "react-icons/bi";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Loader } from "lucide-react";

export default function Dashboard() {
  const data = [
    {
      name: "Jan",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Fev",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Mar",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Abr",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Mai",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Jun",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Jul",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
    {
      name: "Ago",
      uv: 3200,
      pv: 4300,
      amt: 2100,
    },
    {
      name: "Set",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Out",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Nov",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Dez",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
  ];

  const { user, loading } = useContext(AuthContext);
  const [date, setDate] = useState<dayjs.Dayjs>();
  const [formatDate, setFormatDate] = useState("");
  const [countFunc, setCountFunc] = useState(0);

  useEffect(() => {
    let today = dayjs();
    let funcToday = user.professionals.length
    
    setCountFunc(funcToday)
    handleFormatDate(today);
  }, [user]);

  function handleFormatDate(day) {
    setDate(day);
    const monthString = new Date(day.$d).toLocaleString("pt-br", {
      month: "long",
    });
    const dayString = new Date(day.$d).toLocaleString("pt-br", {
      day: "numeric",
    });
    const weekdayString = new Date(day.$d).toLocaleString("pt-br", {
      weekday: "long",
    });
    const upperMonth =
      monthString.charAt(0).toUpperCase() + monthString.slice(1);
    const upperWeekday =
      weekdayString.charAt(0).toUpperCase() + weekdayString.slice(1);

    setFormatDate(`${upperWeekday}, ${dayString} de ${upperMonth}`);
  }

  return (
    <>
      <Head>
        <title>Dashboard | Ischedule</title>
      </Head>
      <div className={styles.containerCenter}>
        <div className={styles.containerHeader}>
          <h2 className={styles.scheduleTitle}>Visão geral</h2>
          <p className={styles.dateForStatus}>{formatDate}</p>
        </div>
        <div className={styles.containerUp}>
          <div className={styles.box}>
            <div className={styles.circle}>
              <BiBulb size={40} />
            </div>
            <div className={styles.boxText}>
              <h2>317</h2>
              <h3>Média mensal</h3>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.circle}>
              <BiBookmark size={40} />
            </div>
            <div className={styles.boxText}>
              <h2>40</h2>
              <h3>Qtd. do mês</h3>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.circle}>
              <BiBody size={40} />
            </div>
            <div className={styles.boxText}>
              <h2>{loading ? <Loader/> : countFunc}</h2>
              <h3>Funcionários</h3>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.circle}>
              <BiGroup size={40} />
            </div>
            <div className={styles.boxText}>
              <h2>41</h2>
              <h3>Atendimentos</h3>
            </div>
          </div>
        </div>
        <div className={styles.containerDown}>
          <ResponsiveContainer className={styles.containerChart}>
            <AreaChart
              width={700}
              height={230}
              data={data}
              margin={{ top: 30, right: 50, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F317C" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2F317C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c31c5a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#c31c5a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="uv"
                stroke="#2F317C"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
              <Area
                type="monotone"
                dataKey="pv"
                stroke="#c31c5a"
                fillOpacity={1}
                fill="url(#colorPv)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className={styles.containerList}>
            <div className={styles.listTitle}>
              <h3>Atendentes de hoje</h3>
            </div>
            <div className={styles.boxList}>
              {user?.professionals.length != 0 ? (
                user?.professionals.map((e: any, key: number) => {
                  return (
                    <>
                      <p key={e.id}>- {e.name}</p>
                    </>
                  );
                })
              ) : (
                <p>Ainda não há funcionários registrados</p>
              )}
            </div>
            {user?.professionals.length >= 8 ? (
              <button className={styles.btnList}>
                <BiArrowToBottom size={30} color="#2F317C" />
              </button>
            ) : (
              ""
            )}
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
