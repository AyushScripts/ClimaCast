"use client"

import Image from "next/image";
import Navbar from "./components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "./components/Container";
import { convertKelvinToCelcius } from "./utils/convertKelvinToCelcius";
import WeatherIcons from "./components/WeatherIcons";
import { getDayOrNightIcon } from "./utils/getDayorNightIcon";
import WeatherDetails from "./components/WeatherDetails";
import { metersToKilometers } from "./utils/metersToKilometers";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import ForecastWeatherDetails from "./components/ForecastWeatherDetails";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";


//https://api.openweathermap.org/data/2.5/forecast?q=tinsukia&appid=4be1a29534569345199cc69d3cfa8417&cnt=56

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}


export default function Home() {

  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity,] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch} = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=4be1a29534569345199cc69d3cfa8417&cnt=56`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch])
  

  console.log(data);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });
  
  if(isLoading) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce"> Loading... </p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 bg-[#3b5998] min-h-screen">
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9  w-full  pb-10 pt-4 ">
        {loadingCity ? <SkeletonLoading/> :
      
          <>
            {/* today data  */}
            <section className="space-y-4 ">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl  items-end text-[#bbcbe0] ">
                  <p className="font-semibold">{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
                  <p className="text-lg">
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
                  </p>
                </h2>
                <Container className=" gap-10 px-6 items-center">
                  {/* temprature */}
                  <div className=" flex flex-col px-4 ">
                    <span className="text-5xl">
                      {convertKelvinToCelcius(firstData?.main.temp ?? 296.37)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span> Feels like</span>
                      <span>
                        {convertKelvinToCelcius(
                          firstData?.main.feels_like ?? 0
                        )}
                        °
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}
                        °↓{" "}
                      </span>
                      <span>
                        {" "}
                        {convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}
                        °↑
                      </span>
                    </p>
                  </div>
                  {/* time  and weather  icon */}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold "
                      >
                        <p className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </p>

                        {/* <WeatherIcon iconName={d.weather[0].icon} /> */}
                        <WeatherIcons
                          iconName={getDayOrNightIcon(
                            d.weather[0].icon,
                            d.dt_txt
                          )}
                        />
                        <p>{convertKelvinToCelcius(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className=" flex gap-4">
                {/* left  */}
                <Container className="w-fit  justify-center border border-none flex-col px-4 items-center bg-[#9dc5e6]">
                  <p className=" capitalize text-center font-semibold">
                    {firstData?.weather[0].description}{" "}
                  </p>
                  <WeatherIcons
                    iconName={getDayOrNightIcon(
                      firstData?.weather[0].icon ?? "",
                      firstData?.dt_txt ?? ""
                    )}
                  />
                </Container>
                {/* right  */}
                <Container className="bg-[#ffeb3b]  px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visibility={metersToKilometers(
                      firstData?.visibility ?? 10000
                    )}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 1702949452),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 1702517657),
                      "H:mm"
                    )}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                  />
                </Container>
                
              </div>
            </section>

            {/* 7 day forcast data  */}
            <section className="flex w-full flex-col gap-4  ">
              <p className="text-2xl font-semibold text-[#bbcbe0]">This Week</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetails
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  date={d ? format(parseISO(d.dt_txt), "dd.MM"): ""}
                  day={d ? format(parseISO(d.dt_txt), "EEEE"): ""}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa `}
                  humidity={`${d?.main.humidity}% `}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1702517657),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1702517657),
                    "H:mm"
                  )}
                  visibility={`${metersToKilometers(d?.visibility ?? 10000)} `}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)} `}
                />
              ))}
            </section>
          </>}
          <footer className="flex justify-center items-center">
          <div className=" text-xs text-black/40 font-semibold ">{new Date().getFullYear()}@Ayush B. All rights reserved. </div>
        </footer>
      </main>
    </div>
  );
}


const SkeletonLoading = () => {
  return (
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 ">
      {/* today data  */}
      <>
        <section className="space-y-4 ">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end animate-pulse">
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col justify-center items-center space-y-2 animate-pulse">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="flex flex-col justify-center items-center space-y-2 animate-pulse">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            {/* left  */}
            <div className="w-fit justify-center flex-col px-4 items-center animate-pulse">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto animate-pulse">
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
            {/* right  */}
          </div>
        </section>

        {/* 7 day forecast data  */}
        <section className="flex w-full flex-col gap-4 ">
          <p className="text-2xl animate-pulse">This Week!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </section>

        
      </>
    </main>
  );
};
