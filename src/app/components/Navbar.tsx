"use client";

import React, { useState } from 'react';
import { TiWeatherSnow, TiWeatherSunny } from "react-icons/ti";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import SearchBox from './SearchBox';
import axios from 'axios';
import { loadingCityAtom, placeAtom } from '../atom';
import { useAtom } from 'jotai';


type Props = {location?: string}

export default function Navbar({location}: Props) {
  
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  function handleSuggestionClick(value:string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (postiion) => {
        const { latitude, longitude } = postiion.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=4be1a29534569345199cc69d3cfa8417`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement> ) {
    setLoadingCity(true);
    e.preventDefault()
    if(suggestions.length==0) {
      setError("Location not found");
      
    } else{
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500)
      
    }
  }
  
  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=4be1a29534569345199cc69d3cfa8417`
        );

        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }
  
  
  return (
    <>
    <nav className="shadow-sm  sticky top-0 left-0 z-50 bg-[#eaeaea]">
        <div className="h-[80px]     w-full    flex   justify-between items-center  max-w-7xl px-3 mx-auto">
          <div className="flex items-center justify-center gap-2  ">
            <h2 className="text-[#333333] text-3xl font-serif tracking-wider">ClimaCast</h2>
            <TiWeatherSnow className='text-3xl text-blue-500'
/>
          </div>
          {/*  */}

          <section className='flex gap-2 items-center px-2'>
            <FaLocationCrosshairs 
            onClick={handleCurrentLocation}
            title='Your Current Location'
            className='text-2xl text-blue-500 hover:opacity-80 cursor-pointer'/>
            <FaLocationDot className='text-2xl text-[#413030]' />
            
            <p className='text-[#413030] text-base'>{location}</p>
            <div className='relative hidden md:flex pl-1'>
            <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChange(e.target.value)}
            />
            <SuggestionBox 
            {...{showSuggestions,
                 suggestions,
                 handleSuggestionClick,
                 error}} />
          </div> 
          </section>

          

        </div>
      </nav>

      <section className='flex max-w-7xl px-3 justify-center md:hidden'>
        <div className='relative'>
            <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChange(e.target.value)}
            />
            <SuggestionBox 
            {...{showSuggestions,
                 suggestions,
                 handleSuggestionClick,
                 error}} />
          </div>
      </section>
      
    </>  
  )
}


function SuggestionBox(
  {
    showSuggestions,
    suggestions,
    handleSuggestionClick,
    error,
  } : {
    showSuggestions: boolean,
    suggestions: string[],
    handleSuggestionClick: (item: string) => void,
    error: string
  }
) {
  return(
  <> {((showSuggestions && suggestions.length >0) || error) && 
     <ul className='mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2'>
      {error && suggestions.length < 1 && (<li className='text-red-500 p-1'> {error} </li>)}
      {suggestions.map((item,i)=> (
        <li key={i} 
        onClick={() => handleSuggestionClick(item)}
        className='cursor-pointer p-1 rounded hover:bg-gray-200'>
          {item}
        </li>
      ))}

    
    </ul>}
  </>);
  
}