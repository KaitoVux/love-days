/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import {FC, useEffect, useRef, useState} from "react";
import {songs} from "../../utils/songs";
import styles from "./Player.module.scss";

export interface ISong {
    name: string;
    author: string;
    img: string;
    audio: string;
    duration?: string;
}

export const Player: FC = () => {
    const [currentPlay, setCurrentPlay] = useState<ISong>(songs[0]);
    const [currentTime, setCurrentTime] = useState("0:00");
    const musicList = songs;
    const [pause, setPause] = useState(true);

    // Refs
    const playerRef = useRef<HTMLAudioElement>();
    const timelineRef = useRef<any>();
    const playheadRef = useRef<any>();
    const hoverPlayheadRef = useRef<any>();

    useEffect(() => {
        const playerRefCur = playerRef?.current;
        const timelineRefCur = timelineRef.current;
        playerRefCur?.addEventListener("timeupdate", timeUpdate, false);
        timelineRefCur.addEventListener("click", changeCurrentTime, false);
        timelineRefCur.addEventListener("mousemove", hoverTimeLine, false);
        timelineRefCur.addEventListener("mouseout", resetTimeLine, false);

        return () => {
            playerRefCur?.removeEventListener("timeupdate", timeUpdate);
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
        if (duration && playerRef?.current?.currentTime) {
            const playPercent = 100 * (playerRef?.current?.currentTime / duration);
            playheadRef.current.style.width = playPercent + "%";
            const currentTime = formatTime(playerRef?.current?.currentTime);
            setCurrentTime(currentTime);
        }
    };

    const formatTime = (currentTime: number) => {
        const minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);

        const secondsStr = seconds >= 10 ? seconds.toString() : "0" + (seconds % 60);

        return minutes + ":" + secondsStr;
    };

    useEffect(() => {
        playerRef?.current?.load();
        playerRef?.current?.play().then(() => {
            setPause(false);
        });
    }, [currentPlay]);

    const updatePlayer = (index: number) => {
        const song = songs[index];
        setCurrentPlay(song);
    };

    const nextSong = () => {
        if (pause) {
            setPause(false);
        }
        const nextId = songs.indexOf(currentPlay) + 1;
        updatePlayer(nextId % musicList.length);
    };

    const prevSong = () => {
        if (pause) {
            setPause(false);
        }
        const prevId = songs.findIndex((x) => x.audio === currentPlay.audio) + musicList.length - 1;
        updatePlayer(prevId % musicList.length);
    };

    const playOrPause = async () => {
        if (pause) {
            await playerRef?.current?.play();
        } else {
            playerRef?.current?.pause();
        }
        setPause(!pause);
    };

    const clickAudio = (index: number) => {
        updatePlayer(index);
    };
    return (
        <div className={styles.card}>
            <div className="current-song">
                <audio ref={(ref) => (playerRef.current = ref as HTMLAudioElement)} onEnded={nextSong} src={currentPlay.audio} autoPlay>
                    Your browser does not support the audio element.
                </audio>
                <div className="img-wrap">
                    <img src={currentPlay.img} alt={currentPlay.name} />
                </div>
                <span className="song-name">{currentPlay.name}</span>
                <span className="song-autor">{currentPlay.author || "Unknown"}</span>

                <div className="time">
                    <div className="current-time">{currentTime}</div>
                    <div className="end-time">{currentPlay.duration}</div>
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
                        {pause ? (
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
                {musicList.map((music, index) => (
                    <div
                        key={index}
                        onClick={() => clickAudio(index)}
                        className={
                            "track " +
                            (currentPlay.audio === music.audio && pause ? "current-audio" : "") +
                            (currentPlay.audio === music.audio && !pause ? "play-now" : "")
                        }
                    >
                        <img className="track-img" src={music.img} alt="" />
                        <div className="track-discr">
                            <span className="track-name">{music.name}</span>
                            <span className="track-author">{music.author}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
