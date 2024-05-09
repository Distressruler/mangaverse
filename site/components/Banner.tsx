"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BannerProps {
  banners: Array<{
    imageURL: string;
    title: string;
    description: string;
    name: string;
    buttonURL: string;
  }>;
}

export default function Banner(props: BannerProps) {
  const [focusedImage, setFocusedImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (focusedImage + 1 >= props.banners.length) {
        setFocusedImage(0);
      } else {
        setFocusedImage(focusedImage + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [focusedImage]);

  if (!props.banners.length) return null;

  if (!props.banners[focusedImage]) {
    setFocusedImage(0);
  }

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: `url(${
          props.banners[focusedImage].imageURL.startsWith("/") ? `${props.banners[focusedImage].imageURL}.jpg` : props.banners[focusedImage].imageURL
        })`,
      }}
    >
      <div className="hero-overlay bg-opacity-20"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold text-white" style={{ textShadow: "2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, -2px 0 0 #000" }}>
            {props.banners[focusedImage].title}
          </h1>
          {/* <p>{props.banners[focusedImage].description}</p> */}
          <Link href={props.banners[focusedImage].buttonURL}>
            <button className="btn btn-primary">READ NOW</button>
          </Link>
        </div>
      </div>
    </div>

    // <div className="carousel w-full h-96 mt-6">
    //   <div id="slide1" className="carousel-item relative flex justify-center w-full ">
    //     <img
    //       src="https://wallpaperaccess.com/full/3231246.png"
    //       className="w-7/12"
    //     />
    //   </div>
    //   <div id="slide2" className="carousel-item relative justify-center w-full">
    //     <img src="https://picx.zhimg.com/50/v2-58d2b8bc86d0e2f352bbb71db2940c0d_720w.jpg?source=1940ef5c" className="w-8/12" />{" "}
    //     <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
    //       <a href="#slide1" className="btn btn-circle">
    //         ❮
    //       </a>
    //       <a href="#slide1" className="btn btn-circle">
    //         ❯
    //       </a>
    //     </div>
    //   </div>
    //   <div id="slide3" className="carousel-item relative justify-center w-full">
    //     <img src="https://cdn.wallpapersafari.com/32/10/nm5BDt.jpg" className="w-8/12" />
    //   </div>
    //   <div id="slide4" className="carousel-item relative justify-center w-full">
    //     <img src="https://i.redd.it/ug04nv7al3941.jpg" className="w-8/12" />
    //   </div>
    // </div>
  );
}
