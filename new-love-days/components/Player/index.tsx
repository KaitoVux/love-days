/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import styles from "./Player.module.scss";

export interface ISong {
    name: string;
    author: string;
    img: string;
    audio: string;
    duration?: string;
}

export const Player: FC = () => {
    const [index, setIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState("0:00");
    const [musicList, setMusicList] = useState([
        {
            name: "Nice piano and ukulele",
            author: "Royalty",
            img: "https://www.bensound.com/bensound-img/buddy.jpg",
            audio: "https://www.bensound.com/bensound-music/bensound-buddy.mp3",
            duration: "2:02",
        },
        {
            name: "Gentle acoustic",
            author: "Acoustic",
            img: "https://www.bensound.com/bensound-img/sunny.jpg",
            audio: "https://www.bensound.com//bensound-music/bensound-sunny.mp3",
            duration: "2:20",
        },
        {
            name: "Corporate motivational",
            author: "Corporate",
            img: "https://www.bensound.com/bensound-img/energy.jpg",
            audio: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
            duration: "2:59",
        },
        {
            name: "Slow cinematic",
            author: "Royalty",
            img: "https://www.bensound.com/bensound-img/slowmotion.jpg",
            audio: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
            duration: "3:26",
        },
    ]);
    const [pause, setPause] = useState(false);

    // Refs
    const playerRef = useRef<any>();
    const timelineRef = useRef<any>();
    const playheadRef = useRef<any>();
    const hoverPlayheadRef = useRef<any>();

    useEffect(() => {
        const playerRefCur = playerRef?.current;
        const timelineRefCur = timelineRef.current;
        playerRefCur?.addEventListener("timeupdate", timeUpdate, false);
        playerRefCur?.addEventListener("ended", nextSong, false);
        timelineRefCur.addEventListener("click", changeCurrentTime, false);
        timelineRefCur.addEventListener("mousemove", hoverTimeLine, false);
        timelineRefCur.addEventListener("mouseout", resetTimeLine, false);

        return () => {
            playerRefCur?.removeEventListener("timeupdate", timeUpdate);
            playerRefCur?.removeEventListener("ended", nextSong);
            timelineRefCur?.removeEventListener("click", changeCurrentTime);
            timelineRefCur?.removeEventListener("mousemove", hoverTimeLine);
            timelineRefCur?.removeEventListener("mouseout", resetTimeLine);
        };
    }, []);

    const changeCurrentTime = (e: any) => {
        const duration = playerRef?.current?.duration;

        const playheadWidth = timelineRef.current?.offsetWidth;
        const offsetWidht = timelineRef.current?.offsetLeft;
        const userClickWidht = e.clientX - offsetWidht;

        const userClickWidhtInPercent = (userClickWidht * 100) / playheadWidth;

        playheadRef.current.style.width = userClickWidhtInPercent + "%";
        if (playerRef?.current && duration) {
            playerRef.current.currentTime = (duration * userClickWidhtInPercent) / 100;
        }
    };

    const hoverTimeLine = (e: any) => {
        const duration = playerRef?.current?.duration;

        const playheadWidth = timelineRef.current.offsetWidth;

        const offsetWidht = timelineRef.current.offsetLeft;
        const userClickWidht = e.clientX - offsetWidht;
        const userClickWidhtInPercent = (userClickWidht * 100) / playheadWidth;

        if (userClickWidhtInPercent <= 100) {
            hoverPlayheadRef.current.style.width = userClickWidhtInPercent + "%";
        }

        if (duration) {
            const time = (duration * userClickWidhtInPercent) / 100;

            if (time >= 0 && time <= duration) {
                hoverPlayheadRef.current.dataset.content = formatTime(time);
            }
        }
    };

    const resetTimeLine = () => {
        hoverPlayheadRef.current.style.width = 0;
    };

    const timeUpdate = () => {
        const duration = playerRef?.current?.duration;
        const timelineWidth = timelineRef.current.offsetWidth - playheadRef.current.offsetWidth;
        if (duration && playerRef?.current?.currentTime) {
            const playPercent = 100 * (playerRef?.current?.currentTime / duration);
            playheadRef.current.style.width = playPercent + "%";
            const currentTime = formatTime(parseInt(playerRef?.current?.currentTime));
            setCurrentTime(currentTime);
        }
    };

    const formatTime = (currentTime: number) => {
        const minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);

        const secondsStr = seconds >= 10 ? seconds.toString : "0" + (seconds % 60);

        const formatTime = minutes + ":" + secondsStr;

        return formatTime;
    };

    const updatePlayer = () => {
        const currentSong = musicList[index];
        const audio = new Audio(currentSong.audio);
        playerRef?.current?.load();
    };

    const nextSong = () => {
        setIndex((index + 1) % musicList.length);
        updatePlayer();
        if (pause) {
            playerRef?.current?.play();
        }
    };

    const prevSong = () => {
        setIndex((index + musicList.length - 1) % musicList.length);
        updatePlayer();
        if (pause) {
            playerRef?.current?.play();
        }
    };

    const playOrPause = () => {
        const currentSong = musicList[index];
        const audio = new Audio(currentSong.audio);
        if (!pause) {
            playerRef?.current?.play();
        } else {
            playerRef?.current?.pause();
        }
        setPause(!pause);
    };

    const clickAudio = (key: any) => {
        setIndex(key);
        updatePlayer();
        if (pause) {
            playerRef?.current?.play();
            setPause(false);
        }
    };
    return (
        <div className={styles.card}>
            <div className="current-song">
                <audio ref={(ref) => (playerRef.current = ref)} autoPlay>
                    <source src={musicList[index].audio} type="audio/ogg" />
                    Your browser does not support the audio element.
                </audio>
                <div className="img-wrap">
                    <img src={musicList[index].img} alt={musicList[index].name} />
                </div>
                <span className="song-name">{musicList[index].name}</span>
                <span className="song-autor">{musicList[index].author}</span>

                <div className="time">
                    <div className="current-time">{currentTime}</div>
                    <div className="end-time">{musicList[index].duration}</div>
                </div>

                <div ref={(ref) => (timelineRef.current = ref)} id="timeline">
                    <div ref={(ref) => (playheadRef.current = ref)} id="playhead"></div>
                    <div
                        ref={(ref) => (hoverPlayheadRef.current = ref)}
                        className="hover-playhead"
                        data-content="0:00"
                    ></div>
                </div>

                <div className="controls">
                    <button onClick={prevSong} className="prev prev-next current-btn">
                        <Image
                            src={"/icons/previous.svg"}
                            width={20}
                            height={20}
                            alt=""
                            className="fas fa-backward"
                        ></Image>
                    </button>

                    <button onClick={playOrPause} className="play current-btn p-5">
                        {!pause ? (
                            <Image src={"/icons/play.svg"} width={20} height={20} className="fas fa-play" alt="" />
                        ) : (
                            <Image
                                className="fas fa-pause"
                                width={20}
                                height={20}
                                src={"/icons/pause.svg"}
                                alt=""
                            ></Image>
                        )}
                    </button>
                    <button onClick={nextSong} className="next prev-next current-btn">
                        <Image src={"/icons/next.svg"} width={20} height={20} alt="" className="fas fa-forward"></Image>
                    </button>
                </div>
            </div>
            <div className="play-list">
                {musicList.map((music, key = 0) => (
                    <div
                        key={key}
                        onClick={() => clickAudio(key)}
                        className={
                            "track " +
                            (index === key && !pause ? "current-audio" : "") +
                            (index === key && pause ? "play-now" : "")
                        }
                    >
                        <img className="track-img" src={music.img} alt="" />
                        <div className="track-discr">
                            <span className="track-name">{music.name}</span>
                            <span className="track-author">{music.author}</span>
                        </div>
                        <span className="track-duration">{index === key ? currentTime : music.duration}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
